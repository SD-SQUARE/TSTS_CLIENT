import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Flex,
  Grid,
  Image,
  Input,
  List,
  Modal,
  Segmented,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  FileOutlined,
  GlobalOutlined,
  MessageOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import {
  communicationKeys,
  useChatInbox,
  useGroupMessages,
  useGroupsLookup,
  usePersonalMessages,
  useSendGroupMessage,
  useSendPersonalMessage,
  useUsersLookup,
} from '../hooks/useCommunicationApi';
import type {
  ChatAttachment,
  ChatConversation,
  ChatMessage,
  ConversationType,
  GroupLookupItem,
  UserLookupItem,
} from '../types';
import LocalizedDateText from '../../../components/LocalizedDateText';
import { stripHtml } from '../../../utils/html';

type SelectedConversation = {
  type: ConversationType;
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  image?: string | null;
  email?: string;
};

type ConversationFilter = 'all' | ConversationType;

interface ChatWorkspaceProps {
  mode?: 'page' | 'drawer';
}

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';

const attachmentIsImage = (attachment: ChatAttachment) =>
  attachment.mime?.toLowerCase().startsWith('image/');

const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ mode = 'page' }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const screens = Grid.useBreakpoint();
  const queryClient = useQueryClient();
  const auth = useSelector((state: any) => state.auth);
  const currentUserId = auth?.user?.id as string | undefined;
  const isPageMode = mode === 'page';
  const isCompact = !screens.lg;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [newChatTab, setNewChatTab] = useState<'personal' | 'group'>('personal');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const inboxQuery = useChatInbox();
  const personalMessagesQuery = usePersonalMessages(
    selectedConversation?.type === 'personal' ? selectedConversation.id : undefined,
  );
  const groupMessagesQuery = useGroupMessages(
    selectedConversation?.type === 'group' ? selectedConversation.id : undefined,
  );
  const sendPersonalMutation = useSendPersonalMessage();
  const sendGroupMutation = useSendGroupMessage();
  const usersLookupQuery = useUsersLookup(userSearch, newChatOpen && newChatTab === 'personal');
  const groupsLookupQuery = useGroupsLookup(
    groupSearch,
    newChatOpen && newChatTab === 'group',
    true,
    true,
  );

  const inboxItems = useMemo(
    () => (inboxQuery.data || []).filter((item) => Boolean(item.id)),
    [inboxQuery.data],
  );
  const activeMessages = selectedConversation?.type === 'group'
    ? groupMessagesQuery.data || []
    : personalMessagesQuery.data || [];
  const isConversationLoading = selectedConversation?.type === 'group'
    ? groupMessagesQuery.isLoading
    : personalMessagesQuery.isLoading;
  const isSending = sendPersonalMutation.isPending || sendGroupMutation.isPending;

  useEffect(() => {
    if (!selectedConversation && inboxItems.length > 0) {
      const firstItem = inboxItems[0];
      setSelectedConversation({
        type: firstItem.type,
        id: firstItem.id,
        name: firstItem.name,
        name_en: firstItem.name_en,
        name_ar: firstItem.name_ar,
        image: firstItem.image,
      });
    }
  }, [inboxItems, selectedConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  useEffect(() => {
    if (selectedConversation?.type === 'personal' && personalMessagesQuery.isSuccess) {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.chatInbox });
    }
  }, [
    personalMessagesQuery.dataUpdatedAt,
    personalMessagesQuery.isSuccess,
    queryClient,
    selectedConversation?.id,
    selectedConversation?.type,
  ]);

  useEffect(() => {
    if (selectedConversation?.type === 'group' && groupMessagesQuery.isSuccess) {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.chatInbox });
    }
  }, [
    groupMessagesQuery.dataUpdatedAt,
    groupMessagesQuery.isSuccess,
    queryClient,
    selectedConversation?.id,
    selectedConversation?.type,
  ]);

  const filteredInbox = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inboxItems.filter((item) => {
      const matchesFilter = filter === 'all' || item.type === filter;
      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [item.name, item.name_en, item.name_ar, stripHtml(item.lastMessage)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [filter, inboxItems, search]);

  const getLocalizedName = (item?: {
    name?: string;
    name_en?: string;
    name_ar?: string;
    email?: string;
  } | null) =>
    (isRtl
      ? item?.name_ar || item?.name_en || item?.name || item?.email
      : item?.name_en || item?.name_ar || item?.name || item?.email) || t('common.user');

  const selectedConversationInInbox = useMemo(
    () =>
      selectedConversation
        ? inboxItems.some(
            (item) =>
              item.id === selectedConversation.id && item.type === selectedConversation.type,
          )
        : false,
    [inboxItems, selectedConversation],
  );

  const displayedInbox = useMemo(() => {
    if (!selectedConversation || selectedConversationInInbox) {
      return filteredInbox;
    }

    const localizedName = getLocalizedName(selectedConversation);
    const normalizedSearch = search.trim().toLowerCase();
    const matchesFilter = filter === 'all' || selectedConversation.type === filter;
    const matchesSearch =
      !normalizedSearch ||
      [localizedName, selectedConversation.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));

    if (!matchesFilter || !matchesSearch) {
      return filteredInbox;
    }

    const lastMessage = activeMessages.length
      ? activeMessages[activeMessages.length - 1]
      : undefined;

    return [
      {
        type: selectedConversation.type,
        id: selectedConversation.id,
        name: selectedConversation.name,
        name_en: selectedConversation.name_en,
        name_ar: selectedConversation.name_ar,
        image: selectedConversation.image,
        lastMessage: lastMessage?.content || '',
        lastMessageAt: lastMessage?.createdAt || null,
        unreadCount: 0,
      },
      ...filteredInbox,
    ];
  }, [
    activeMessages,
    filteredInbox,
    filter,
    search,
    selectedConversation,
    selectedConversationInInbox,
  ]);

  const availableUsers = useMemo(
    () =>
      (usersLookupQuery.data || []).filter(
        (item) =>
          String(item.user_type || '').toLowerCase() !== 'requester' &&
          item.id !== currentUserId,
      ),
    [currentUserId, usersLookupQuery.data],
  );

  const handleConversationSelect = (item: ChatConversation | SelectedConversation) => {
    setSelectedConversation({
      type: item.type,
      id: item.id,
      name: item.name,
      name_en: item.name_en,
      name_ar: item.name_ar,
      image: 'image' in item ? item.image : null,
      email: 'email' in item ? item.email : undefined,
    });
  };

  const handleNewPersonalConversation = (item: UserLookupItem) => {
    setSelectedConversation({
      type: 'personal',
      id: item.id,
      name: item.name_en || item.name_ar || item.email || '',
      name_en: item.name_en || item.email || '',
      name_ar: item.name_ar || item.name_en || item.email || '',
      image: item.image || null,
      email: item.email,
    });
    setNewChatOpen(false);
  };

  const handleNewGroupConversation = (item: GroupLookupItem) => {
    setSelectedConversation({
      type: 'group',
      id: item.id,
      name: item.name_en || item.name_ar || item.name,
      name_en: item.name_en || item.name,
      name_ar: item.name_ar || item.name_en || item.name,
      image: null,
    });
    setNewChatOpen(false);
  };

  const handleSend = async () => {
    if (!selectedConversation) {
      message.warning(t('messagesCenter.errors.selectConversation'));
      return;
    }

    if (!composerValue.trim()) {
      message.warning(t('messagesCenter.errors.emptyMessage'));
      return;
    }

    try {
      if (selectedConversation.type === 'personal') {
        await sendPersonalMutation.mutateAsync({
          userId: selectedConversation.id,
          content: composerValue.trim(),
          files: pendingFiles,
        });
      } else {
        await sendGroupMutation.mutateAsync({
          groupId: selectedConversation.id,
          content: composerValue.trim(),
          files: pendingFiles,
        });
      }

      setComposerValue('');
      setPendingFiles([]);
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('errors.submitFailed'));
    }
  };

  const renderConversationList = () => {
    if (inboxQuery.isLoading) {
      return (
        <Flex justify="center" style={{ paddingTop: 80 }}>
          <Spin />
        </Flex>
      );
    }

    if (!displayedInbox.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('messagesCenter.emptyInbox')}
          style={{ marginTop: 80 }}
        />
      );
    }

    return (
      <List
        dataSource={displayedInbox}
        split={false}
        renderItem={(item) => {
          const active =
            selectedConversation?.id === item.id &&
            selectedConversation?.type === item.type;
          const localizedName = getLocalizedName(item);

          return (
            <List.Item style={{ padding: 0, border: 'none' }}>
              <button
                type="button"
                onClick={() => handleConversationSelect(item)}
                style={{
                  width: '100%',
                  textAlign: 'inherit',
                  border: 'none',
                  padding: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <Flex
                  align="center"
                  gap={14}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginBottom: 10,
                    borderRadius: 20,
                    background: active ? '#eef4ff' : '#ffffff',
                    border: active ? '1px solid #b7cdfd' : '1px solid #eef1f7',
                    boxShadow: active
                      ? '0 16px 34px rgba(15, 76, 129, 0.12)'
                      : '0 10px 24px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Avatar
                    size={46}
                    src={item.type === 'personal' ? item.image || undefined : undefined}
                    style={{
                      background: item.type === 'group' ? '#123f73' : '#0f4c81',
                      color: '#fff',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(localizedName)}
                  </Avatar>

                  <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                    <Flex justify="space-between" align="center" gap={12}>
                      <Typography.Text strong ellipsis style={{ maxWidth: 180 }}>
                        {localizedName}
                      </Typography.Text>
                      <Badge count={item.unreadCount} size="small" offset={[-4, 4]}>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {item.unreadCount > 0
                            ? ''
                            : item.lastMessageAt
                              ? <LocalizedDateText value={item.lastMessageAt} language={i18n.language} mode="time" />
                              : ''}
                        </Typography.Text>
                      </Badge>
                    </Flex>
                    <Typography.Paragraph
                      ellipsis={{ rows: 1 }}
                      style={{
                        margin: '4px 0 0',
                        color: item.unreadCount > 0 ? '#475569' : '#94a3b8',
                      }}
                    >
                      {stripHtml(item.lastMessage) || t('messagesCenter.noMessages')}
                    </Typography.Paragraph>
                  </Flex>
                </Flex>
              </button>
            </List.Item>
          );
        }}
      />
    );
  };

  const renderMessageAttachments = (messageItem: ChatMessage) => {
    if (!messageItem.attachments.length) {
      return null;
    }

    return (
      <Flex wrap="wrap" gap={12} style={{ marginBlock: 12 }}>
        {messageItem.attachments.map((attachment) => (
          attachmentIsImage(attachment) ? (
            <Image
              key={attachment.id}
              src={attachment.url}
              width={72}
              height={72}
              style={{
                borderRadius: 14,
                objectFit: 'cover',
                border: '1px solid #e2e8f0',
              }}
            />
          ) : (
            <Tooltip key={attachment.id} title={attachment.name}>
              <Button
                icon={<FileOutlined />}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: 72,
                  minWidth: 120,
                  borderRadius: 16,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: 82,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {attachment.name}
                </span>
              </Button>
            </Tooltip>
          )
        ))}
      </Flex>
    );
  };

  const renderMessages = () => {
    if (!selectedConversation) {
      return (
        <Flex
          vertical
          justify="center"
          align="center"
          gap={12}
          style={{ minHeight: 420 }}
        >
          <MessageOutlined style={{ fontSize: 46, color: '#94a3b8' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('messagesCenter.selectConversationTitle')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t('messagesCenter.selectConversationHint')}
          </Typography.Text>
        </Flex>
      );
    }

    if (isConversationLoading) {
      return (
        <Flex justify="center" style={{ paddingTop: 100 }}>
          <Spin />
        </Flex>
      );
    }

    if (!activeMessages.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('messagesCenter.emptyConversation')}
          style={{ marginTop: 80 }}
        />
      );
    }

    return (
      <Flex vertical gap={20} style={{ padding: '6px 4px 20px' }}>
        {activeMessages.map((messageItem) => {
          const isOwn = messageItem.senderId === currentUserId;
          const senderName = getLocalizedName(messageItem.sender);

          return (
            <Flex
              key={messageItem.id}
              justify={isOwn ? 'flex-end' : 'flex-start'}
              style={{ width: '100%' }}
            >
              <Flex
                gap={12}
                align="flex-start"
                style={{
                  width: '100%',
                  maxWidth: 760,
                  flexDirection: isOwn ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  size={46}
                  src={messageItem.sender.image || undefined}
                  icon={<UserOutlined />}
                  style={{
                    flexShrink: 0,
                    background: isOwn ? '#0f4c81' : '#102f57',
                    marginTop: 10,
                  }}
                >
                  {!messageItem.sender.image ? getInitials(senderName) : null}
                </Avatar>

                <div
                  style={{
                    flex: 1,
                    padding: '18px 20px',
                    borderRadius: 24,
                    background: '#ffffff',
                    border: '1px solid #e8edf5',
                    boxShadow: '0 18px 34px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {senderName}
                  </Typography.Text>

                  {renderMessageAttachments(messageItem)}

                  {messageItem.content && (
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        color: '#0f172a',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.8,
                      }}
                    >
                      {messageItem.content}
                    </Typography.Paragraph>
                  )}

                  <Flex justify="flex-end" style={{ marginTop: 12 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      <LocalizedDateText value={messageItem.createdAt} language={i18n.language} mode="time" />
                    </Typography.Text>
                  </Flex>
                </div>
              </Flex>
            </Flex>
          );
        })}
        <div ref={bottomRef} />
      </Flex>
    );
  };

  const filterOptions = [
    {
      label: (
        <Space size={6}>
          <GlobalOutlined />
          <span>{t('notifications.filters.all')}</span>
        </Space>
      ),
      value: 'all' as ConversationFilter,
    },
    {
      label: (
        <Space size={6}>
          <UserOutlined />
          <span>{t('messagesCenter.types.personal')}</span>
        </Space>
      ),
      value: 'personal' as ConversationFilter,
    },
    {
      label: (
        <Space size={6}>
          <TeamOutlined />
          <span>{t('messagesCenter.types.group')}</span>
        </Space>
      ),
      value: 'group' as ConversationFilter,
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : '340px minmax(0, 1fr)',
          gap: 20,
          minHeight: isPageMode ? 720 : 640,
          height: '100%',
        }}
      >
        <div
          style={{
            borderRadius: 28,
            border: '1px solid #e6edf7',
            background: '#f9fbff',
            padding: 18,
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
            minHeight: 0,
          }}
        >
          <Flex vertical gap={16} style={{ height: '100%' }}>
            <Flex justify="space-between" align="center" gap={12}>
              <div>
                <Typography.Title level={isPageMode ? 4 : 5} style={{ margin: 0 }}>
                  {t('messagesCenter.title')}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {t('messagesCenter.subtitle')}
                </Typography.Text>
              </div>

              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => setNewChatOpen(true)}
              />
            </Flex>

            <Input
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('messagesCenter.search')}
              prefix={<SearchOutlined />}
              style={{ borderRadius: 16, height: 46 }}
            />

            <Segmented<ConversationFilter>
              block
              value={filter}
              onChange={(value) => setFilter(value)}
              options={filterOptions}
            />

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                paddingRight: 4,
                marginTop: 2,
              }}
            >
              {renderConversationList()}
            </div>
          </Flex>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 28,
            border: '1px solid #e6edf7',
            background: 'linear-gradient(180deg, #f4f7fc 0%, #eef3fb 100%)',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            gap={12}
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #dde6f2',
              background: 'rgba(255,255,255,0.72)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {selectedConversation ? getLocalizedName(selectedConversation) : t('messagesCenter.title')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {selectedConversation
                  ? t(`messagesCenter.types.${selectedConversation.type}`)
                  : t('messagesCenter.selectConversationHint')}
              </Typography.Text>
            </div>

            {selectedConversation && (
              <Tag
                color={selectedConversation.type === 'group' ? 'blue' : 'geekblue'}
                style={{ borderRadius: 999 }}
              >
                {t(`messagesCenter.types.${selectedConversation.type}`)}
              </Tag>
            )}
          </Flex>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '22px 24px',
            }}
          >
            {renderMessages()}
          </div>

          <div
            style={{
              borderTop: '1px solid #dde6f2',
              background: '#ffffff',
              padding: '16px 20px 18px',
            }}
          >
            <Flex vertical gap={12}>
              {!!pendingFiles.length && (
                <Flex wrap="wrap" gap={8}>
                  {pendingFiles.map((file) => (
                    <Tag
                      key={file.uid}
                      closable
                      onClose={() => {
                        setPendingFiles((current) =>
                          current.filter((item) => item.uid !== file.uid),
                        );
                      }}
                      style={{ borderRadius: 999, paddingInline: 10 }}
                    >
                      {file.name}
                    </Tag>
                  ))}
                </Flex>
              )}

              <Flex align="end" gap={12}>
                <Upload
                  beforeUpload={(file) => {
                    setPendingFiles((current) => [...current, file]);
                    return false;
                  }}
                  onRemove={(file) => {
                    setPendingFiles((current) =>
                      current.filter((item) => item.uid !== file.uid),
                    );
                  }}
                  fileList={[]}
                  multiple
                  showUploadList={false}
                >
                  <Button
                    shape="circle"
                    icon={<PaperClipOutlined />}
                    style={{ width: 48, height: 48 }}
                  />
                </Upload>

                <Input.TextArea
                  autoSize={{ minRows: 1, maxRows: 5 }}
                  value={composerValue}
                  onChange={(event) => setComposerValue(event.target.value)}
                  placeholder={t('messagesCenter.placeholder')}
                  style={{
                    flex: 1,
                    direction: isRtl ? 'rtl' : 'ltr',
                    textAlign: isRtl ? 'right' : 'left',
                    borderRadius: 18,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                />

                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  loading={isSending}
                  onClick={() => void handleSend()}
                  style={{ width: 48, height: 48 }}
                />
              </Flex>
            </Flex>
          </div>
        </div>
      </div>

      <Modal
        open={newChatOpen}
        onCancel={() => setNewChatOpen(false)}
        footer={null}
        title={t('messagesCenter.newChat')}
      >
        <Tabs
          activeKey={newChatTab}
          onChange={(key) => setNewChatTab(key as 'personal' | 'group')}
          items={[
            {
              key: 'personal',
              label: t('messagesCenter.types.personal'),
              children: (
                <Flex vertical gap={12}>
                  <Input
                    allowClear
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder={t('messagesCenter.searchUsers')}
                    prefix={<SearchOutlined />}
                  />

                  {!userSearch.trim() ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t('messagesCenter.searchHint')}
                    />
                  ) : usersLookupQuery.isLoading ? (
                    <Flex justify="center" style={{ paddingBlock: 40 }}>
                      <Spin />
                    </Flex>
                  ) : (
                    <List
                      dataSource={availableUsers}
                      locale={{ emptyText: t('messagesCenter.noResults') }}
                      renderItem={(item) => (
                        <List.Item
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNewPersonalConversation(item)}
                        >
                          <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                            <Flex align="center" gap={10}>
                              <Avatar src={item.image || undefined} icon={<UserOutlined />} />
                              <div>
                                <Typography.Text strong>
                                  {getLocalizedName({
                                    name_en: item.name_en,
                                    name_ar: item.name_ar,
                                    name: item.email,
                                  })}
                                </Typography.Text>
                                <Typography.Text type="secondary" style={{ display: 'block' }}>
                                  {item.email || '-'}
                                </Typography.Text>
                              </div>
                            </Flex>
                            {item.user_type && <Tag>{item.user_type}</Tag>}
                          </Flex>
                        </List.Item>
                      )}
                    />
                  )}
                </Flex>
              ),
            },
            {
              key: 'group',
              label: t('messagesCenter.types.group'),
              children: (
                <Flex vertical gap={12}>
                  <Input
                    allowClear
                    value={groupSearch}
                    onChange={(event) => setGroupSearch(event.target.value)}
                    placeholder={t('messagesCenter.searchGroups')}
                    prefix={<SearchOutlined />}
                  />

                  {groupsLookupQuery.isLoading ? (
                    <Flex justify="center" style={{ paddingBlock: 40 }}>
                      <Spin />
                    </Flex>
                  ) : (
                    <List
                      dataSource={groupsLookupQuery.data || []}
                      locale={{ emptyText: t('messagesCenter.noResults') }}
                      renderItem={(item) => (
                        <List.Item
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNewGroupConversation(item)}
                        >
                          <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                            <Flex align="center" gap={10}>
                              <Avatar
                                src={undefined}
                                style={{ background: item.color || '#123f73' }}
                                icon={<TeamOutlined />}
                              />
                              <div>
                                <Typography.Text strong>{getLocalizedName(item)}</Typography.Text>
                                <Typography.Text type="secondary" style={{ display: 'block' }}>
                                  {item.description || '-'}
                                </Typography.Text>
                              </div>
                            </Flex>
                          </Flex>
                        </List.Item>
                      )}
                    />
                  )}
                </Flex>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default ChatWorkspace;
