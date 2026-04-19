import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/http';
import type {
  ChatConversation,
  ChatMessage,
  GroupLookupItem,
  NotificationItem,
  NotificationUnreadCount,
  UserLookupItem,
} from '../types';

export const communicationKeys = {
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread-count'] as const,
  chatInbox: ['chat', 'inbox'] as const,
  personalMessages: (userId?: string) => ['chat', 'personal', userId] as const,
  groupMessages: (groupId?: string) => ['chat', 'group', groupId] as const,
  usersLookup: (search: string) => ['chat', 'lookup', 'users', search] as const,
  groupsLookup: (search: string, mine = false) => ['chat', 'lookup', 'groups', search, mine] as const,
};

export const useNotifications = () =>
  useQuery<NotificationItem[]>({
    queryKey: communicationKeys.notifications,
    queryFn: async () => {
      const { data } = await api.get('/v1/notifications');
      return data.data || [];
    },
  });

export const useUnreadNotificationsCount = () =>
  useQuery<NotificationUnreadCount>({
    queryKey: communicationKeys.unreadNotifications,
    queryFn: async () => {
      const { data } = await api.get('/v1/notifications/unread-count');
      return data;
    },
  });

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch(`/v1/notifications/${notificationId}/read`);
      return data as NotificationItem;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      await queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotifications });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/v1/notifications/read-all');
      return data as { updatedCount: number };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      await queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotifications });
    },
  });
};

export const useChatInbox = (enabled = true) =>
  useQuery<ChatConversation[]>({
    queryKey: communicationKeys.chatInbox,
    queryFn: async () => {
      const { data } = await api.get('/v1/chat/conversations');
      return data;
    },
    enabled,
  });

export const usePersonalMessages = (userId?: string) =>
  useQuery<ChatMessage[]>({
    queryKey: communicationKeys.personalMessages(userId),
    queryFn: async () => {
      const { data } = await api.get(`/v1/chat/personal/${userId}/messages`);
      return data;
    },
    enabled: !!userId,
  });

export const useGroupMessages = (groupId?: string) =>
  useQuery<ChatMessage[]>({
    queryKey: communicationKeys.groupMessages(groupId),
    queryFn: async () => {
      const { data } = await api.get(`/v1/chat/group/${groupId}/messages`);
      return data;
    },
    enabled: !!groupId,
  });

export const useSendPersonalMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      content: string;
      files?: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', payload.content);
      payload.files?.forEach((file) => formData.append('attachments', file));

      const { data } = await api.post(
        `/v1/chat/personal/${payload.userId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return data as ChatMessage;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.chatInbox });
      await queryClient.invalidateQueries({
        queryKey: communicationKeys.personalMessages(variables.userId),
      });
      await queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      await queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotifications });
    },
  });
};

export const useSendGroupMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      groupId: string;
      content: string;
      files?: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', payload.content);
      payload.files?.forEach((file) => formData.append('attachments', file));

      const { data } = await api.post(
        `/v1/chat/group/${payload.groupId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return data as ChatMessage;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: communicationKeys.chatInbox });
      await queryClient.invalidateQueries({
        queryKey: communicationKeys.groupMessages(variables.groupId),
      });
      await queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      await queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotifications });
    },
  });
};

export const useUsersLookup = (search: string, enabled = true) =>
  useQuery<UserLookupItem[]>({
    queryKey: communicationKeys.usersLookup(search),
    queryFn: async () => {
      const { data } = await api.get('/v1/lockups/users', {
        params: {
          name: search,
        },
      });
      return data.users || [];
    },
    enabled: enabled && search.trim().length > 0,
  });

export const useGroupsLookup = (search: string, enabled = true, mine = false, allowEmpty = false) =>
  useQuery<GroupLookupItem[]>({
    queryKey: communicationKeys.groupsLookup(search, mine),
    queryFn: async () => {
      const { data } = await api.get('/v1/lockups/groups', {
        params: {
          name: search || undefined,
          mine,
        },
      });
      return data.groups || [];
    },
    enabled: enabled && (allowEmpty || search.trim().length > 0),
  });
