/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Collapse,
  Drawer,
  Empty,
  Flex,
  Image,
  Input,
  List,
  Modal,
  Space,
  Spin,
  Tag,
  Tabs,
  Typography,
  Upload,
  message as appMessage,
} from 'antd';
import {
  BulbOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  LinkOutlined,
  MessageOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SendOutlined,
  ToolOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import {
  useCreateQuickMessageMutation,
  useGetChatMessagesQuery,
  useGetQuickMessagesQuery,
  useSendMessageMutation,
  useUploadChatMediaMutation,
} from '../../store/services/chatApi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill-new';
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';
import i18next from 'i18next';
import { knowledgeBaseApi } from '../../../knowledge-base/services/knowledgeBaseApi';
import type { KnowledgeBaseItem } from '../../../knowledge-base/types/knowledge-types';
import { APP_BASE_PATH } from '../../../../app/config';
import type { QuickMessage } from '../../store/services/chatApi';
import LocalizedDateText from '../../../../components/LocalizedDateText';
import { getErrorMessage } from '../../../../utils/error';

const { Text } = Typography;
const { TextArea } = Input;

type AttachmentPreviewItem = {
  id: string;
  name: string;
  mime?: string | null;
  url: string;
};

const stripHtml = (content?: string | null) =>
  (content || '')
    .replace(/<(.|\n)*?>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const toParagraphHtml = (value: string) => {
  const sanitized = escapeHtml(value).replace(/\n/g, '<br/>');
  return `<p>${sanitized}</p>`;
};

const TicketComments: React.FC<{ assigneeName?: string; requesterId?: string }> = ({
  requesterId,
}) => {
  const { t } = useTranslation();
  const { id: ticketId } = useParams();
  const { data: messages, isLoading, refetch } = useGetChatMessagesQuery(ticketId!);
  const { data: quickMessages = [], isLoading: isQuickMessagesLoading } =
    useGetQuickMessagesQuery();
  const [uploadMedia, { isLoading: isUploading }] = useUploadChatMediaMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [createQuickMessage, { isLoading: isCreatingQuickMessage }] =
    useCreateQuickMessageMutation();

  const [text, setText] = useState('');
  const [pendingMediaIds, setPendingMediaIds] = useState<string[]>([]);
  const [tempFiles, setTempFiles] = useState<AttachmentPreviewItem[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [quickMessageModalOpen, setQuickMessageModalOpen] = useState(false);
  const [quickMessageTitleEn, setQuickMessageTitleEn] = useState('');
  const [quickMessageTitleAr, setQuickMessageTitleAr] = useState('');
  const [quickMessageContentEn, setQuickMessageContentEn] = useState('');
  const [quickMessageContentAr, setQuickMessageContentAr] = useState('');
  const [solutionsSearch, setSolutionsSearch] = useState('');
  const [solutions, setSolutions] = useState<KnowledgeBaseItem[]>([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);

  const { user } = useSelector((state: any) => state.auth);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refetch();
  }, [refetch, t]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setOptimisticMessages([]);
    }
  }, [messages]);

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      setSolutionsLoading(true);

      try {
        const response = await knowledgeBaseApi.getAll({
          search: solutionsSearch,
          page: 1,
          page_size: 6,
        });

        const items = Array.isArray((response as any)?.items)
          ? (response as any).items
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : [];

        if (active) {
          setSolutions(items);
        }
      } catch (error) {
        if (active) {
          setSolutions([]);
        }
        console.error(error);
      } finally {
        if (active) {
          setSolutionsLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [solutionsSearch]);

  const isEditorEmpty = (content: string) =>
    stripHtml(content).length === 0 && pendingMediaIds.length === 0;

  const getCurrentUserName = () => {
    const lang = i18next.language;
    const first = user?.name?.first?.[lang] || user?.name?.first?.en || '';
    const mid = user?.name?.mid?.[lang] || user?.name?.mid?.en || '';
    const last = user?.name?.last?.[lang] || user?.name?.last?.en || '';

    return `${first} ${mid} ${last}`.trim() || t('common.me');
  };

  const appendToEditor = (html: string) => {
    setText((prev) => {
      const current = prev?.trim();
      return current ? `${current}${html}` : html;
    });
  };

  const getKnowledgeTitle = (item: KnowledgeBaseItem) => {
    const isArabic = i18next.language === 'ar';
    return (
      (isArabic ? item.title_ar : item.title_en) ||
      (isArabic ? item.title_en : item.title_ar) ||
      ''
    );
  };

  const getQuickMessageTitle = (item: QuickMessage) => {
    const isArabic = i18next.language === 'ar';
    return (
      (isArabic ? item.title_ar : item.title_en) ||
      (isArabic ? item.title_en : item.title_ar) ||
      ''
    );
  };

  const getQuickMessageContent = (item: QuickMessage) => {
    const isArabic = i18next.language === 'ar';
    return (
      (isArabic ? item.content_ar : item.content_en) ||
      (isArabic ? item.content_en : item.content_ar) ||
      ''
    );
  };

  const isImageFile = (mime?: string | null) => Boolean(mime?.startsWith('image/'));
  const isVideoFile = (mime?: string | null) => Boolean(mime?.startsWith('video/'));
  const isAudioFile = (mime?: string | null) => Boolean(mime?.startsWith('audio/'));
  const isPdfFile = (mime?: string | null) => mime === 'application/pdf';

  const renderAttachmentPreview = (
    file: AttachmentPreviewItem,
    options?: { onRemove?: (id: string) => void },
  ) => {
    const previewHeight = 176;
    const previewBody = (() => {
      if (isImageFile(file.mime)) {
        return (
          <Image
            src={file.url}
            alt={file.name}
            style={{ width: '100%', height: previewHeight, objectFit: 'cover' }}
          />
        );
      }

      if (isPdfFile(file.mime)) {
        return (
          <iframe
            src={file.url}
            title={file.name}
            style={{ width: '100%', height: previewHeight, border: 'none' }}
          />
        );
      }

      if (isVideoFile(file.mime)) {
        return (
          <video controls style={{ width: '100%', height: previewHeight, background: '#000' }}>
            <source src={file.url} type={file.mime || undefined} />
          </video>
        );
      }

      if (isAudioFile(file.mime)) {
        return (
          <Flex
            vertical
            justify="center"
            align="center"
            style={{ height: previewHeight, background: '#f7f9fc', padding: 16 }}
            gap={12}
          >
            <PaperClipOutlined style={{ fontSize: 30, color: '#1d4ed8' }} />
            <audio controls style={{ width: '100%' }}>
              <source src={file.url} type={file.mime || undefined} />
            </audio>
          </Flex>
        );
      }

      return (
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ height: previewHeight, background: '#f7f9fc', padding: 16 }}
          gap={10}
        >
          {isPdfFile(file.mime) ? (
            <FilePdfOutlined style={{ fontSize: 36, color: '#dc2626' }} />
          ) : isImageFile(file.mime) ? (
            <FileImageOutlined style={{ fontSize: 36, color: '#1d4ed8' }} />
          ) : (
            <FileOutlined style={{ fontSize: 36, color: '#475569' }} />
          )}
          <Text type="secondary" style={{ textAlign: 'center' }}>
            {file.mime || t('tickets.tools.attachmentsPreviewUnavailable')}
          </Text>
        </Flex>
      );
    })();

    return (
      <Card
        key={file.id}
        size="small"
        style={{ borderRadius: 14, overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        {previewBody}
        <Flex vertical gap={10} style={{ padding: 12 }}>
          <Flex justify="space-between" align="start" gap={8}>
            <Text strong style={{ lineHeight: 1.4 }}>
              {file.name}
            </Text>
            {options?.onRemove && (
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => options.onRemove?.(file.id)}
              />
            )}
          </Flex>
          <Flex justify="space-between" align="center" gap={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {file.mime || t('tickets.tools.attachmentsFile')}
            </Text>
            <Button
              size="small"
              icon={<LinkOutlined />}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('tickets.tools.attachmentsOpen')}
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };

  const buildKnowledgeArticleUrl = (articleId: string | number) => {
    const url = new URL(`${APP_BASE_PATH || ''}/knowledge-base`, window.location.origin);
    url.searchParams.set('article', String(articleId));
    return url.toString();
  };

  const handleSend = async () => {
    if (isEditorEmpty(text) || !user?.id) return;

    const messageContent = text;
    const mediaIdsToSend = [...pendingMediaIds];
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      message: messageContent,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: getCurrentUserName(),
        image: user?.image,
      },
      media: tempFiles.map((file) => ({
        id: file.id,
        fileName: file.name,
        mime: file.mime || null,
        url: file.url,
      })),
      isSending: true,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setText('');
    setPendingMediaIds([]);
    setTempFiles([]);

    try {
      await sendMessage({
        ticketId: ticketId!,
        message: messageContent,
        mediaIds: mediaIdsToSend,
        userID: user.id,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error(error);
      appMessage.error(getErrorMessage(error, t('errors.submitFailed')));
      setOptimisticMessages((prev) => prev.filter((item) => item.id !== tempId));
    }
  };

  const handleFileUpload = async (options: any) => {
    const { file } = options;
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await uploadMedia({ ticketId: ticketId!, formData }).unwrap();
      if (Array.isArray(response) && response.length > 0) {
        const newFiles = response.map((item: any, index: number) => ({
          id: item.id,
          name: item.name || item.fileName || (index === 0 ? file.name : `file-${index + 1}`),
          mime: item.mime || file.type || null,
          url: item.url,
        }));

        setPendingMediaIds((prev) => [...prev, ...newFiles.map((item) => item.id)]);
        setTempFiles((prev) => [...prev, ...newFiles]);
        appMessage.success(t('tickets.tools.attachmentsUploaded'));
      }
    } catch (error) {
      console.error(error);
      appMessage.error(getErrorMessage(error, t('errors.uploadFailed')));
    }
  };

  const removeAttachment = (id: string) => {
    setPendingMediaIds((prev) => prev.filter((item) => item !== id));
    setTempFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateQuickMessage = async () => {
    if (!stripHtml(quickMessageContentEn) || !stripHtml(quickMessageContentAr)) {
      appMessage.warning(t('tickets.tools.quickMessages.validation'));
      return;
    }

    try {
      await createQuickMessage({
        title_en: quickMessageTitleEn.trim() || undefined,
        title_ar: quickMessageTitleAr.trim() || undefined,
        content_en: quickMessageContentEn.trim(),
        content_ar: quickMessageContentAr.trim(),
      }).unwrap();

      appMessage.success(t('tickets.tools.quickMessages.saved'));
      setQuickMessageTitleEn('');
      setQuickMessageTitleAr('');
      setQuickMessageContentEn('');
      setQuickMessageContentAr('');
      setQuickMessageModalOpen(false);
    } catch (error) {
      console.error(error);
      appMessage.error(getErrorMessage(error, t('errors.submitFailed')));
    }
  };

  const handleInsertQuickMessage = (item: QuickMessage) => {
    appendToEditor(toParagraphHtml(getQuickMessageContent(item)));
    appMessage.success(t('tickets.tools.quickMessages.inserted'));
    setToolsOpen(false);
  };

  const handleInsertSolution = (item: KnowledgeBaseItem) => {
    const articleTitle = getKnowledgeTitle(item) || t('knowledge.read_article');
    const articleUrl = buildKnowledgeArticleUrl(item.id);

    appendToEditor(
      `<p><a href="${articleUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(articleTitle)}</a></p>`,
    );

    appMessage.success(t('tickets.tools.solutions.inserted'));
    setToolsOpen(false);
  };

  const allMessages = [...(messages || []), ...optimisticMessages].reverse();

  return (
    <Flex
      vertical
      style={{
        height: 'calc(100vh - 100px)',
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .comment-collapse .ant-collapse-item {
          margin-bottom: 12px;
          border: none !important;
          border-radius: 12px !important;
          background: #fff !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          overflow: hidden;
        }
        .comment-collapse .ant-collapse-header { align-items: center; padding: 12px 16px; }
        .comment-collapse .ant-collapse-content-box {
          background: #fafafa;
          padding: 16px;
          border-top: 1px solid #f0f0f0;
        }
        .quill-chat-editor .ql-container { border: none !important; }
        .quill-chat-editor .ql-editor {
          min-height: 42px !important;
          height: 5rem !important;
          max-height: 5rem !important;
          padding: 10px 12px !important;
          overflow-y: auto !important;
          scrollbar-width: none;
        }
        .quill-chat-editor .ql-editor::-webkit-scrollbar { display: none; }
        .quill-chat-editor .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f0f0f0 !important;
          background: #fff;
          padding: 4px 8px !important;
        }
        .quill-chat-editor .ql-editor p { margin: 0 !important; }
        .comment-collapse .ant-collapse-item.is-admin-comment {
          border-inline-start: 5px solid #d12e2e !important;
        }
        .comment-collapse .ant-collapse-item.is-staff-comment {
          border-inline-start: 5px solid #d1bb2e !important;
        }
        .comment-collapse .ant-collapse-item.is-requester-comment {
          border-inline-start: 5px solid #52c41a !important;
        }
        .comment-collapse .ant-collapse-header,
        .comment-collapse .is-requester-comment > .ant-collapse-header,
        .comment-collapse .is-admin-comment > .ant-collapse-header,
        .comment-collapse .is-staff-comment > .ant-collapse-header,
        .comment-collapse > .ant-collapse-header {
          background-color: #ffffff !important;
          border-bottom: none !important;
        }
        .comment-collapse .ant-collapse-item {
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .comment-collapse .ant-collapse-panel-active {
          background-color: #fafafa !important;
        }
        .comment-collapse .ant-collapse-body {
          padding-top: 0 !important;
        }
        .ant-collapse-item-active .ant-collapse-arrow svg {
          transform: rotate(270deg) !important;
          transition: transform 0.3s;
        }
        .comment-collapse .ant-collapse-header {
          padding-inline-end: 16px !important;
        }
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
        <div
          style={{
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {allMessages.length} {t('tickets.comments')}
          </Typography.Text>
        </div>

        <div
          dir="ltr"
          style={{
            border: 'none',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <ReactQuill
            className="quill-chat-editor"
            theme="snow"
            value={text}
            onChange={setText}
            placeholder={t('chat.placeholder')}
          />

          <Flex
            align="center"
            justify="space-between"
            style={{
              padding: '8px 12px',
              background: '#fff',
              borderTop: '1px solid #f5f5f5',
            }}
          >
            <Button icon={<ToolOutlined />} onClick={() => setToolsOpen(true)}>
              {t('tickets.tools.button')}
            </Button>
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
          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {tempFiles.map((file) => renderAttachmentPreview(file, { onRemove: removeAttachment }))}
          </div>
        )}
      </div>

      <Drawer
        title={t('tickets.tools.title')}
        placement={i18next.language === 'ar' ? 'left' : 'right'}
        width={420}
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
      >
        <Tabs
          items={[
            {
              key: 'attachments',
              label: (
                <span>
                  <PaperClipOutlined /> {t('tickets.tools.attachments')}
                </span>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Card size="small" style={{ borderRadius: 14 }}>
                    <Flex vertical gap={12}>
                      <Text type="secondary">{t('tickets.tools.attachmentsDescription')}</Text>
                      <Upload
                        customRequest={handleFileUpload}
                        showUploadList={false}
                        multiple
                        disabled={isUploading}
                      >
                        <Button icon={<UploadOutlined />} loading={isUploading}>
                          {t('tickets.tools.attachmentsUpload')}
                        </Button>
                      </Upload>
                    </Flex>
                  </Card>

                  {tempFiles.length > 0 ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 12,
                      }}
                    >
                      {tempFiles.map((file) =>
                        renderAttachmentPreview(file, { onRemove: removeAttachment }),
                      )}
                    </div>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t('tickets.tools.attachmentsEmpty')}
                    />
                  )}
                </Space>
              ),
            },
            {
              key: 'quick-messages',
              label: (
                <span>
                  <MessageOutlined /> {t('tickets.tools.quickMessages.title')}
                </span>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">{t('tickets.tools.quickMessages.description')}</Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setQuickMessageModalOpen(true)}
                    >
                      {t('tickets.tools.quickMessages.new')}
                    </Button>
                  </Flex>

                  {isQuickMessagesLoading ? (
                    <Flex justify="center" style={{ paddingTop: 24 }}>
                      <Spin />
                    </Flex>
                  ) : quickMessages.length > 0 ? (
                    <List
                      dataSource={quickMessages}
                      renderItem={(item) => (
                        <List.Item>
                          <Card
                            size="small"
                            hoverable
                            onClick={() => handleInsertQuickMessage(item)}
                            style={{ width: '100%', borderRadius: 14 }}
                          >
                            <Flex vertical gap={8}>
                              <Text strong>
                                {getQuickMessageTitle(item) ||
                                  t('tickets.tools.quickMessages.defaultTitle')}
                              </Text>
                              <Text
                                type="secondary"
                                ellipsis={{ tooltip: getQuickMessageContent(item) }}
                              >
                                {getQuickMessageContent(item)}
                              </Text>
                            </Flex>
                          </Card>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t('tickets.tools.quickMessages.empty')}
                    />
                  )}
                </Space>
              ),
            },
            {
              key: 'solutions',
              label: (
                <span>
                  <BulbOutlined /> {t('tickets.tools.solutions.title')}
                </span>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Input
                    value={solutionsSearch}
                    onChange={(event) => setSolutionsSearch(event.target.value)}
                    placeholder={t('tickets.tools.solutions.searchPlaceholder')}
                    prefix={<LinkOutlined />}
                  />

                  {solutionsLoading ? (
                    <Flex justify="center" style={{ paddingTop: 24 }}>
                      <Spin />
                    </Flex>
                  ) : solutions.length > 0 ? (
                    <List
                      dataSource={solutions}
                      renderItem={(item) => (
                        <List.Item>
                          <Card
                            size="small"
                            hoverable
                            onClick={() => handleInsertSolution(item)}
                            style={{ width: '100%', borderRadius: 14 }}
                          >
                            <Flex vertical gap={8}>
                              <Text strong>{getKnowledgeTitle(item)}</Text>
                              <Text type="secondary">
                                {(i18next.language === 'ar'
                                  ? item.description_ar || item.description_en
                                  : item.description_en || item.description_ar) || t('knowledge.no_content')}
                              </Text>
                            </Flex>
                          </Card>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t('tickets.tools.solutions.empty')}
                    />
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Drawer>

      <Modal
        title={t('tickets.tools.quickMessages.modalTitle')}
        open={quickMessageModalOpen}
        onCancel={() => {
          setQuickMessageModalOpen(false);
          setQuickMessageTitleEn('');
          setQuickMessageTitleAr('');
          setQuickMessageContentEn('');
          setQuickMessageContentAr('');
        }}
        onOk={() => void handleCreateQuickMessage()}
        confirmLoading={isCreatingQuickMessage}
        okText={t('tickets.tools.quickMessages.save')}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            value={quickMessageTitleEn}
            onChange={(event) => setQuickMessageTitleEn(event.target.value)}
            placeholder={t('tickets.tools.quickMessages.titlePlaceholderEn')}
            maxLength={120}
            dir="ltr"
          />
          <TextArea
            rows={5}
            value={quickMessageContentEn}
            onChange={(event) => setQuickMessageContentEn(event.target.value)}
            placeholder={t('tickets.tools.quickMessages.contentPlaceholderEn')}
            dir="ltr"
          />
          <Input
            value={quickMessageTitleAr}
            onChange={(event) => setQuickMessageTitleAr(event.target.value)}
            placeholder={t('tickets.tools.quickMessages.titlePlaceholderAr')}
            maxLength={120}
            dir="rtl"
          />
          <TextArea
            rows={5}
            value={quickMessageContentAr}
            onChange={(event) => setQuickMessageContentAr(event.target.value)}
            placeholder={t('tickets.tools.quickMessages.contentPlaceholderAr')}
            dir="rtl"
          />
        </Space>
      </Modal>

      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px 16px' }}
      >
        {isLoading ? (
          <Flex justify="center" style={{ marginTop: 40 }}>
            <Spin />
          </Flex>
        ) : (
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
                <Collapse.Panel
                  key={item.id}
                  className={containerClass}
                  header={
                    <Flex align="center" gap="middle" style={{ width: '100%' }}>
                      <Avatar
                        src={item.sender.image}
                        icon={<UserOutlined />}
                        size="large"
                        style={{
                          border: isAdmin
                            ? '2px solid #d12e2e'
                            : isTech || !isRequesterSender
                              ? '2px solid #d1bb2e'
                              : '2px solid #52c41a',
                          flexShrink: 0,
                        }}
                      />
                      <Flex vertical style={{ flex: 1 }}>
                        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                          <Flex vertical gap={0}>
                            <Flex align="center" gap="small">
                              <Typography.Text strong style={{ color: '#262626' }}>
                                {item.sender.name}
                              </Typography.Text>

                              {isAdmin && (
                                <Tag color="error" style={{ fontSize: '10px' }}>
                                  {t('roles.admin')}
                                </Tag>
                              )}
                              {(isTech || (!isRequesterSender && !isAdmin)) && (
                                <Tag color="warning" style={{ fontSize: '10px' }}>
                                  {item.sender.user_type || t('common.staff')}
                                </Tag>
                              )}
                            </Flex>

                            {!isRequesterSender && item.sender.job && (
                              <Typography.Text type="secondary" style={{ fontSize: '12px', marginTop: '-2px' }}>
                                {item.sender.job}
                              </Typography.Text>
                            )}
                          </Flex>

                            <Flex align="center" gap="small">
                              <Typography.Text type="secondary" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                <LocalizedDateText value={item.createdAt} language={i18next.language} />
                              </Typography.Text>
                            <div style={{ marginLeft: '8px', color: '#bfbfbf', fontSize: '12px' }}>
                              <span className="ant-collapse-arrow">
                                <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" style={{ transform: 'rotate(90deg)' }}>
                                  <path d="M765.7 486.8L314.9 134.7A8 8 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>
                                </svg>
                              </span>
                            </div>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  }
                >
                  <div
                    className="message-content"
                    style={{ color: '#595959' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.message) }}
                  />
                  {item.media?.length > 0 && (
                    <div
                      style={{
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: 12,
                        marginTop: 12,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 12,
                      }}
                    >
                      {item.media.map((mediaItem: any) =>
                        renderAttachmentPreview({
                          id: mediaItem.id,
                          name: mediaItem.fileName,
                          mime: mediaItem.mime,
                          url: mediaItem.url,
                        }),
                      )}
                    </div>
                  )}
                </Collapse.Panel>
              );
            })}
          </Collapse>
        )}
      </div>
    </Flex>
  );
};

export default TicketComments;
