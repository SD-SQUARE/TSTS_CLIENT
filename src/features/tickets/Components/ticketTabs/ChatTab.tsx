/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Tag, Upload, Typography, Card, Flex, Spin, Space } from 'antd';
import { PaperClipOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetChatMessagesQuery, useSendMessageMutation, useUploadChatMediaMutation } from '../../store/services/chatApi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TicketChatTab: React.FC<{ assigneeName?: string }> = ({ assigneeName }) => {
    const { t } = useTranslation();
    const { id: ticketId } = useParams();
    const { data: messages, isLoading, refetch } = useGetChatMessagesQuery(ticketId!);
    const [uploadMedia, { isLoading: isUploading }] = useUploadChatMediaMutation();
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

    const [text, setText] = useState('');
    const [pendingMediaIds, setPendingMediaIds] = useState<string[]>([]);
    const [tempFiles, setTempFiles] = useState<{ id: string, name: string }[]>([]);
    const { user } = useSelector((state: any) => state.auth);
    const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

    useEffect(() => { refetch(); }, [refetch]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (messages && messages.length > 0) setOptimisticMessages([]);
    }, [messages]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, optimisticMessages]);

    const isEditorEmpty = (content: string) => {
        if (!content) return true;
        const stripped = content.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim();
        return stripped.length === 0 && pendingMediaIds.length === 0;
    };

    const quillRef = useRef<any>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = async () => {
        if (isEditorEmpty(text)) {
            return;
        }

        const messageContent = text;
        const mediaIdsToSend = [...pendingMediaIds];
        const mediaPreviews = [...tempFiles];
        const tempId = `temp-${Date.now()}`;

        const optimisticMsg = {
            id: tempId,
            message: messageContent,
            createdAt: new Date().toISOString(),
            sender: {
                id: user.id,
                name: user.name || t('common.me'),
                image: user.image
            },
            media: mediaPreviews.map(f => ({ id: f.id, fileName: f.name, url: '#' })),
            isSending: true
        };

        setOptimisticMessages(prev => [...prev, optimisticMsg]);
        setText('');
        setPendingMediaIds([]);
        setTempFiles([]);

        try {
            const payload = {
                ticketId: ticketId!,
                message: messageContent,
                mediaIds: mediaIdsToSend,
                userID: user.id
            };

            const response = await sendMessage(payload).unwrap();
        } catch (error) {
            console.error("API ERROR:", error);
            setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleFileUpload = async (options: any) => {
        const { file } = options;
        const formData = new FormData();
        formData.append('files', file);
        try {
            const response = await uploadMedia({ ticketId: ticketId!, formData }).unwrap();
            if (Array.isArray(response) && response.length > 0) {
                const newIds = response.map((item: any) => item.id);
                setPendingMediaIds(prev => [...prev, ...newIds]);
                setTempFiles(prev => [...prev, { id: newIds[0], name: file.name }]);
            }
        } catch (error) {
            console.error(t('errors.uploadFailed'), error);
        }
    };

    const removeAttachment = (id: string) => {
        setPendingMediaIds(prev => prev.filter(item => item !== id));
        setTempFiles(prev => prev.filter(item => item.id !== id));
    };

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'clean']
        ],
        keyboard: {
            bindings: {
                handleEnter: {
                    key: 13,
                    handler: function () {
                        handleSend();
                    }
                }
            }
        }
    };

    if (isLoading) return <Spin style={{ display: 'block', margin: '50px auto' }} />;
    const allMessages = [...(messages || []), ...optimisticMessages];

    return (
        <Flex vertical style={{
            height: 'calc(100vh - 200px)',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            <style>{`
                .quill-chat-editor .ql-container {
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                    border: none !important;
                    font-size: 14px;
                }
                .quill-chat-editor .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                    padding: 4px 8px !important;
                }
                .message-content img { max-width: 100%; border-radius: 4px; }
                .message-content p { margin-bottom: 4px; }
            `}</style>

            <div style={{ padding: '16px' }}>
                <Tag color="processing" icon={<UserOutlined />} style={{ padding: '4px 12px' }}>
                    {t('tickets.assignedTo')}: <strong>{assigneeName || t('tickets.unassigned')}</strong>
                </Tag>
            </div>

            <Flex
                vertical
                gap="small"
                ref={scrollRef}
                style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}
            >
                {allMessages.map((item) => {
                    const isMe = String(item.sender.id) === String(user.id);
                    return (
                        <Flex key={item.id} justify={isMe ? 'end' : 'start'} style={{ marginBottom: '8px' }}>
                            <Flex vertical align={isMe ? 'end' : 'start'} gap={4} style={{ maxWidth: '75%' }}>
                                <Space style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                    <Typography.Text strong style={{ fontSize: '11px' }}>
                                        {isMe ? t('common.me') : item.sender.name}
                                    </Typography.Text>
                                    <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                                        {dayjs(item.createdAt).format('h:mm A')}
                                    </Typography.Text>
                                </Space>

                                <Flex align="start" gap="small" style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                    <Avatar src={item.sender.image} size="small" style={{ flexShrink: 0 }} />
                                    <Flex vertical align={isMe ? 'end' : 'start'} gap={4}>
                                        <div
                                            className="message-content"
                                            style={{
                                                background: isMe ? '#1677ff' : '#fff',
                                                color: isMe ? '#fff' : 'rgba(0, 0, 0, 0.88)',
                                                padding: '8px 14px',
                                                borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                                opacity: item.isSending ? 0.6 : 1,
                                                wordBreak: 'break-word'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: item.message }}
                                        />
                                        {item.media?.length > 0 && (
                                            <Flex gap="small" wrap="wrap" justify={isMe ? 'end' : 'start'} style={{ marginTop: '4px' }}>
                                                {item.media.map((m: any) => (
                                                    <Card
                                                        key={m.id}
                                                        size="small"
                                                        styles={{ body: { padding: '6px 10px' } }}
                                                        style={{
                                                            minWidth: 120,
                                                            maxWidth: 200,
                                                            background: isMe ? 'rgba(22, 119, 255, 0.1)' : '#fff',
                                                            borderColor: '#d9d9d9',
                                                            borderRadius: '8px'
                                                        }}
                                                    >
                                                        <Typography.Link href={m.url} target="_blank" ellipsis style={{ fontSize: '12px', display: 'block' }}>
                                                            <PaperClipOutlined /> {m.fileName}
                                                        </Typography.Link>
                                                    </Card>
                                                ))}
                                            </Flex>
                                        )}
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    );
                })}
            </Flex>

            <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '12px',
                    background: '#fff',
                    overflow: 'hidden'
                }}>
                    {tempFiles.length > 0 && (
                        <Flex gap="8px" style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }} wrap="wrap">
                            {tempFiles.map((file) => (
                                <Tag key={file.id} closable onClose={() => removeAttachment(file.id)} color="blue">
                                    <PaperClipOutlined /> {file.name}
                                </Tag>
                            ))}
                        </Flex>
                    )}

                    <div className="quill-chat-editor" onKeyDown={handleKeyDown}>
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={text}
                            onChange={setText}
                            modules={modules}
                            placeholder={t('chat.placeholder')}
                        />
                    </div>

                    <Flex align="center" justify="space-between" style={{ padding: '4px 8px', background: '#fafafa' }}>
                        <Upload customRequest={handleFileUpload} showUploadList={false} multiple disabled={isUploading}>
                            <Button type="text" icon={<PaperClipOutlined />} loading={isUploading}>

                            </Button>
                        </Upload>
                        <Button
                            type="primary"
                            shape="round"
                            icon={<SendOutlined />}
                            onClick={handleSend}
                            loading={isSending}
                            disabled={isUploading || isEditorEmpty(text)}
                        >
                        </Button>
                    </Flex>
                </div>
            </div>
        </Flex>
    );
};

export default TicketChatTab;