/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Input, Button, Tag, Upload, Typography, Card, Flex, Spin, Space } from 'antd';
import {  PaperClipOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetChatMessagesQuery, useSendMessageMutation, useUploadChatMediaMutation } from '../../store/services/chatApi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

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

    useEffect(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (messages && messages.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOptimisticMessages([]);
        }
    }, [messages]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, optimisticMessages]);

    const handleSend = async () => {
        if (!text.trim() && pendingMediaIds.length === 0) return;
        // console.log('Sending message:', {text, pendingMediaIds});
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
            await sendMessage({ 
                ticketId: ticketId!, 
                message: messageContent, 
                mediaIds: mediaIdsToSend, 
                userID: user.id 
            }).unwrap();
        } catch (error) {
            setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
            console.error("Failed to send message", error);
        }
        // console.log('Message sent:', text, pendingMediaIds);
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

                // console.log('Updated Pending IDs:', [...pendingMediaIds, ...newIds]);
            }
        } catch (error) {
            console.error(t('errors.uploadFailed'), error);
        }
    };

    const removeAttachment = (id: string) => {
        setPendingMediaIds(prev => prev.filter(item => item !== id));
        setTempFiles(prev => prev.filter(item => item.id !== id));
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
                        <Flex 
                            key={item.id} 
                            justify={isMe ? 'end' : 'start'} 
                            style={{ marginBottom: '8px' }}
                        >
                            <Flex 
                                vertical 
                                align={isMe ? 'end' : 'start'} 
                                gap={4} 
                                style={{ maxWidth: '75%' }}
                            >
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
                                        <div style={{
                                            background: isMe ? '#1677ff' : '#fff',
                                            color: isMe ? '#fff' : 'rgba(0, 0, 0, 0.88)',
                                            padding: '8px 14px',
                                            borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                            opacity: item.isSending ? 0.6 : 1,
                                            wordBreak: 'break-word'
                                        }}>
                                            <Typography.Text style={{ color: 'inherit' }}>
                                                {item.message}
                                            </Typography.Text>
                                        </div>

                                        {item.media?.length > 0 && (
                                            <Flex gap="small" wrap="wrap" justify={isMe ? 'end' : 'start'}>
                                                {item.media.map((m: any) => (
                                                    <Card 
                                                        key={m.id} 
                                                        size="small" 
                                                        styles={{ body: { padding: '6px 10px' } }}
                                                        style={{ 
                                                            minWidth: 120, 
                                                            background: isMe ? 'rgba(22, 119, 255, 0.1)' : '#fff', 
                                                            borderColor: '#d9d9d9' 
                                                        }}
                                                    >
                                                        <Typography.Link href={m.url} target="_blank" ellipsis style={{ fontSize: '12px' }}>
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
                    padding: '6px',
                    background: '#fff'
                }}>
                    {tempFiles.length > 0 && (
                        <Flex gap="8px" style={{ marginBottom: 8, padding: '4px' }} wrap="wrap">
                            {tempFiles.map((file) => (
                                <Tag 
                                    key={file.id} 
                                    closable 
                                    onClose={() => removeAttachment(file.id)}
                                    icon={<PaperClipOutlined />}
                                    color="blue"
                                >
                                    {file.name}
                                </Tag>
                            ))}
                            {isUploading && <Spin size="small" />}
                        </Flex>
                    )}

                    <Flex align="center">
                        <Upload customRequest={handleFileUpload} showUploadList={false} multiple disabled={isUploading}>
                            <Button type="text" icon={<PaperClipOutlined />} loading={isUploading} />
                        </Upload>
                        <Input.TextArea
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            placeholder={t('chat.placeholder')}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            variant="borderless"
                            disabled={isSending}
                        />
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<SendOutlined />}
                            onClick={handleSend}
                            loading={isSending}
                            disabled={isUploading || (!text.trim() && pendingMediaIds.length === 0)}
                        />
                    </Flex>
                </div>
            </div>
        </Flex>
    );
};

export default TicketChatTab;