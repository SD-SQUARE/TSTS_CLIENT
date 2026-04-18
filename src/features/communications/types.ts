export type ConversationType = 'personal' | 'group';

export interface NotificationItem {
  id: string;
  notification: {
    id: string;
    type: 'system' | 'ticket' | 'message' | 'other';
    title: string;
    content: string | null;
    referenceId: string | null;
    createdAt: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationUnreadCount {
  unread: number;
}

export interface ChatParticipant {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  image: string | null;
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  mime: string | null;
}

export interface ChatMessage {
  id: string;
  senderId: string | null;
  recipientId: string | null;
  groupId: string | null;
  content: string;
  sender: ChatParticipant;
  attachments: ChatAttachment[];
  createdAt: string;
}

export interface ChatConversation {
  type: ConversationType;
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  image?: string | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface UserLookupItem {
  id: string;
  email?: string;
  image?: string;
  first_name?: string;
  first_name_ar?: string;
  mid_name?: string;
  mid_name_ar?: string;
  last_name?: string;
  last_name_ar?: string;
  name_en?: string;
  name_ar?: string;
  user_type?: string;
  status?: string;
}

export interface GroupLookupItem {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  color?: string;
  description?: string;
}
