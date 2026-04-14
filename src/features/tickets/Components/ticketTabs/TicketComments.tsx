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

const TicketComments: React.FC<{ assigneeName?: string, requesterId?: string }> = ({ assigneeName, requesterId }) => {
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

    useEffect(() => { refetch(); }, [refetch, t]);
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
                name: user?.name.first[i18next.language] + ' ' + user?.name.mid[i18next.language] + ' ' + user?.name.last[i18next.language] || t('common.me'),
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

    const allMessages = [...(messages || []), ...optimisticMessages].reverse();

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

                /* Styling for Admin comments */
                .comment-collapse .ant-collapse-item.is-admin-comment {
                    border-inline-start: 5px solid #d12e2e !important;
                }

                /* Styling for Technician/Staff comments */
                .comment-collapse .ant-collapse-item.is-staff-comment {
                    border-inline-start: 5px solid #d1bb2e !important;
                }

                /* Styling for Requester comments */
                .comment-collapse .ant-collapse-item.is-requester-comment {
                    border-inline-start: 5px solid #52c41a !important; 
                }

                .comment-collapse .ant-collapse-header {
                    background-color: #FAFAFA !important;
                    border-bottom: none !important;
                }

                /* Force the header to be transparent or white so the border shows correctly */
                .comment-collapse .is-requester-comment > .ant-collapse-header{
                    background-color: #FAFAFA !important;
                }
                    
                .comment-collapse .is-admin-comment > .ant-collapse-header,
                .comment-collapse .is-staff-comment > .ant-collapse-header {
                    background-color: #FAFAFA !important;
                }
                
                .comment-collapse > .ant-collapse-header {
                    background-color: #FAFAFA !important;
                }

                .comment-collapse .ant-collapse-item {
                    border-bottom: 1px solid #f0f0f0 !important;
                }

                .comment-collapse .ant-collapse-panel-active {
                    background-color: #fafafa !important; /* Soft off-white */
                }

                .comment-collapse .ant-collapse-body{
                    padding-top: 0 !important; 
                }

                .comment-collapse .ant-collapse-header {
                    background-color: #ffffff !important;
                    border-bottom: none !important;
                }
                /* Rotate our manual arrow when the parent panel is active */
                .ant-collapse-item-active .ant-collapse-arrow svg {
                    transform: rotate(270deg) !important; /* Adjust based on your starting rotation */
                    transition: transform 0.3s;
                }

                /* Remove default padding where the arrow used to be */
                .comment-collapse .ant-collapse-header {
                    padding-inline-end: 16px !important; 
                }
                    /* Ensure the flex container inside the header stretches to the edges */
                .comment-collapse .ant-collapse-header-text {
                    flex: 1 !important;
                }

                .message-content {
                word-break: normal; 
                overflow-wrap: break-word; 
                white-space: normal; 
                display: block;
                max-width: 100%;
            }


                .message-content img {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>

            <div style={{ padding: '16px 16px 8px 16px' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* <Tag color="blue" icon={<UserOutlined />} style={{ padding: '2px 12px', borderRadius: '10px', border: 'none', background: '#e6f4ff' }}>
                        {t('tickets.assignedTo')}: <strong>{assigneeName || t('tickets.unassigned')}</strong>
                    </Tag> */}
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{allMessages.length} {t('tickets.comments')}</Typography.Text>
                </div>

                <div dir='ltr' style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
                    <Collapse className="comment-collapse" expandIcon={() => null} ghost>
                        {allMessages.map((item) => {
                            const isRequesterSender = item.sender.id === requesterId;
                            const userType = item.sender.user_type?.toLowerCase() || '';

                            const isAdmin = !isRequesterSender && userType === 'admin';
                            const isTech = !isRequesterSender && (userType === 'technician' || userType === 'tech');

                            let containerClass = 'is-requester-comment';
                            if (isAdmin) containerClass = 'is-admin-comment';
                            else if (isTech || !isRequesterSender) containerClass = 'is-staff-comment';


                            return (
                                <Collapse.Panel key={item.id} className={containerClass} header={
                                    <Flex align="center" gap="middle" style={{ width: '100%' }}>
                                        <Avatar
                                            src={item.sender.image}
                                            icon={<UserOutlined />}
                                            size="large"
                                            style={{
                                                border: isAdmin ? '2px solid #d12e2e' : (isTech || !isRequesterSender) ? '2px solid #d1bb2e' : '2px solid #52c41a',
                                                flexShrink: 0
                                            }}
                                        />
                                        <Flex vertical style={{ flex: 1 }}>
                                            <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                                                <Flex vertical gap={0}>
                                                    <Flex align="center" gap="small">
                                                        <Typography.Text strong style={{ color: '#262626' }}>
                                                            {item.sender.name}
                                                        </Typography.Text>

                                                        {isAdmin && <Tag color="error" style={{ fontSize: '10px' }}>{t('roles.admin')}</Tag>}
                                                        {(isTech || (!isRequesterSender && !isAdmin)) && (
                                                            <Tag color="warning" style={{ fontSize: '10px' }}>
                                                                {item.sender.user_type || t('common.staff')}
                                                            </Tag>
                                                        )}
                                                    </Flex>

                                                    {!isRequesterSender && item.sender.job_title && (
                                                        <Typography.Text type="secondary" style={{ fontSize: '12px', marginTop: '-2px' }}>
                                                            {item.sender.job}
                                                        </Typography.Text>
                                                    )}
                                                </Flex>

                                                <Flex align="center" gap="small">
                                                    <span dir='ltr'>
                                                        <Typography.Text type="secondary" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                            {dayjs(item.createdAt).format('MMM DD, YYYY - h:mm A')}
                                                        </Typography.Text>
                                                    </span>
                                                    <div style={{ marginLeft: '8px', color: '#bfbfbf', fontSize: '12px' }}>
                                                        <span className="ant-collapse-arrow">
                                                            <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" style={{ transform: 'rotate(90deg)' }}><path d="M765.7 486.8L314.9 134.7A8 8 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path></svg>
                                                        </span>
                                                    </div>
                                                </Flex>
                                            </Flex>
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
                            )
                        })}
                    </Collapse>
                )}
            </div>
        </Flex>
    );
};

export default TicketComments;