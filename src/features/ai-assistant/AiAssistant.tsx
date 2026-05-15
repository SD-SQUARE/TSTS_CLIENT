/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Upload, message as antMessage, Spin, Tag, Tooltip } from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    ClearOutlined,
    LoadingOutlined,
    PaperClipOutlined,
    FileOutlined,
    FileAddOutlined,
    CheckCircleFilled,
    StopOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    files?: { name: string; type: string }[];
    ticketCreated?: { ticketNumber: number; ticketId: string };
    isThinking?: boolean;
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
    const [toolStatus, setToolStatus] = useState<string | null>(null);
    const [isSlowResponse, setIsSlowResponse] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const suggestedPrompts = isArabic ? SUGGESTED_PROMPTS_AR : SUGGESTED_PROMPTS_EN;
    const dir = isArabic ? 'rtl' : 'ltr';

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
    }, [messages, toolStatus]);

    const handleTicketAction = useCallback(async (ticketData: any) => {
        setIsCreatingTicket(true);
        try {
            const res = await fetch('/api/v1/ai-assistant/create-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify(ticketData),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: isArabic
                        ? `✅ **تم إنشاء تذكرة الدعم بنجاح!**\n\n**رقم التذكرة:** #${data.ticketNumber}\n\nسيتواصل معك فريق الدعم التقني قريباً.`
                        : `✅ **Support ticket created successfully!**\n\n**Ticket Number:** #${data.ticketNumber}\n\nThe technical support team will contact you soon.`,
                    ticketCreated: { ticketNumber: data.ticketNumber, ticketId: data.ticketId },
                }]);
                antMessage.success(isArabic ? 'تم إنشاء التذكرة بنجاح' : 'Ticket created successfully');
            } else throw new Error(data.error);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: isArabic
                    ? `❌ فشل إنشاء التذكرة. يمكنك [إنشاؤها يدوياً](/${userRole}/tickets/new-ticket).`
                    : `❌ Ticket creation failed. You can [create it manually](/${userRole}/tickets/new-ticket).`,
            }]);
        } finally {
            setIsCreatingTicket(false);
        }
    }, [isArabic, userRole]);

    const sendMessage = useCallback(async (text?: string) => {
        const content = (text || input).trim();
        if (!content && pendingFiles.length === 0) return;
        if (isLoading) return;

        const filesMeta = pendingFiles.map(f => ({ name: f.name, type: f.type }));
        const userMsg: Message = {
            role: 'user',
            content: content || (isArabic ? 'مرفقات:' : 'Attachments:'),
            files: filesMeta.length > 0 ? filesMeta : undefined,
        };

        setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', isThinking: true }]);
        setInput('');
        setPendingFiles([]);
        setIsLoading(true);
        setToolStatus(null);

        slowTimerRef.current = setTimeout(() => setIsSlowResponse(true), 8000);
        abortRef.current = new AbortController();

        let msgContent = content;
        if (pendingFiles.length > 0) msgContent += `\n[Files: ${pendingFiles.map(f => f.name).join(', ')}]`;

        try {
            const response = await fetch('/api/v1/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    'Accept-Language': i18n.language,
                },
                body: JSON.stringify({
                    messages: [...messages.slice(-8), { role: 'user', content: msgContent }],
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
                            setToolStatus(null);
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                updated[updated.length - 1] = { ...last, content: last.content + data.content, isThinking: false };
                                return updated;
                            });
                        }
                        if (data.toolStatus) setToolStatus(data.toolStatus);
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
                        content: isArabic ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Sorry, an error occurred. Please try again.',
                        isThinking: false,
                    };
                    return updated;
                });
            }
        } finally {
            setIsLoading(false);
            setIsSlowResponse(false);
            setToolStatus(null);
            if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        }
    }, [input, isLoading, messages, isArabic, i18n.language, pendingFiles, handleTicketAction]);

    const stopGeneration = () => {
        abortRef.current?.abort();
        setIsLoading(false);
        setIsSlowResponse(false);
        setToolStatus(null);
        if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };

    const clearChat = () => {
        stopGeneration();
        setMessages([]);
        setPendingFiles([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 500, direction: dir }}>
            {/* ── Header ── */}
            <div style={{
                padding: '12px 20px', borderBottom: '1px solid #e5e5e5',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fff', flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1677ff, #0958d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>
                            {t('ai_assistant.title', 'AI Assistant')}
                        </div>
                        <div style={{ fontSize: 11, color: isAvailable ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAvailable ? '#52c41a' : '#ff4d4f', display: 'inline-block' }} />
                            {isAvailable === null ? t('ai_assistant.checking', 'Checking...')
                                : isAvailable ? t('ai_assistant.online', 'Online')
                                    : t('ai_assistant.offline', 'Offline')}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    {isSlowResponse && (
                        <Tag color="warning" style={{ fontSize: 11 }}>
                            {isArabic ? 'المعالجة تستغرق وقتاً...' : 'Processing on CPU...'}
                        </Tag>
                    )}
                    {messages.length > 0 && (
                        <Tooltip title={t('ai_assistant.clear', 'Clear chat')}>
                            <Button type="text" icon={<ClearOutlined />} onClick={clearChat} size="small" style={{ color: '#8c8c8c' }} />
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* ── Messages ── */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '24px 0',
                background: '#fff', display: 'flex', flexDirection: 'column',
            }}>
                {messages.length === 0 ? (
                    /* Welcome screen */
                    <div style={{ margin: 'auto', maxWidth: 560, padding: '0 24px', textAlign: 'center' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1677ff, #0958d9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <RobotOutlined style={{ color: '#fff', fontSize: 30 }} />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#111', marginBottom: 8 }}>
                            {t('ai_assistant.welcome_title', 'How can I help you?')}
                        </h2>
                        <p style={{ color: '#666', marginBottom: 28, fontSize: 14 }}>
                            {t('ai_assistant.welcome_desc', 'Describe your problem and I will help you solve it or create a support ticket.')}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                            {suggestedPrompts.map((prompt, i) => (
                                <button key={i} onClick={() => sendMessage(prompt)} style={{
                                    padding: '10px 16px', borderRadius: 20,
                                    border: '1px solid #e5e5e5', background: '#fafafa',
                                    cursor: 'pointer', fontSize: 13, color: '#333',
                                    transition: 'all 0.15s', fontFamily: 'inherit',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f0f5ff'; e.currentTarget.style.borderColor = '#1677ff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                        <Button type="default" icon={<FileAddOutlined />} onClick={() => navigate(`/${userRole}/tickets/new-ticket`)}>
                            {isArabic ? 'إنشاء تذكرة مباشرة' : 'Create Ticket Directly'}
                        </Button>
                    </div>
                ) : (
                    <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {messages.map((msg, idx) => (
                            <MessageRow
                                key={idx}
                                message={msg}
                                isArabic={isArabic}
                                userRole={userRole}
                                navigate={navigate}
                            />
                        ))}

                        {/* Tool status pill */}
                        {toolStatus && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', paddingInlineStart: 44 }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '4px 12px', borderRadius: 20,
                                    background: '#f0f5ff', border: '1px solid #d6e4ff',
                                    fontSize: 12, color: '#1677ff',
                                }}>
                                    <LoadingOutlined style={{ fontSize: 11 }} />
                                    {isArabic ? `جارٍ البحث عن ${toolStatus}...` : `Searching ${toolStatus}...`}
                                </div>
                            </div>
                        )}

                        {/* Creating ticket spinner */}
                        {isCreatingTicket && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', paddingInlineStart: 44 }}>
                                <Spin size="small" />
                                <span style={{ fontSize: 13, color: '#666' }}>
                                    {isArabic ? 'جارٍ إنشاء التذكرة...' : 'Creating ticket...'}
                                </span>
                            </div>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Pending files ── */}
            {pendingFiles.length > 0 && (
                <div style={{ padding: '8px 24px', background: '#f8f9fa', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {pendingFiles.map((f, i) => (
                        <Tag key={i} closable onClose={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} icon={<FileOutlined />} color="blue">
                            {f.name.length > 24 ? f.name.substring(0, 24) + '...' : f.name}
                        </Tag>
                    ))}
                </div>
            )}

            {/* ── Input area ── */}
            <div style={{ padding: '12px 24px 16px', background: '#fff', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
                <div style={{
                    maxWidth: 760, margin: '0 auto',
                    border: '1px solid #e5e5e5', borderRadius: 16,
                    background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                    onFocus={() => { }}
                >
                    <Input.TextArea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('ai_assistant.placeholder', 'Describe your problem... (Enter to send)')}
                        disabled={isLoading}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        style={{
                            border: 'none', boxShadow: 'none', resize: 'none',
                            padding: '14px 16px', fontSize: 14, background: 'transparent',
                        }}
                        variant="borderless"
                    />
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderTop: '1px solid #f5f5f5',
                    }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <Upload multiple showUploadList={false}
                                beforeUpload={(file) => { setPendingFiles(prev => [...prev, file]); return false; }}
                                accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls">
                                <Tooltip title={isArabic ? 'إرفاق ملف' : 'Attach file'}>
                                    <Button type="text" icon={<PaperClipOutlined />} size="small" disabled={isLoading} style={{ color: '#8c8c8c' }} />
                                </Tooltip>
                            </Upload>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {isLoading && (
                                <Tooltip title={isArabic ? 'إيقاف' : 'Stop'}>
                                    <Button type="text" icon={<StopOutlined />} size="small" onClick={stopGeneration} style={{ color: '#ff4d4f' }} />
                                </Tooltip>
                            )}
                            <Button
                                type="primary"
                                shape="circle"
                                size="small"
                                icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                                onClick={() => sendMessage()}
                                disabled={(!input.trim() && pendingFiles.length === 0) || isLoading}
                                style={{ width: 32, height: 32 }}
                            />
                        </div>
                    </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 8, marginBottom: 0 }}>
                    {t('ai_assistant.disclaimer', 'AI may make mistakes. For urgent issues, create a ticket directly.')}
                </p>
            </div>
        </div>
    );
};

/* ── Message Row (ChatGPT style) ── */
const MessageRow: React.FC<{
    message: Message;
    isArabic: boolean;
    userRole: string;
    navigate: (p: string) => void;
}> = ({ message, isArabic, userRole, navigate }) => {
    const isUser = message.role === 'user';

    return (
        <div style={{
            display: 'flex', gap: 12, padding: '12px 0',
            flexDirection: isUser ? (isArabic ? 'row-reverse' : 'row') : 'row',
            alignItems: 'flex-start',
        }}>
            {/* Avatar */}
            <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: isUser ? '#1677ff' : '#f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
            }}>
                {isUser
                    ? <UserOutlined style={{ color: '#fff', fontSize: 15 }} />
                    : <RobotOutlined style={{ color: '#555', fontSize: 15 }} />
                }
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4,
                    textAlign: isUser && isArabic ? 'right' : isUser ? 'right' : 'left',
                }}>
                    {isUser ? (isArabic ? 'أنت' : 'You') : (isArabic ? 'المساعد الذكي' : 'AI Assistant')}
                </div>

                {/* Message bubble */}
                {isUser ? (
                    <div style={{
                        background: '#1677ff', color: '#fff',
                        borderRadius: isArabic ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                        padding: '10px 14px', fontSize: 14, lineHeight: 1.6,
                        display: 'inline-block', maxWidth: '85%',
                        wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                        float: isArabic ? 'right' : 'right',
                    }}>
                        {message.content}
                    </div>
                ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: '#111' }}>
                        {message.isThinking && message.content === '' ? (
                            <TypingDots />
                        ) : (
                            <div className="ai-prose">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                )}

                {/* File attachments */}
                {message.files && message.files.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                        {message.files.map((f, i) => (
                            <Tag key={i} icon={<FileOutlined />} color={isUser ? 'blue' : 'default'}>{f.name}</Tag>
                        ))}
                    </div>
                )}

                {/* Ticket created badge */}
                {message.ticketCreated && (
                    <div style={{ marginTop: 10 }}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleFilled />}
                            onClick={() => navigate(`/${userRole}/tickets/${message.ticketCreated!.ticketId}`)}
                            style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 20 }}
                        >
                            {isArabic ? `عرض التذكرة #${message.ticketCreated.ticketNumber}` : `View Ticket #${message.ticketCreated.ticketNumber}`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const TypingDots: React.FC = () => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 24 }}>
        {[0, 1, 2].map(i => (
            <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%', background: '#bbb',
                animation: `ai-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
        ))}
        <style>{`
            @keyframes ai-bounce {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-5px); opacity: 1; }
            }
            .ai-prose p { margin: 0 0 10px; }
            .ai-prose p:last-child { margin-bottom: 0; }
            .ai-prose ul, .ai-prose ol { padding-inline-start: 22px; margin: 6px 0; }
            .ai-prose li { margin: 3px 0; }
            .ai-prose code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: monospace; }
            .ai-prose pre { background: #f5f5f5; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; }
            .ai-prose pre code { background: none; padding: 0; }
            .ai-prose h1, .ai-prose h2, .ai-prose h3 { margin: 12px 0 6px; font-weight: 600; }
            .ai-prose strong { font-weight: 600; }
            .ai-prose blockquote { border-inline-start: 3px solid #1677ff; padding-inline-start: 12px; margin: 6px 0; color: #666; }
            .ai-prose a { color: #1677ff; text-decoration: underline; }
            .ai-prose table { border-collapse: collapse; width: 100%; margin: 8px 0; }
            .ai-prose th, .ai-prose td { border: 1px solid #e5e5e5; padding: 6px 10px; text-align: left; }
            .ai-prose th { background: #fafafa; font-weight: 600; }
        `}</style>
    </div>
);

export default AiAssistant;
