/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, Input, Space, Spin, Tag, Tooltip, Typography, Upload, message as antMessage } from 'antd';
import {
    CheckCircleFilled,
    ClearOutlined,
    FileAddOutlined,
    FileOutlined,
    LoadingOutlined,
    PaperClipOutlined,
    RobotOutlined,
    SendOutlined,
    StopOutlined,
    UserOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './AiAssistant.css';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    files?: { name: string; type: string }[];
    ticketCreated?: { ticketNumber: number; ticketId: string; isDraft?: boolean };
    isThinking?: boolean;
}

interface TicketPreview {
    title: string;
    description: string;
    specializationId?: string;
    problemId?: string;
    specializationName?: string;
    problemName?: string;
}

const createId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatDescriptionForTicket = (description: string) => {
    const trimmed = description.trim();
    if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
    return trimmed
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('');
};

const AiAssistant: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useSelector((state: any) => state.auth);
    const userRole = typeof user?.role === 'string' ? user.role.toLowerCase() : 'requester';
    const isArabic = i18n.language.startsWith('ar');
    const dir = isArabic ? 'rtl' : 'ltr';
    const apiBaseUrl = window.electronAPI?.apiBaseUrl || '/api';

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [pendingTicket, setPendingTicket] = useState<TicketPreview | null>(null);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [activityStatus, setActivityStatus] = useState<string | null>(null);
    const [isSlowResponse, setIsSlowResponse] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const suggestedPrompts = useMemo(() => [
        t('ai_assistant.prompts.office'),
        t('ai_assistant.prompts.email'),
        t('ai_assistant.prompts.portal'),
        t('ai_assistant.prompts.computer'),
    ], [t, i18n.language]);

    useEffect(() => {
        fetch(`${apiBaseUrl}/v1/ai-assistant/health`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        })
            .then((r) => r.json())
            .then((d: any) => setIsAvailable(d.available))
            .catch(() => setIsAvailable(false));
    }, [apiBaseUrl]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activityStatus, pendingTicket]);

    const appendAssistantMessage = useCallback((content: string, extra?: Partial<ChatMessage>) => {
        setMessages((prev) => [
            ...prev,
            {
                id: createId(),
                role: 'assistant',
                content,
                ...extra,
            },
        ]);
    }, []);

    const createTicketFromPreview = useCallback(async (isDraft: boolean) => {
        if (!pendingTicket) return;
        setIsCreatingTicket(true);
        setActivityStatus(isDraft ? t('ai_assistant.status.savingDraft') : t('ai_assistant.status.submitting'));

        try {
            const res = await fetch(`${apiBaseUrl}/v1/ai-assistant/create-ticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ...pendingTicket,
                    description: formatDescriptionForTicket(pendingTicket.description),
                    isDraft,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || data.message || 'Ticket creation failed');
            }

            setPendingTicket(null);
            appendAssistantMessage(
                isDraft
                    ? t('ai_assistant.draft_created', { ticketNumber: data.ticketNumber })
                    : t('ai_assistant.ticket_created', { ticketNumber: data.ticketNumber }),
                { ticketCreated: { ticketNumber: data.ticketNumber, ticketId: data.ticketId, isDraft } },
            );
            antMessage.success(isDraft ? t('tickets.draftSaved') : t('tickets.created'));
        } catch (err: any) {
            appendAssistantMessage(t('ai_assistant.create_failed', { path: `/${userRole}/tickets/new-ticket` }));
            antMessage.error(err.message || t('errors.submitFailed'));
        } finally {
            setIsCreatingTicket(false);
            setActivityStatus(null);
        }
    }, [apiBaseUrl, appendAssistantMessage, pendingTicket, t, userRole]);

    const sendMessage = useCallback(async (text?: string) => {
        const content = (text || input).trim();
        if ((!content && pendingFiles.length === 0) || isLoading) return;

        const filesMeta = pendingFiles.map((f) => ({ name: f.name, type: f.type }));
        const userMsg: ChatMessage = {
            id: createId(),
            role: 'user',
            content: content || t('ai_assistant.attachmentsOnly'),
            files: filesMeta.length > 0 ? filesMeta : undefined,
        };
        const thinkingMsg: ChatMessage = {
            id: createId(),
            role: 'assistant',
            content: '',
            isThinking: true,
        };

        const history = [...messages.slice(-10), userMsg].map(({ role, content: msgContent }) => ({ role, content: msgContent }));

        setMessages((prev) => [...prev, userMsg, thinkingMsg]);
        setPendingTicket(null);
        setInput('');
        setPendingFiles([]);
        setIsLoading(true);
        setActivityStatus(t('ai_assistant.status.thinking'));
        setIsSlowResponse(false);

        slowTimerRef.current = setTimeout(() => setIsSlowResponse(true), 8000);
        abortRef.current = new AbortController();

        let msgContent = content;
        if (pendingFiles.length > 0) {
            msgContent += `\n[Files: ${pendingFiles.map((f) => f.name).join(', ')}]`;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/v1/ai-assistant/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    'Accept-Language': i18n.language,
                },
                body: JSON.stringify({
                    messages: [...history.slice(0, -1), { role: 'user', content: msgContent }],
                    language: isArabic ? 'ar' : 'en',
                }),
                signal: abortRef.current.signal,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream');

            const decoder = new TextDecoder();
            let buffer = '';
            let streamDone = false;

            while (!streamDone) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split('\n\n');
                buffer = events.pop() || '';

                for (const event of events) {
                    if (!event.startsWith('data: ')) continue;
                    const dataStr = event.slice(6).trim();
                    if (dataStr === '[DONE]') {
                        streamDone = true;
                        break;
                    }

                    try {
                        const data = JSON.parse(dataStr);
                        if (data.content) {
                            setActivityStatus(null);
                            setMessages((prev) => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                updated[updated.length - 1] = {
                                    ...last,
                                    content: `${last.content}${data.content}`,
                                    isThinking: false,
                                };
                                return updated;
                            });
                        }
                        if (data.toolStatus) {
                            setActivityStatus(t('ai_assistant.status.workingOn', { action: data.toolStatus }));
                        }
                        if (data.ticketAction) {
                            setPendingTicket(data.ticketAction);
                            setActivityStatus(t('ai_assistant.status.reviewReady'));
                            setMessages((prev) => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last?.isThinking && !last.content) {
                                    updated[updated.length - 1] = {
                                        ...last,
                                        content: t('ai_assistant.preview_ready'),
                                        isThinking: false,
                                    };
                                }
                                return updated;
                            });
                        }
                    } catch {
                        // Ignore malformed SSE fragments.
                    }
                }
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        id: createId(),
                        role: 'assistant',
                        content: t('ai_assistant.error'),
                        isThinking: false,
                    };
                    return updated;
                });
            }
        } finally {
            setIsLoading(false);
            setIsSlowResponse(false);
            if (!pendingTicket) setActivityStatus(null);
            if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        }
    }, [apiBaseUrl, i18n.language, input, isArabic, isLoading, messages, pendingFiles, pendingTicket, t]);

    const stopGeneration = () => {
        abortRef.current?.abort();
        setIsLoading(false);
        setIsSlowResponse(false);
        setActivityStatus(null);
        if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };

    const clearChat = () => {
        stopGeneration();
        setMessages([]);
        setPendingFiles([]);
        setPendingTicket(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <section className="ai-assistant-shell" dir={dir}>
            <header className="ai-assistant-header">
                <div className="ai-assistant-identity">
                    <div className="ai-assistant-avatar">
                        <RobotOutlined />
                    </div>
                    <div>
                        <Typography.Title level={4} className="ai-assistant-title">
                            {t('ai_assistant.title')}
                        </Typography.Title>
                        <div className="ai-assistant-presence">
                            <span className={isAvailable ? 'is-online' : 'is-offline'} />
                            {isAvailable === null
                                ? t('ai_assistant.checking')
                                : isAvailable
                                    ? t('ai_assistant.online')
                                    : t('ai_assistant.offline')}
                        </div>
                    </div>
                </div>

                <Space>
                    {isSlowResponse && (
                        <Tag color="warning">{t('ai_assistant.status.stillWorking')}</Tag>
                    )}
                    {messages.length > 0 && (
                        <Tooltip title={t('ai_assistant.clear')}>
                            <Button type="text" icon={<ClearOutlined />} onClick={clearChat} />
                        </Tooltip>
                    )}
                </Space>
            </header>

            <main className="ai-assistant-messages">
                {messages.length === 0 ? (
                    <div className="ai-assistant-empty">
                        <div className="ai-assistant-empty-icon">
                            <RobotOutlined />
                        </div>
                        <Typography.Title level={2}>{t('ai_assistant.welcome_title')}</Typography.Title>
                        <Typography.Paragraph type="secondary">
                            {t('ai_assistant.welcome_desc')}
                        </Typography.Paragraph>
                        <div className="ai-assistant-prompts">
                            {suggestedPrompts.map((prompt) => (
                                <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                                    {prompt}
                                </button>
                            ))}
                        </div>
                        <Button icon={<FileAddOutlined />} onClick={() => navigate(`/${userRole}/tickets/new-ticket`)}>
                            {t('ai_assistant.createDirectly')}
                        </Button>
                    </div>
                ) : (
                    <div className="ai-assistant-thread">
                        {messages.map((msg) => (
                            <MessageRow
                                key={msg.id}
                                message={msg}
                                userRole={userRole}
                                navigate={navigate}
                            />
                        ))}

                        {activityStatus && (
                            <div className="ai-assistant-status">
                                <LoadingOutlined />
                                <span>{activityStatus}</span>
                            </div>
                        )}

                        {pendingTicket && (
                            <TicketPreviewCard
                                ticket={pendingTicket}
                                loading={isCreatingTicket}
                                onSubmit={() => createTicketFromPreview(false)}
                                onSaveDraft={() => createTicketFromPreview(true)}
                                onCancel={() => setPendingTicket(null)}
                            />
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {pendingFiles.length > 0 && (
                <div className="ai-assistant-files">
                    {pendingFiles.map((file, index) => (
                        <Tag
                            key={`${file.name}-${index}`}
                            closable
                            onClose={() => setPendingFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                            icon={<FileOutlined />}
                            color="blue"
                        >
                            {file.name}
                        </Tag>
                    ))}
                </div>
            )}

            <footer className="ai-assistant-composer">
                <div className="ai-assistant-input">
                    <Input.TextArea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('ai_assistant.placeholder')}
                        disabled={isLoading}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        variant="borderless"
                    />
                    <div className="ai-assistant-input-actions">
                        <Upload
                            multiple
                            showUploadList={false}
                            beforeUpload={(file) => {
                                setPendingFiles((prev) => [...prev, file]);
                                return false;
                            }}
                            accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                        >
                            <Tooltip title={t('ai_assistant.attach')}>
                                <Button type="text" icon={<PaperClipOutlined />} disabled={isLoading} />
                            </Tooltip>
                        </Upload>

                        <Space size={6}>
                            {isLoading && (
                                <Tooltip title={t('ai_assistant.stop')}>
                                    <Button type="text" danger icon={<StopOutlined />} onClick={stopGeneration} />
                                </Tooltip>
                            )}
                            <Button
                                type="primary"
                                shape="circle"
                                icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                                onClick={() => sendMessage()}
                                disabled={(!input.trim() && pendingFiles.length === 0) || isLoading}
                            />
                        </Space>
                    </div>
                </div>
                <Typography.Text type="secondary" className="ai-assistant-disclaimer">
                    {t('ai_assistant.disclaimer')}
                </Typography.Text>
            </footer>
        </section>
    );
};

const MessageRow: React.FC<{
    message: ChatMessage;
    userRole: string;
    navigate: (path: string) => void;
}> = ({ message, userRole, navigate }) => {
    const { t } = useTranslation();
    const isUser = message.role === 'user';

    return (
        <article className={`ai-message-row ${isUser ? 'is-user' : 'is-assistant'}`}>
            <div className="ai-message-avatar">
                {isUser ? <UserOutlined /> : <RobotOutlined />}
            </div>
            <div className="ai-message-main">
                <div className="ai-message-author">
                    {isUser ? t('ai_assistant.you') : t('ai_assistant.assistantName')}
                </div>
                <div className="ai-message-content">
                    {message.isThinking && !message.content ? (
                        <span className="ai-typing">
                            <span />
                            <span />
                            <span />
                        </span>
                    ) : isUser ? (
                        <p>{message.content}</p>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    )}
                </div>

                {message.files && message.files.length > 0 && (
                    <div className="ai-message-files">
                        {message.files.map((file) => (
                            <Tag key={file.name} icon={<FileOutlined />}>{file.name}</Tag>
                        ))}
                    </div>
                )}

                {message.ticketCreated && (
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleFilled />}
                        className="ai-ticket-link"
                        onClick={() => navigate(`/${userRole}/tickets/${message.ticketCreated!.ticketId}`)}
                    >
                        {message.ticketCreated.isDraft
                            ? t('ai_assistant.viewDraft', { ticketNumber: message.ticketCreated.ticketNumber })
                            : t('ai_assistant.viewTicket', { ticketNumber: message.ticketCreated.ticketNumber })}
                    </Button>
                )}
            </div>
        </article>
    );
};

const TicketPreviewCard: React.FC<{
    ticket: TicketPreview;
    loading: boolean;
    onSubmit: () => void;
    onSaveDraft: () => void;
    onCancel: () => void;
}> = ({ ticket, loading, onSubmit, onSaveDraft, onCancel }) => {
    const { t } = useTranslation();

    return (
        <Card className="ai-ticket-preview" size="small">
            <div className="ai-ticket-preview-header">
                <div>
                    <Typography.Text strong>{t('ai_assistant.reviewTitle')}</Typography.Text>
                    <Typography.Paragraph type="secondary">
                        {t('ai_assistant.reviewSubtitle')}
                    </Typography.Paragraph>
                </div>
                {loading && <Spin size="small" />}
            </div>

            <div className="ai-ticket-preview-grid">
                <span>{t('tickets.title')}</span>
                <strong>{ticket.title}</strong>

                <span>{t('tickets.specialization')}</span>
                <strong>{ticket.specializationName || ticket.specializationId || t('common.empty')}</strong>

                <span>{t('tickets.problemType')}</span>
                <strong>{ticket.problemName || ticket.problemId || t('common.empty')}</strong>

                <span>{t('tickets.description')}</span>
                <Typography.Paragraph>{ticket.description}</Typography.Paragraph>
            </div>

            <Alert type="info" showIcon message={t('ai_assistant.reviewNotice')} />

            <div className="ai-ticket-preview-actions">
                <Button onClick={onCancel} disabled={loading}>
                    {t('common.cancel')}
                </Button>
                <Button onClick={onSaveDraft} loading={loading}>
                    {t('tickets.saveDraft')}
                </Button>
                <Button type="primary" onClick={onSubmit} loading={loading}>
                    {t('tickets.submitTicket')}
                </Button>
            </div>
        </Card>
    );
};

export default AiAssistant;
