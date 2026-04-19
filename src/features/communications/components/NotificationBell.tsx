import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Empty,
  Flex,
  List,
  Segmented,
  Tag,
  Typography,
} from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '../hooks/useCommunicationApi';
import type { NotificationItem } from '../types';
import { CHAT_DRAWER_OPEN_EVENT } from '../events';

type NotificationFilter = 'all' | 'unread';

const NotificationBell: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const auth = useSelector((state: any) => state.auth);
  const role = typeof auth?.user?.role === 'string' ? auth.user.role.toLowerCase() : '';
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const notificationsQuery = useNotifications();
  const unreadQuery = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const items = useMemo(() => {
    const source = Array.isArray(notificationsQuery.data) ? notificationsQuery.data : [];
    return filter === 'unread' ? source.filter((item) => !item.isRead) : source;
  }, [filter, notificationsQuery.data]);

  const localizeNotificationTitle = (item: NotificationItem) => {
    const title = item.notification.title || '';

    if (item.notification.type === 'message') {
      const groupMatch = title.match(/^New message in group\s+(.+)$/i);
      if (groupMatch) {
        return i18n.language === 'ar'
          ? `رسالة جديدة في المجموعة ${groupMatch[1]}`
          : `New message in group ${groupMatch[1]}`;
      }

      if (/^new message$/i.test(title)) {
        return i18n.language === 'ar' ? 'رسالة جديدة' : 'New message';
      }
    }

    if (item.notification.type === 'ticket') {
      const updatedMatch = title.match(/^Ticket\s+#(.+)\s+updated$/i);
      if (updatedMatch) {
        return i18n.language === 'ar'
          ? `تم تحديث التذكرة #${updatedMatch[1]}`
          : `Ticket #${updatedMatch[1]} updated`;
      }

      const statusMatch = title.match(/^Ticket\s+#(.+)\s+status changed$/i);
      if (statusMatch) {
        return i18n.language === 'ar'
          ? `تم تغيير حالة التذكرة #${statusMatch[1]}`
          : `Ticket #${statusMatch[1]} status changed`;
      }

      const messageMatch = title.match(/^New ticket message on\s+#(.+)$/i);
      if (messageMatch) {
        return i18n.language === 'ar'
          ? `رسالة جديدة على التذكرة #${messageMatch[1]}`
          : `New ticket message on #${messageMatch[1]}`;
      }
    }

    return title;
  };

  const resolveNotificationRoute = (item: NotificationItem) => {
    if (item.notification.type === 'ticket' && item.notification.referenceId && role) {
      return `/${role}/tickets/${item.notification.referenceId}`;
    }

    return null;
  };

  const handleOpenNotification = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsReadMutation.mutateAsync(item.notification.id);
    }

    setOpen(false);

    if (item.notification.type === 'message' && role !== 'requester') {
      window.dispatchEvent(new CustomEvent(CHAT_DRAWER_OPEN_EVENT));
      return;
    }

    const route = resolveNotificationRoute(item);
    if (route) {
      navigate(route);
    }
  };

  return (
    <>
      <Badge count={unreadQuery.data?.unread || 0} size="small">
        <Button
          type="text"
          shape="circle"
          aria-label={t('notifications.title')}
          icon={<BellOutlined style={{ color: 'white', fontSize: 18 }} />}
          onClick={() => setOpen(true)}
        />
      </Badge>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={420}
        title={t('notifications.title')}
        placement={i18n.language === 'ar' ? 'left' : 'right'}
        extra={
          <Button
            type="link"
            onClick={() => void markAllAsReadMutation.mutateAsync()}
            disabled={!unreadQuery.data?.unread}
            loading={markAllAsReadMutation.isPending}
          >
            {t('notifications.markAllRead')}
          </Button>
        }
      >
        <Flex vertical gap={16}>
          <Segmented<NotificationFilter>
            value={filter}
            onChange={(value) => setFilter(value)}
            options={[
              { label: t('notifications.filters.all'), value: 'all' },
              { label: t('notifications.filters.unread'), value: 'unread' },
            ]}
          />

          {!items.length ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('notifications.empty')}
            />
          ) : (
            <List
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  style={{
                    paddingInline: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => void handleOpenNotification(item)}
                >
                  <Flex
                    vertical
                    gap={8}
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 14,
                      background: item.isRead ? '#fff' : '#f5faff',
                      border: item.isRead ? '1px solid #f0f0f0' : '1px solid #d6e4ff',
                    }}
                  >
                    <Flex justify="space-between" align="center" gap={12}>
                      <Typography.Text strong>{localizeNotificationTitle(item)}</Typography.Text>
                      <Tag color={item.isRead ? 'default' : 'blue'}>
                        {item.isRead
                          ? t('notifications.status.read')
                          : t('notifications.status.unread')}
                      </Tag>
                    </Flex>

                    {item.notification.content && (
                      <Typography.Text type="secondary">
                        {item.notification.content}
                      </Typography.Text>
                    )}

                    <Flex justify="space-between" align="center" gap={12}>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.notification.createdAt).format('YYYY-MM-DD hh:mm A')}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {t(`notifications.types.${item.notification.type}`)}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </List.Item>
              )}
            />
          )}
        </Flex>
      </Drawer>
    </>
  );
};

export default NotificationBell;
