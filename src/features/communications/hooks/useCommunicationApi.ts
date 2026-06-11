import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import api from '../../../api/http';
import type {
  ChatConversation,
  ChatMessage,
  GroupLookupItem,
  NotificationItem,
  NotificationUnreadCount,
  TeamLookupItem,
  UserLookupItem,
} from '../types';

export const communicationKeys = {
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread-count'] as const,
  bootstrapInbox: ['bootstrap', 'inbox'] as const,
  chatInbox: ['chat', 'inbox'] as const,
  personalMessages: (userId?: string) => ['chat', 'personal', userId] as const,
  groupMessages: (groupId?: string) => ['chat', 'group', groupId] as const,
  teamMessages: (teamId?: string) => ['chat', 'team', teamId] as const,
  usersLookup: (search: string) => ['chat', 'lookup', 'users', search] as const,
  groupsLookup: (search: string, mine = false) => ['chat', 'lookup', 'groups', search, mine] as const,
  teamsLookup: (search: string, mine = false) => ['chat', 'lookup', 'teams', search, mine] as const,
};

/**
 * BOOTSTRAP HOOK — consolidates initial-load fan-out:
 *   GET /v1/notifications        (was: useNotifications)
 *   GET /v1/notifications/unread-count  (was: useUnreadNotificationsCount)
 *   GET /v1/chat/conversations    (was: useChatInbox)
 * → replaced by ONE call: GET /v1/notifications/bootstrap/inbox
 *
 * Before: 3 parallel requests on every page load
 * After:  1 request; individual slice selectors expose the same data shape
 */
export type BootstrapInboxData = {
  unreadCount: number;
  notifications: { data: NotificationItem[]; pagination: { page: number; pageSize: number; total: number } };
  chatInbox: ChatConversation[];
};

export const useBootstrapInbox = () => {
  const isAuthenticated = useSelector((state: any) => !!state.auth?.token);
  return useQuery<BootstrapInboxData>({
    queryKey: communicationKeys.bootstrapInbox,
    queryFn: async () => {
      const { data } = await api.get('/v1/notifications/bootstrap/inbox');
      return data as BootstrapInboxData;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

/** Selector: drop-in replacement for useNotifications(1, 10) */
export const useBootstrapNotifications = () => {
  const q = useBootstrapInbox();
  return { ...q, data: q.data?.notifications };
};

/** Selector: drop-in replacement for useUnreadNotificationsCount */
export const useBootstrapUnreadCount = () => {
  const q = useBootstrapInbox();
  return { ...q, data: q.data ? { unread: q.data.unreadCount } : undefined };
};

/** Selector: drop-in replacement for useChatInbox */
export const useBootstrapChatInbox = (enabled = true) => {
  const isAuthenticated = useSelector((state: any) => !!state.auth?.token);
  const q = useBootstrapInbox();
  // Only run the query if both enabled and authenticated
  if (!enabled || !isAuthenticated) return { ...q, data: undefined, isLoading: false };
  return { ...q, data: q.data?.chatInbox };
};

export const useNotifications = (page = 1, pageSize = 10, isRead?: boolean, enabled = true) =>
  useQuery<{ data: NotificationItem[]; pagination: { page: number; pageSize: number; total: number } }>({
    queryKey: [...communicationKeys.notifications, page, pageSize, isRead],
    queryFn: async () => {
      const { data } = await api.get('/v1/notifications', {
        params: { page, pageSize, ...(isRead !== undefined && { isRead }) },
      });
      return data;
    },
    enabled: enabled,
  });


export const useUnreadNotificationsCount = () => {
  const isAuthenticated = useSelector((state: any) => !!state.auth?.token);
  return useQuery<NotificationUnreadCount>({
    queryKey: communicationKeys.unreadNotifications,
    queryFn: async () => {
      const { data } = await api.get('/v1/notifications/unread-count');
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

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
      await queryClient.invalidateQueries({ queryKey: communicationKeys.bootstrapInbox });
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
      await queryClient.invalidateQueries({ queryKey: communicationKeys.bootstrapInbox });
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

export const useTeamMessages = (teamId?: string) =>
  useQuery<ChatMessage[]>({
    queryKey: communicationKeys.teamMessages(teamId),
    queryFn: async () => {
      const { data } = await api.get(`/v1/chat/team/${teamId}/messages`);
      return data;
    },
    enabled: !!teamId,
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

export const useSendTeamMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      teamId: string;
      content: string;
      files?: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', payload.content);
      payload.files?.forEach((file) => formData.append('attachments', file));

      const { data } = await api.post(
        `/v1/chat/team/${payload.teamId}/messages`,
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
        queryKey: communicationKeys.teamMessages(variables.teamId),
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

export const useTeamsLookup = (search: string, enabled = true, mine = false, allowEmpty = false) =>
  useQuery<TeamLookupItem[]>({
    queryKey: communicationKeys.teamsLookup(search, mine),
    queryFn: async () => {
      const { data } = await api.get('/v1/lockups/teams', {
        params: {
          name: search || undefined,
          mine,
        },
      });
      return data.teams || [];
    },
    enabled: enabled && (allowEmpty || search.trim().length > 0),
  });
