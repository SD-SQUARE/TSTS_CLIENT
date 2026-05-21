import React, { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { communicationKeys } from '../hooks/useCommunicationApi';
import { CHAT_DRAWER_OPEN_EVENT } from '../events';
import notificationAudioSrc from '../../../assets/audio/notification.wav';
import { stripHtml } from '../../../utils/html';

const resolveSocketUrl = () => {
  const electronApiBase = window.electronAPI?.apiBaseUrl;
  if (electronApiBase) {
    return electronApiBase.replace(/\/api\/?$/, '');
  }

  const explicitApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (explicitApiBase) {
    return explicitApiBase.replace(/\/api\/?$/, '');
  }

  return undefined;
};

const RealtimeBridge: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const auth = useSelector((state: any) => state.auth);
  const token = auth?.token as string | null;
  const role = typeof auth?.user?.role === 'string' ? auth.user.role.toLowerCase() : '';
  const navigate = useNavigate();
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationAudioRef.current = new Audio(notificationAudioSrc);
    notificationAudioRef.current.volume = 0.55;

    return () => {
      notificationAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socketUrl = resolveSocketUrl();
    const socket = io(socketUrl, {
      auth: {
        token,
      },
      query: {
        token,
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('notification:new', (payload) => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotifications });

      const incoming = payload?.notification;
      if (incoming?.notification?.title) {
        void notificationAudioRef.current?.play().catch(() => undefined);

        notification.info({
          message: incoming.notification.title,
          description: stripHtml(incoming.notification.content) || t('notifications.newItem'),
          placement: i18n.language === 'ar' ? 'topLeft' : 'topRight',
          onClick: () => {
            if (incoming.notification.type === 'message' && role !== 'requester') {
                window.dispatchEvent(new CustomEvent(CHAT_DRAWER_OPEN_EVENT));
            } else if (incoming.notification.type === 'ticket' && incoming.notification.referenceId && role) {
                navigate(`/${role}/tickets/${incoming.notification.referenceId}`);
            }
          },
          style: { cursor: 'pointer' },
        });
      }
    });

    socket.on('chat:message', (payload) => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.chatInbox });
      void queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotifications });

      if (payload?.conversationType === 'personal') {
        void queryClient.invalidateQueries({
          queryKey: communicationKeys.personalMessages(payload.conversationId),
        });
      }

      if (payload?.conversationType === 'group') {
        void queryClient.invalidateQueries({
          queryKey: communicationKeys.groupMessages(payload.conversationId),
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [i18n.language, queryClient, t, token, role, navigate]);

  return null;
};

export default RealtimeBridge;
