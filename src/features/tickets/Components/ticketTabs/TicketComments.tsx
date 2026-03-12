/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Tag, Upload, Typography, Card, Flex, Spin, Space, Collapse } from 'antd';
import { PaperClipOutlined, SendOutlined, UserOutlined, ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetChatMessagesQuery, useSendMessageMutation, useUploadChatMediaMutation } from '../../store/services/chatApi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill-new';
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';
import i18next from 'i18next';

const TicketComments: React.FC<{ assigneeName?: string }> = ({ assigneeName }) => {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { if (messages && messages.length > 0) setOptimisticMessages([]); }, [messages]);

    const scrollRef = useRef<HTMLDivElement>(null);

    const isEditorEmpty = (content: string) => {
        if (!content) return true;
        const stripped = content.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim();
        return stripped.length === 0 && pendingMediaIds.length === 0;
    };

    const antIcon = <LoadingOutlined style={{ fontSize: 14 }} spin />;

    const handleSend = async () => {
        if (isEditorEmpty(text)) return;
        
        const messageContent = text;
        const mediaIdsToSend = [...pendingMediaIds];
        const tempId = `temp-${Date.now()}`;
        console.log(user.nam)
        const optimisticMsg = {
            id: tempId,
            message: messageContent,
            createdAt: new Date().toISOString(),
            sender: {
                id: user?.id,
                name: user?.name.first[i18next.language] + ' ' + user?.name.mid[i18next.language] +' ' + user?.name.last[i18next.language] || t('common.me'),
                image: user?.image
            },
            media: tempFiles.map(f => ({ id: f.id, fileName: f.name, url: '#' })),
            isSending: true
        };

        setOptimisticMessages(prev => [...prev, optimisticMsg]);
        setText('');
        setPendingMediaIds([]);
        setTempFiles([]);

        try {
            await sendMessage({ ticketId: ticketId!, message: messageContent, mediaIds: mediaIdsToSend, userID: user.id }).unwrap();
            refetch();
        } catch (error) {
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
        } catch (error) { console.error(error); }
    };

    const removeAttachment = (id: string) => {
        setPendingMediaIds(prev => prev.filter(item => item !== id));
        setTempFiles(prev => prev.filter(item => item.id !== id));
    };

    const allMessages = [...(messages || []), ...optimisticMessages];

    return (
        <Flex vertical style={{ height: 'calc(100vh - 100px)', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
            <style>{`
                /* Unified Collapse Styling */
                .comment-collapse .ant-collapse-item { 
                    margin-bottom: 12px; 
                    border: none !important; 
                    border-radius: 12px !important; 
                    background: #fff !important; 
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                    overflow: hidden; 
                }
                .comment-collapse .ant-collapse-header { align-items: center; padding: 12px 16px; }
                .comment-collapse .ant-collapse-content-box { background: #fafafa; padding: 16px; border-top: 1px solid #f0f0f0; }

                /* Quill Styling */
                .quill-chat-editor .ql-container { border: none !important; }
                .quill-chat-editor .ql-editor { 
                    min-height: 42px !important; height: 5rem !important; max-height: 5rem !important; 
                    padding: 10px 12px !important; overflow-y: auto !important; scrollbar-width: none;
                }
                .quill-chat-editor .ql-editor::-webkit-scrollbar { display: none; }
                .quill-chat-editor .ql-toolbar { border: none !important; border-bottom: 1px solid #f0f0f0 !important; background: #fff; padding: 4px 8px !important; }
                .quill-chat-editor .ql-editor p { margin: 0 !important; }
            `}</style>

            <div style={{ padding: '16px 16px 8px 16px' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* <Tag color="blue" icon={<UserOutlined />} style={{ padding: '2px 12px', borderRadius: '10px', border: 'none', background: '#e6f4ff' }}>
                        {t('tickets.assignedTo')}: <strong>{assigneeName || t('tickets.unassigned')}</strong>
                    </Tag> */}
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{allMessages.length} {t('tickets.comments')}</Typography.Text>
                </div>

                <div style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <ReactQuill
                        className="quill-chat-editor"
                        theme="snow"
                        value={text}
                        onChange={setText}
                        placeholder={t('chat.placeholder')}
                    />
                    <Flex align="center" justify="space-between" style={{ padding: '6px 12px', background: '#fff', borderTop: '1px solid #f5f5f5' }}>
                        <Upload customRequest={handleFileUpload} showUploadList={false} multiple disabled={isUploading}>
                            <Button type="text" icon={<PaperClipOutlined />} loading={isUploading} style={{ color: '#8c8c8c' }} />
                        </Upload>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<SendOutlined />}
                            onClick={handleSend}
                            loading={isSending}
                            disabled={isUploading || isEditorEmpty(text)}
                        />
                    </Flex>
                </div>

                {tempFiles.length > 0 && (
                    <Flex gap="8px" style={{ marginTop: 8 }} wrap="wrap">
                        {tempFiles.map((file) => (
                            <Tag key={file.id} closable onClose={() => removeAttachment(file.id)} color="blue" style={{ borderRadius: '6px' }}>
                                {file.name}
                            </Tag>
                        ))}
                    </Flex>
                )}
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px 16px' }}>
                {isLoading ? <Flex justify="center" style={{ marginTop: 40 }}><Spin /></Flex> : (
                    <Collapse className="comment-collapse" expandIconPosition="end" ghost>
                        {allMessages.map((item) => (
                            <Collapse.Panel key={item.id} header={
                                <Flex align="center" gap="middle">
                                    <Avatar src={item.sender.image} icon={<UserOutlined />} size="large" style={{ border: '2px solid #f0f0f0' }} />
                                    <Flex vertical>
                                    <Flex align="center" gap="small">
                                            <Typography.Text strong style={{ color: '#262626' }}>{item.sender.name}</Typography.Text>
                                            {item.isSending && <Spin indicator={antIcon} />}
                                        </Flex>
                                        <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
                                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                                            {dayjs(item.createdAt).format('MMM DD, YYYY - h:mm A')}
                                        </Typography.Text>
                                    </Flex>
                                </Flex>
                            }>
                                <div className="message-content" style={{ color: '#595959' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.message) }} />
                                {item.media?.length > 0 && (
                                    <Flex gap="small" wrap="wrap" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                                        {item.media.map((m: any) => (
                                            <Button 
                                                key={m.id} 
                                                icon={<PaperClipOutlined />} 
                                                href={m.url} 
                                                target="_blank" 
                                                size="small"
                                                shape="round"
                                            >
                                                {m.fileName}
                                            </Button>
                                        ))}
                                    </Flex>
                                )}
                            </Collapse.Panel>
                        ))}
                    </Collapse>
                )}
            </div>
        </Flex>
    );
};

export default TicketComments;