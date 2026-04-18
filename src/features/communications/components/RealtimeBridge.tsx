import React, { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  API_HOST,
  API_PORT,
  API_PROTOCOL,
} from '../../../app/config';
import { communicationKeys } from '../hooks/useCommunicationApi';
import notificationAudioSrc from '../../../assets/audio/notification.wav';

const RealtimeBridge: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const auth = useSelector((state: any) => state.auth);
  const token = auth?.token as string | null;
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

    const socket = io(`${API_PROTOCOL}://${API_HOST}:${API_PORT}`, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    socket.on('notification:new', (payload) => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotifications });

      const incoming = payload?.notification;
      if (incoming?.notification?.title) {
        void notificationAudioRef.current?.play().catch(() => undefined);

        notification.info({
          message: incoming.notification.title,
          description: incoming.notification.content || t('notifications.newItem'),
          placement: i18n.language === 'ar' ? 'topLeft' : 'topRight',
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
  }, [i18n.language, queryClient, t, token]);

  return null;
};

export default RealtimeBridge;
