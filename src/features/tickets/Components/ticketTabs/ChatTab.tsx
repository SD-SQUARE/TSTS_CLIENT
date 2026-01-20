/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';
import { List, Avatar, Input, Button, Tag, Upload, Typography, Card, Flex, Spin, Space } from 'antd';
import { PaperClipOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetChatMessagesQuery, useSendMessageMutation, useUploadChatMediaMutation } from '../../store/services/chatApi';
import { useTranslation } from 'react-i18next';

const TicketChatTab: React.FC<{ assigneeName?: string }> = ({ assigneeName }) => {
    const { t } = useTranslation();
    const { id: ticketId } = useParams();
    const { data: messages, isLoading } = useGetChatMessagesQuery(ticketId!);
    const [uploadMedia] = useUploadChatMediaMutation();
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
    const [text, setText] = useState('');


    const currentUserId = sessionStorage.getItem('userId');

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() || isSending) return;
        try {
            await sendMessage({ ticketId: ticketId!, message: text }).unwrap();
            setText('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleFileUpload = async (options: any) => {
        const { file } = options;
        const formData = new FormData();
        formData.append('media', file);
        try {
            await uploadMedia({ ticketId: ticketId!, formData }).unwrap();
        } catch (error) {
            console.error(t('errors.uploadFailed'), error);
        }
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

                        const isMe = String(item.sender.id) === String(currentUserId);

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

                                        { }
                                        <div style={{
                                            background: isMe ? '#1677ff' : '#fff',
                                            color: isMe ? '#fff' : 'rgba(0, 0, 0, 0.88)',
                                            padding: '8px 12px',
                                            borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            <Typography.Text style={{ color: 'inherit' }}>{item.message}</Typography.Text>

                                            { }
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
                borderTop: '1px solid #f0f0f0'
            }}>
                <Flex gap="small">
                    <Upload customRequest={handleFileUpload} showUploadList={false}>
                        <Button icon={<PaperClipOutlined />} />
                    </Upload>
                    <Input
                        placeholder={t('chat.placeholder')}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onPressEnter={handleSend}
                        style={{ borderRadius: '20px' }}
                        disabled={isSending}
                    />
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        loading={isSending}
                    />
                </Flex>
            </div>
        </div>
    );
};

export default TicketChatTab;