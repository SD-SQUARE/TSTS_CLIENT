/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Tooltip, Typography, Tag, Upload, message as antMessage, Spin } from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    ClearOutlined,
    LoadingOutlined,
    BulbOutlined,
    PaperClipOutlined,
    FileOutlined,
    FileAddOutlined,
    CheckCircleFilled,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const { Text } = Typography;

interface Message {
    role: 'user' | 'assistant';
    content: string;
    files?: { name: string; type: string }[];
    ticketCreated?: { ticketNumber: number; ticketId: string };
}

const SUGGESTED_PROMPTS_EN = [
    'I have a problem with my email',
    'I cannot access the university portal',
    'My computer is not working properly',
    'I need help with Microsoft Office',
];

const SUGGESTED_PROMPTS_AR = [
    'لدي مشكلة في البريد الإلكتروني',
    'لا أستطيع الوصول إلى البوابة الإلكترونية',
    'جهاز الكمبيوتر لا يعمل بشكل صحيح',
    'أحتاج مساعدة في برامج Office',
];

const AiAssistant: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useSelector((state: any) => state.auth);
    const userRole = typeof user?.role === 'string' ? user.role.toLowerCase() : 'requester';
    const isArabic = i18n.language.startsWith('ar');

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [isSlowResponse, setIsSlowResponse] = useState(false);
    const [toolStatus, setToolStatus] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const suggestedPrompts = isArabic ? SUGGESTED_PROMPTS_AR : SUGGESTED_PROMPTS_EN;

    useEffect(() => {
        fetch('/api/v1/ai-assistant/health', {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        })
            .then(r => r.json())
            .then((d: any) => setIsAvailable(d.available))
            .catch(() => setIsAvailable(false));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-create ticket when AI sends ticketAction
    const handleTicketAction = useCallback(async (ticketData: any) => {
        setIsCreatingTicket(true);
        try {
            const res = await fetch('/api/v1/ai-assistant/create-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    title: ticketData.title,
                    description: ticketData.description,
                    specializationId: ticketData.specializationId,
                    problemId: ticketData.problemId,
                }),
            });
            const data = await res.json();
            if (data.success) {
                const successMsg: Message = {
                    role: 'assistant',
                    content: isArabic
                        ? `✅ **تم إنشاء تذكرة الدعم بنجاح!**\n\n**رقم التذكرة:** #${data.ticketNumber}\n\nسيتواصل معك فريق الدعم التقني قريباً. يمكنك متابعة حالة تذكرتك من قسم التذاكر.`
                        : `✅ **Support ticket created successfully!**\n\n**Ticket Number:** #${data.ticketNumber}\n\nThe technical support team will contact you soon. You can track your ticket in the Tickets section.`,
                    ticketCreated: { ticketNumber: data.ticketNumber, ticketId: data.ticketId },
                };
                setMessages(prev => [...prev, successMsg]);
                antMessage.success(isArabic ? 'تم إنشاء التذكرة بنجاح' : 'Ticket created successfully');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            const errMsg: Message = {
                role: 'assistant',
                content: isArabic
                    ? `❌ عذراً، فشل إنشاء التذكرة: ${err.message || 'خطأ غير معروف'}. يمكنك [إنشاء التذكرة يدوياً](/${userRole}/tickets/new-ticket).`
                    : `❌ Sorry, ticket creation failed: ${err.message || 'Unknown error'}. You can [create the ticket manually](/${userRole}/tickets/new-ticket).`,
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsCreatingTicket(false);
        }
    }, [isArabic, userRole]);

    const sendMessage = useCallback(async (text?: string) => {
        const content = (text || input).trim();
        const attachedFiles = pendingFiles;
        if (!content && attachedFiles.length === 0) return;
        if (isLoading) return;

        const filesMeta = attachedFiles.map(f => ({ name: f.name, type: f.type }));
        const userMessage: Message = {
            role: 'user',
            content: content || (isArabic ? 'مرفقات:' : 'Attachments:'),
            files: filesMeta.length > 0 ? filesMeta : undefined,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setPendingFiles([]);
        setIsLoading(true);

        // Add empty assistant placeholder
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        abortRef.current = new AbortController();

        // Show slow-response warning after 8 seconds (CPU inference is slow)
        const slowTimer = setTimeout(() => setIsSlowResponse(true), 8000);

        let messageContent = content;
        if (attachedFiles.length > 0) {
            messageContent += `\n[Attached files: ${attachedFiles.map(f => f.name).join(', ')}]`;
        }

        try {
            const response = await fetch('/api/v1/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    'Accept-Language': i18n.language,
                },
                body: JSON.stringify({
                    messages: [...messages.slice(-12), { role: 'user', content: messageContent }],
                    language: isArabic ? 'ar' : 'en',
                }),
                signal: abortRef.current.signal,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No stream');

            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                for (const line of chunk.split('\n\n').filter(Boolean)) {
                    if (!line.startsWith('data: ')) continue;
                    const dataStr = line.replace('data: ', '');
                    if (dataStr === '[DONE]') { setIsLoading(false); break; }

                    try {
                        const data = JSON.parse(dataStr);

                        if (data.content) {
                            setToolStatus(null); // Clear tool status when content arrives
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                updated[updated.length - 1] = { ...last, content: last.content + data.content };
                                return updated;
                            });
                        }

                        // Tool is being called - show status indicator
                        if (data.toolStatus) {
                            setToolStatus(data.toolStatus);
                        }

                        // AI decided to create a ticket
                        if (data.ticketAction) {
                            setIsLoading(false);
                            setToolStatus(null);
                            handleTicketAction(data.ticketAction);
                        }
                    } catch { /* skip */ }
                }
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: isArabic
                            ? 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
                            : 'Sorry, there was a connection error. Please try again.',
                    };
                    return updated;
                });
            }
        } finally {
            setIsLoading(false);
            setIsSlowResponse(false);
            setToolStatus(null);
            clearTimeout(slowTimer);
        }
    }, [input, isLoading, messages, isArabic, i18n.language, pendingFiles, handleTicketAction]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        abortRef.current?.abort();
        setMessages([]);
        setIsLoading(false);
        setIsSlowResponse(false);
        setToolStatus(null);
        setPendingFiles([]);
    };

    const direction = isArabic ? 'rtl' : 'ltr';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 130px)',
            minHeight: 500,
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e8e8e8',
            direction,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
            {/* Header */}
            <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
                color: '#fff',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <RobotOutlined style={{ fontSize: 22 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                            {t('ai_assistant.title', 'AI Assistant')}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.85 }}>
                            {isAvailable === null ? t('ai_assistant.checking', 'Checking...')
                                : isAvailable ? t('ai_assistant.online', 'Online')
                                    : t('ai_assistant.offline', 'Offline - Limited mode')}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {isCreatingTicket && (
                        <Tag color="processing" icon={<LoadingOutlined />}>
                            {isArabic ? 'جارٍ إنشاء التذكرة...' : 'Creating ticket...'}
                        </Tag>
                    )}
                    {isSlowResponse && !isCreatingTicket && (
                        <Tag color="warning" icon={<LoadingOutlined />} style={{ fontSize: 11 }}>
                            {isArabic ? 'المعالجة تستغرق وقتاً (CPU)...' : 'Processing on CPU, please wait...'}
                        </Tag>
                    )}
                    {messages.length > 0 && (
                        <Tooltip title={t('ai_assistant.clear', 'Clear chat')}>
                            <Button
                                type="text"
                                icon={<ClearOutlined />}
                                onClick={clearChat}
                                style={{ color: '#fff', opacity: 0.8 }}
                                size="small"
                            />
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: '#f8f9fa',
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', maxWidth: 500 }}>
                        <RobotOutlined style={{ fontSize: 52, color: '#1677ff', marginBottom: 16 }} />
                        <Typography.Title level={4} style={{ color: '#333', marginBottom: 8 }}>
                            {t('ai_assistant.welcome_title', 'How can I help you?')}
                        </Typography.Title>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                            {t('ai_assistant.welcome_desc', 'Describe your problem and I will help you solve it or create a support ticket.')}
                        </Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                            {suggestedPrompts.map((prompt, i) => (
                                <button key={i} onClick={() => sendMessage(prompt)}
                                    style={{
                                        padding: '8px 14px', borderRadius: 20,
                                        border: '1px solid #d9d9d9', background: '#fff',
                                        cursor: 'pointer', fontSize: 13, color: '#333',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        transition: 'border-color 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1677ff')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#d9d9d9')}
                                >
                                    <BulbOutlined style={{ color: '#faad14', fontSize: 12 }} />
                                    {prompt}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: 24 }}>
                            <Button
                                type="primary"
                                ghost
                                icon={<FileAddOutlined />}
                                onClick={() => navigate(`/${userRole}/tickets/new-ticket`)}
                            >
                                {isArabic ? 'إنشاء تذكرة مباشرة' : 'Create Ticket Directly'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <MessageBubble
                            key={idx}
                            message={msg}
                            isLoading={isLoading && idx === messages.length - 1}
                            isArabic={isArabic}
                            userRole={userRole}
                            navigate={navigate}
                        />
                    ))
                )}
                {isCreatingTicket && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                        <Spin tip={isArabic ? 'جارٍ إنشاء التذكرة...' : 'Creating your ticket...'} />
                    </div>
                )}
                {/* Tool status indicator */}
                {toolStatus && !isCreatingTicket && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px', background: '#f0f5ff',
                        borderRadius: 20, alignSelf: 'flex-start',
                        fontSize: 12, color: '#1677ff',
                        border: '1px solid #d6e4ff',
                    }}>
                        <LoadingOutlined style={{ fontSize: 12 }} />
                        {isArabic ? `جارٍ البحث عن ${toolStatus}...` : `Searching ${toolStatus}...`}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Pending files */}
            {pendingFiles.length > 0 && (
                <div style={{
                    padding: '8px 16px', background: '#f0f5ff',
                    borderTop: '1px solid #d6e4ff',
                    display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0,
                }}>
                    {pendingFiles.map((f, i) => (
                        <Tag key={i} closable
                            onClose={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                            icon={<FileOutlined />} color="blue">
                            {f.name.length > 20 ? f.name.substring(0, 20) + '...' : f.name}
                        </Tag>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fff', flexShrink: 0 }}>
                <div style={{
                    display: 'flex', gap: 8, alignItems: 'flex-end',
                    background: '#f5f5f5', borderRadius: 12,
                    padding: '8px 12px', border: '1px solid #e8e8e8',
                }}>
                    <Upload multiple showUploadList={false}
                        beforeUpload={(file) => { setPendingFiles(prev => [...prev, file]); return false; }}
                        accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls">
                        <Tooltip title={isArabic ? 'إرفاق ملف' : 'Attach file'}>
                            <Button type="text" icon={<PaperClipOutlined />}
                                style={{ color: '#8c8c8c', flexShrink: 0 }} disabled={isLoading} />
                        </Tooltip>
                    </Upload>

                    <Input.TextArea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('ai_assistant.placeholder', 'Describe your problem... (Enter to send)')}
                        disabled={isLoading}
                        autoSize={{ minRows: 1, maxRows: 5 }}
                        style={{ flex: 1, border: 'none', background: 'transparent', resize: 'none', boxShadow: 'none', padding: 0, fontSize: 14 }}
                        variant="borderless"
                    />
                    <Button
                        type="primary" shape="circle"
                        icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                        onClick={() => sendMessage()}
                        disabled={(!input.trim() && pendingFiles.length === 0) || isLoading}
                        style={{ flexShrink: 0, marginBottom: 2 }}
                    />
                </div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: 'center', marginTop: 6 }}>
                    {t('ai_assistant.disclaimer', 'AI may make mistakes. For urgent issues, create a ticket directly.')}
                </Text>
            </div>
        </div>
    );
};

// ─── Message Bubble ──────────────────────────────────────────────────────────

interface MessageBubbleProps {
    message: Message;
    isLoading: boolean;
    isArabic: boolean;
    userRole: string;
    navigate: (path: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading, isArabic, userRole, navigate }) => {
    const isUser = message.role === 'user';

    return (
        <div style={{
            display: 'flex',
            gap: 10,
            flexDirection: isUser ? (isArabic ? 'row' : 'row-reverse') : (isArabic ? 'row-reverse' : 'row'),
            alignItems: 'flex-start',
        }}>
            <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isUser ? '#1677ff' : '#f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
            }}>
                {isUser
                    ? <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
                    : <RobotOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                }
            </div>

            <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{
                    background: isUser ? '#1677ff' : '#fff',
                    color: isUser ? '#fff' : '#333',
                    borderRadius: isUser
                        ? (isArabic ? '18px 18px 18px 4px' : '18px 18px 4px 18px')
                        : (isArabic ? '18px 18px 4px 18px' : '18px 18px 18px 4px'),
                    padding: '10px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word',
                }}>
                    {isLoading && message.content === '' ? (
                        <TypingIndicator />
                    ) : isUser ? (
                        <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
                    ) : (
                        <div className="ai-markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* File attachments */}
                {message.files && message.files.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {message.files.map((f, i) => (
                            <Tag key={i} icon={<FileOutlined />} color={isUser ? 'blue' : 'default'}>{f.name}</Tag>
                        ))}
                    </div>
                )}

                {/* Ticket created badge */}
                {message.ticketCreated && (
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleFilled />}
                        onClick={() => navigate(`/${userRole}/tickets/${message.ticketCreated!.ticketId}`)}
                        style={{ alignSelf: isArabic ? 'flex-end' : 'flex-start', background: '#52c41a', borderColor: '#52c41a' }}
                    >
                        {isArabic ? `عرض التذكرة #${message.ticketCreated.ticketNumber}` : `View Ticket #${message.ticketCreated.ticketNumber}`}
                    </Button>
                )}
            </div>
        </div>
    );
};

const TypingIndicator: React.FC = () => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
        {[0, 1, 2].map(i => (
            <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: '#1677ff',
                animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
        ))}
        <style>{`
            @keyframes typing-bounce {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-6px); opacity: 1; }
            }
            .ai-markdown p { margin: 0 0 8px; }
            .ai-markdown p:last-child { margin-bottom: 0; }
            .ai-markdown ul, .ai-markdown ol { padding-inline-start: 20px; margin: 4px 0; }
            .ai-markdown li { margin: 2px 0; }
            .ai-markdown code { background: #f0f0f0; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
            .ai-markdown pre { background: #f5f5f5; padding: 10px; border-radius: 6px; overflow-x: auto; }
            .ai-markdown pre code { background: none; padding: 0; }
            .ai-markdown h1, .ai-markdown h2, .ai-markdown h3 { margin: 8px 0 4px; }
            .ai-markdown strong { font-weight: 600; }
            .ai-markdown blockquote { border-inline-start: 3px solid #1677ff; padding-inline-start: 10px; margin: 4px 0; color: #666; }
            .ai-markdown a { color: #1677ff; }
        `}</style>
    </div>
);

export default AiAssistant;
