import React, { useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Empty,
  Flex,
  List,
  Pagination,
  Segmented,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { BellOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '../hooks/useCommunicationApi';
import type { NotificationItem } from '../types';
import { CHAT_DRAWER_OPEN_EVENT } from '../events';
import LocalizedDateText from '../../../components/LocalizedDateText';
import { stripHtml } from '../../../utils/html';

type NotificationFilter = 'all' | 'unread';

const PAGE_SIZE = 10;

const NotificationBell: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const auth = useSelector((state: any) => state.auth);
  const role = typeof auth?.user?.role === 'string' ? auth.user.role.toLowerCase() : '';
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);

  const isRead = filter === 'unread' ? false : undefined;
  const notificationsQuery = useNotifications(page, PAGE_SIZE, isRead);
  const unreadQuery = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const items = notificationsQuery.data?.data || [];
  const total = notificationsQuery.data?.pagination?.total || 0;

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
    if (route) navigate(route);
  };

  const handleFilterChange = (val: NotificationFilter) => {
    setFilter(val);
    setPage(1);
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
        width={440}
        title={
          <Flex align="center" gap={8}>
            {t('notifications.title')}
            <Tooltip
              title={
                i18n.language === 'ar'
                  ? 'يتم حذف الإشعارات تلقائياً بعد 30 يوماً من تاريخ إنشائها'
                  : 'Notifications are automatically deleted after 30 days'
              }
            >
              <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
            </Tooltip>
          </Flex>
        }
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
        <Flex vertical gap={12}>
          <Segmented<NotificationFilter>
            value={filter}
            onChange={handleFilterChange}
            options={[
              { label: t('notifications.filters.all'), value: 'all' },
              { label: t('notifications.filters.unread'), value: 'unread' },
            ]}
          />

          {!items.length && !notificationsQuery.isLoading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('notifications.empty')}
            />
          ) : (
            <List
              loading={notificationsQuery.isLoading}
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  style={{ paddingInline: 0, cursor: 'pointer' }}
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
                        {stripHtml(item.notification.content)}
                      </Typography.Text>
                    )}

                    <Flex justify="space-between" align="center" gap={12}>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        <LocalizedDateText
                          value={item.notification.createdAt}
                          language={i18n.language}
                        />
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

          {total > PAGE_SIZE && (
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={(p) => setPage(p)}
              size="small"
              showTotal={(t) => `${t} ${i18n.language === 'ar' ? 'إشعار' : 'notifications'}`}
              style={{ textAlign: 'center' }}
            />
          )}

          <Typography.Text
            type="secondary"
            style={{ fontSize: 11, textAlign: 'center', display: 'block', marginTop: 4 }}
          >
            {i18n.language === 'ar'
              ? '⚠️ يتم حذف الإشعارات تلقائياً بعد 30 يوماً'
              : '⚠️ Notifications are automatically deleted after 30 days'}
          </Typography.Text>
        </Flex>
      </Drawer>
    </>
  );
};

export default NotificationBell;
