// ─── Chat Participant / Contact ─────────────────────────────────────────────

export interface ChatContact {
  id: number;
  name: string;
  role: string;
  avatar: string | null;
  isOnline?: boolean;
}

// ─── Conversation ────────────────────────────────────────────────────────────

export interface ConversationParticipant {
  id: number;
  name: string;
  role: string;
  avatar: string | null;
  isOnline?: boolean;
}

export interface Conversation {
  id: number;
  participants?: ConversationParticipant[] | any;
  otherParticipant?: any;
  lastMessage: any;
  lastMessageTime: string | null;
  unreadCount: number;
  createdAt: string;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  /** Temporary ID used for optimistic UI (replaced once server confirms) */
  tempId?: string;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  senderRole: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  /** True while the message is being sent (optimistic) */
  isPending?: boolean;
  /** True when the optimistic send failed */
  isFailed?: boolean;
  /** Attachment fields (optional — present only when message includes a file) */
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  hasMore: boolean;
  total?: number;
}

// ─── Socket Emit Payloads ────────────────────────────────────────────────────

export interface CreateConversationPayload {
  recipientRole: string;
  recipientId: number;
}

export interface ChatListPayload {
  page?: number;
  limit?: number;
}

export interface JoinConversationPayload {
  conversationId: number;
}

export interface LoadMessagesPayload {
  conversationId: number;
  beforeMessageId?: number;
  limit?: number;
}

export interface SendMessagePayload {
  conversationId: number;
  body: string;
  tempId: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
}

export interface ReadReceiptPayload {
  conversationId: number;
}

// ─── Socket Response / Event Payloads ────────────────────────────────────────

export interface ContactsResponse {
  contacts: ChatContact[];
}

export interface ConversationResponse {
  conversation: Conversation;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: PaginationMeta;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: PaginationMeta;
}

export interface NewMessageEvent {
  message: ChatMessage;
  conversationId: number;
}

export interface ReadUpdateEvent {
  conversationId: number;
  readerId: number;
  messageIds?: number[];
  unreadCount: number;
}

export interface ConversationListUpdateEvent {
  conversation: Conversation;
}

export interface SocketErrorEvent {
  message: string;
  code?: string;
}

// ─── Upload Response ─────────────────────────────────────────────────────────

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    name: string;
    type: string;
  };
  message?: string;
}
