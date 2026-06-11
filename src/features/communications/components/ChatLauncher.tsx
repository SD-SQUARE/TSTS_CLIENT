import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Drawer, Grid } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ChatWorkspace from './ChatWorkspace';
import { useBootstrapChatInbox } from '../hooks/useCommunicationApi';
import { CHAT_DRAWER_OPEN_EVENT } from '../events';
import chatAudioSrc from '../../../assets/audio/chat.wav';

const ChatLauncher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const screens = Grid.useBreakpoint();
  const auth = useSelector((state: any) => state.auth);
  const token = auth?.token as string | null;
  const role = typeof auth?.user?.role === 'string' ? auth.user.role.toLowerCase() : '';
  const [open, setOpen] = useState(false);
  const openAudioRef = useRef<HTMLAudioElement | null>(null);

  const canUseChat = !!token && role !== 'requester';
  // BOOTSTRAP: replaced useChatInbox() (was a separate /chat/conversations request on mount)
  const inboxQuery = useBootstrapChatInbox(canUseChat);

  const unreadCount = useMemo(
    () => (inboxQuery.data || []).reduce((sum, item) => sum + (item.unreadCount || 0), 0),
    [inboxQuery.data],
  );

  useEffect(() => {
    openAudioRef.current = new Audio(chatAudioSrc);
    openAudioRef.current.volume = 0.55;

    return () => {
      openAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (openAudioRef.current) {
      openAudioRef.current.currentTime = 0;
      void openAudioRef.current.play().catch(() => undefined);
    }
  }, [open]);

  useEffect(() => {
    if (!canUseChat) {
      return undefined;
    }

    const handleOpen = () => setOpen(true);
    window.addEventListener(CHAT_DRAWER_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CHAT_DRAWER_OPEN_EVENT, handleOpen);
  }, [canUseChat]);

  if (!canUseChat) {
    return null;
  }

  return (
    <>
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          shape="circle"
          aria-label={t('messagesCenter.nav')}
          icon={<MessageOutlined style={{ color: 'white', fontSize: 18 }} />}
          onClick={() => setOpen(true)}
        />
      </Badge>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={screens.xl ? 1120 : screens.lg ? 960 : '100%'}
        title={t('messagesCenter.title')}
        placement={i18n.language === 'ar' ? 'left' : 'right'}
        destroyOnClose={true}
        styles={{
          body: {
            padding: 16,
            background: '#f5f7fb',
          },
        }}
      >
        <ChatWorkspace mode="drawer" />
      </Drawer>
    </>
  );
};

export default ChatLauncher;
