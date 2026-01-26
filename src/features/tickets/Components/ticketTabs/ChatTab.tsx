/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';
import { List, Avatar, Input, Button, Tag, Upload, Typography, Card, Flex, Spin, Space } from 'antd';
import { CloseCircleFilled, PaperClipOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetChatMessagesQuery, useSendMessageMutation, useUploadChatMediaMutation } from '../../store/services/chatApi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const TicketChatTab: React.FC<{ assigneeName?: string }> = ({ assigneeName }) => {
    const { t } = useTranslation();
    const { id: ticketId } = useParams();
    const { data: messages, isLoading } = useGetChatMessagesQuery(ticketId!);
    const [uploadMedia, { isLoading: isUploading }] = useUploadChatMediaMutation();
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
    const [text, setText] = useState('');
    const [pendingMediaIds, setPendingMediaIds] = useState<string[]>([]);
    const [tempFiles, setTempFiles] = useState<{ id: string, name: string }[]>([]);
    const {user} = useSelector((state: any) => state.auth);


    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() && pendingMediaIds.length === 0) return;
        // console.log('Sending message:', {text, pendingMediaIds});
        try {
            await sendMessage({ ticketId: ticketId!, message: text, mediaIds: pendingMediaIds, userID: user.id }).unwrap();
            setText('');
            setPendingMediaIds([]);
            setTempFiles([]);
        } catch (error) {
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

    return (
        <div style={{
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            <div style={{ padding: '16px 16px 0 16px' }}>
                <Tag color="processing" icon={<UserOutlined />} style={{ padding: '4px 12px' }}>
                    {t('tickets.assignedTo')}: <strong>{assigneeName || t('tickets.unassigned')}</strong>
                </Tag>
            </div>

            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: 16,
                    padding: '15px',
                }}
            >
                <List
                    dataSource={messages}
                    renderItem={(item) => {

                        const isMe = String(item.sender.id) === String(user.id);

                        return (
                            <List.Item style={{
                                border: 'none',
                                padding: '4px 0',
                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                                display: 'flex'
                            }}>
                                <Flex vertical align={isMe ? 'end' : 'start'} style={{ maxWidth: '80%' }}>
                                    { }
                                    <Space style={{ marginBottom: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                        <Typography.Text strong style={{ fontSize: '12px' }}>
                                            {isMe ? t('common.me') : item.sender.name}
                                        </Typography.Text>
                                        <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                                            {dayjs(item.createdAt).format('HH:mm')}
                                        </Typography.Text>
                                    </Space>

                                    <Flex style={{ flexDirection: isMe ? 'row-reverse' : 'row' }} align="start" gap="small">
                                        <Avatar src={item.sender.image} size="small" />

                                        <div style={{
                                            background: isMe ? '#1677ff' : '#fff',
                                            color: isMe ? '#fff' : 'rgba(0, 0, 0, 0.88)',
                                            padding: '8px 12px',
                                            borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            <Typography.Text style={{ color: 'inherit' }}>{item.message}</Typography.Text>

                                            <Flex gap="small" wrap="wrap" style={{ marginTop: item.media?.length ? 8 : 0 }}>
                                                {item.media?.map((m) => (
                                                    <Card key={m.id} size="small" style={{ width: 140, background: isMe ? 'rgba(255,255,255,0.1)' : '#fafafa', border: 'none' }} bodyStyle={{ padding: '8px' }}>
                                                        <Typography.Link href={m.url} target="_blank" ellipsis title={m.fileName} style={{ color: isMe ? '#fff' : '#1677ff' }}>
                                                            <PaperClipOutlined /> {m.fileName}
                                                        </Typography.Link>
                                                    </Card>
                                                ))}
                                            </Flex>
                                        </div>
                                    </Flex>
                                </Flex>
                            </List.Item>
                        );
                    }}
                />
            </div>

            <div style={{
                padding: '12px 16px',
                background: '#fff',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modern Integrated Upload Preview */}
                <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '12px',
                    padding: '8px',
                    background: '#fff',
                    transition: 'border-color 0.3s'
                }}>
                    {tempFiles.length > 0 && (
                        <Flex gap="8px" style={{ marginBottom: 8, padding: '4px' }} wrap="wrap">
                            {tempFiles.map((file) => (
                                <div key={file.id} style={{ 
                                    position: 'relative', 
                                    background: '#f0f5ff', 
                                    border: '1px solid #adc6ff',
                                    borderRadius: '8px',
                                    padding: '4px 24px 4px 8px',
                                    fontSize: '12px'
                                }}>
                                    <PaperClipOutlined style={{ marginRight: 4 }} />
                                    <Typography.Text ellipsis style={{ maxWidth: 100 }}>{file.name}</Typography.Text>
                                    <CloseCircleFilled 
                                        onClick={() => removeAttachment(file.id)}
                                        style={{ 
                                            position: 'absolute', 
                                            right: 4, 
                                            top: '50%', 
                                            transform: 'translateY(-50%)', 
                                            color: '#ff4d4f',
                                            cursor: 'pointer'
                                        }} 
                                    />
                                </div>
                            ))}
                            {isUploading && <Spin size="small" />}
                        </Flex>
                    )}

                    <Flex align="center">
                        <Upload customRequest={handleFileUpload} showUploadList={false} multiple disabled={isUploading}>
                            <Button type="text" icon={<PaperClipOutlined style={{ fontSize: '18px' }} />} loading={isUploading} />
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
                            style={{ marginLeft: 8 }}
                        />
                    </Flex>
                </div>
            </div>
        </div>
    );
};

export default TicketChatTab;