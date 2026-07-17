import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { ToastService } from './toast.service';
import {
  ChatContact,
  ChatMessage,
  Conversation,
  ContactsResponse,
  ConversationListResponse,
  ConversationResponse,
  MessagesResponse,
  NewMessageEvent,
  ReadUpdateEvent,
  ConversationListUpdateEvent,
  SocketErrorEvent,
  CreateConversationPayload,
  LoadMessagesPayload,
  SendMessagePayload,
  ReadReceiptPayload,
  PaginationMeta
} from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {

  private destroy$ = new Subject<void>();

  // ─── State ─────────────────────────────────────────────────────────────────

  private contactsSubject = new BehaviorSubject<ChatContact[]>([]);
  contacts$ = this.contactsSubject.asObservable();

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();

  private activeConversationSubject = new BehaviorSubject<Conversation | null>(null);
  activeConversation$ = this.activeConversationSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  // ─── Loading States ─────────────────────────────────────────────────────────

  private loadingContactsSubject = new BehaviorSubject<boolean>(false);
  loadingContacts$ = this.loadingContactsSubject.asObservable();

  private loadingConversationsSubject = new BehaviorSubject<boolean>(false);
  loadingConversations$ = this.loadingConversationsSubject.asObservable();

  private loadingMessagesSubject = new BehaviorSubject<boolean>(false);
  loadingMessages$ = this.loadingMessagesSubject.asObservable();

  private sendingSubject = new BehaviorSubject<boolean>(false);
  sending$ = this.sendingSubject.asObservable();

  private loadingOlderSubject = new BehaviorSubject<boolean>(false);
  loadingOlder$ = this.loadingOlderSubject.asObservable();

  // ─── Pagination ─────────────────────────────────────────────────────────────

  private conversationPagination: PaginationMeta = { page: 1, limit: 20, hasMore: false };
  private messagePagination: PaginationMeta = { page: 1, limit: 30, hasMore: false };

  get hasMoreMessages(): boolean {
    return this.messagePagination.hasMore;
  }

  get hasMoreConversations(): boolean {
    return this.conversationPagination.hasMore;
  }

  // ─── Listeners registered flag ─────────────────────────────────────────────
  private listenersRegistered = false;

  constructor(
    private socketService: SocketService,
    private toastService: ToastService
  ) { }

  // ─── Initialise ────────────────────────────────────────────────────────────

  /**
   * Connect socket + register real-time listeners.
   * Call once when a chat page loads.
   */
  init(): void {
    this.socketService.connect();
    if (!this.listenersRegistered) {
      this.registerListeners();
      this.listenersRegistered = true;
    }
  }

  /**
   * Disconnect socket + clear all state.
   * Call on logout.
   */
  cleanup(): void {
    this.socketService.disconnect();
    this.listenersRegistered = false;
    this.resetState();
  }

  private resetState(): void {
    this.contactsSubject.next([]);
    this.conversationsSubject.next([]);
    this.activeConversationSubject.next(null);
    this.messagesSubject.next([]);
    this.sendingSubject.next(false);
    this.loadingMessagesSubject.next(false);
    this.loadingConversationsSubject.next(false);
    this.loadingContactsSubject.next(false);
    this.loadingOlderSubject.next(false);
    this.conversationPagination = { page: 1, limit: 20, hasMore: false };
    this.messagePagination = { page: 1, limit: 30, hasMore: false };
  }

  // ─── Real-time Listeners ───────────────────────────────────────────────────

  private registerListeners(): void {

    // ── chat:contacts:response ──────────────────────────────────────────────
    this.socketService.on<any>('chat:contacts:response')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        console.log('[chat:contacts:response]', res);
        this.loadingContactsSubject.next(false);
        if (!res?.success) return;

        // Backend returns: { data: { teachers: [...], students: [...], parents: [...] } }
        // Each item has: id, fullName, profileImage, role, email, etc.
        const data = res.data ?? {};
        const rawContacts = [
          ...(data.teachers ?? []),
          ...(data.students ?? []),
          ...(data.parents ?? [])
        ];

        const contacts: ChatContact[] = rawContacts.map((c: any) => ({
          id: c.id,
          name: c.fullName ?? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
          role: c.role ?? 'teacher',
          avatar: c.profileImage ?? null,
          isOnline: c.isOnline ?? false
        }));

        this.contactsSubject.next(contacts);
      });


    // ── chat:list:response ──────────────────────────────────────────────────
    this.socketService.on<any>('chat:list:response')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        console.log('[chat:list:response]', res);
        this.loadingConversationsSubject.next(false);
        if (!res?.success) return;
        const data = res.data ?? {};
        let incoming: Conversation[] = data.conversations ?? data ?? [];
        incoming = incoming.map(c => ({
          ...c,
          lastMessage: typeof c.lastMessage === 'object' && c.lastMessage !== null ? c.lastMessage.body : c.lastMessage
        }));
        const pagination: PaginationMeta = data.pagination ?? this.conversationPagination;
        const currentPage = pagination?.page ?? 1;
        if (currentPage === 1) {
          this.conversationsSubject.next(incoming);
        } else {
          this.conversationsSubject.next([...this.conversationsSubject.value, ...incoming]);
        }
        this.conversationPagination = pagination;
      });

    // ── chat:conversation:create:response ───────────────────────────────────
    this.socketService.on<any>('chat:conversation:create:response')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        console.log('[chat:conversation:create:response]', res);
        if (!res?.success) return;
        const conversation: Conversation = res.data;
        if (!conversation) return;
        
        if (typeof conversation.lastMessage === 'object' && conversation.lastMessage !== null) {
          conversation.lastMessage = (conversation.lastMessage as any).body;
        }
        const exists = this.conversationsSubject.value.find(c => c.id === conversation.id);
        if (!exists) {
          this.conversationsSubject.next([conversation, ...this.conversationsSubject.value]);
        }
        // Auto-select the new/existing conversation
        this.activeConversationSubject.next(conversation);
        this.messagesSubject.next([]);
        this.messagePagination = { page: 1, limit: 30, hasMore: false };
        this.loadingMessagesSubject.next(true);
        this.socketService.emit('chat:join', { conversationId: conversation.id });
        this.socketService.emit('chat:messages', { conversationId: conversation.id, limit: 30 });
        this.markRead(conversation.id);
      });

    // ── chat:join:response ──────────────────────────────────────────────────
    this.socketService.on<any>('chat:join:response')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        console.log('[chat:join:response]', res);
        // No further action needed — room joining is server-side
      });

    // ── chat:messages:response ──────────────────────────────────────────────
    this.socketService.on<any>('chat:messages:response')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        console.log('[chat:messages:response]', res);
        this.loadingMessagesSubject.next(false);
        this.loadingOlderSubject.next(false);
        if (!res?.success) return;
        const data = res.data ?? {};
        const incomingRaw: any[] = data.messages ?? data ?? [];
        const incoming: ChatMessage[] = incomingRaw.map(m => this.mapMessage(m));
        const pagination: PaginationMeta = data.pagination ?? this.messagePagination;
        const current = this.messagesSubject.value;
        // Prepend if loading older (incoming messages are older than current)
        if (
          current.length > 0 &&
          incoming.length > 0 &&
          incoming[incoming.length - 1]?.id < current[0]?.id
        ) {
          this.messagesSubject.next([...incoming, ...current]);
        } else {
          this.messagesSubject.next(incoming);
        }
        this.messagePagination = pagination;
      });

    // ── chat:message:send:response ──────────────────────────────────────────
    this.socketService.on<any>('chat:message:send:response')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        console.log('[chat:message:send:response]', res);
        this.sendingSubject.next(false);
        if (!res?.success) {
          // Remove pending message on failure
          this.messagesSubject.next(
            this.messagesSubject.value.filter(m => !m.isPending)
          );
          return;
        }
        const confirmedMsgRaw = res.data?.message;
        if (confirmedMsgRaw) {
          const confirmedMsg = this.mapMessage(confirmedMsgRaw);
          const messages = this.messagesSubject.value;
          let pendingIdx = confirmedMsg.tempId
            ? messages.findIndex(m => m.tempId === confirmedMsg.tempId)
            : -1;
            
          // Fallback if backend doesn't echo tempId
          if (pendingIdx === -1 && res.data?.tempId) {
            pendingIdx = messages.findIndex(m => m.tempId === res.data.tempId);
          }
          if (pendingIdx === -1) {
            pendingIdx = messages.findIndex(m => m.isPending && m.content === confirmedMsg.content);
          }

          if (pendingIdx > -1) {
            const updated = [...messages];
            updated[pendingIdx] = { ...confirmedMsg, isPending: false, isFailed: false };
            this.messagesSubject.next(updated);
          } else {
             // If we somehow couldn't find the pending message, just add it (though usually it would exist)
             this.messagesSubject.next([...messages, confirmedMsg]);
          }
        }
      });

    // ── chat:message:new (real-time broadcast) ──────────────────────────────
    // Payload: { conversation, message }
    this.socketService.on<any>('chat:message:new')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (!event?.message) return;
        const msg = this.mapMessage(event.message);
        const active = this.activeConversationSubject.value;
        const conversationId: number = event.conversation?.id ?? event.conversationId;
        if (active && conversationId === active.id) {
          const messages = this.messagesSubject.value;
          // Avoid duplicate if send:response already confirmed it
          const alreadyExists = messages.some(
            m => m.id === msg.id && !m.isPending
          );
          if (!alreadyExists) {
            let pendingIdx = msg.tempId
              ? messages.findIndex(m => m.tempId === msg.tempId)
              : -1;
              
            if (pendingIdx === -1 && event.tempId) {
              pendingIdx = messages.findIndex(m => m.tempId === event.tempId);
            }
            if (pendingIdx === -1) {
              // Try matching by content and pending status as fallback
              pendingIdx = messages.findIndex(m => m.isPending && m.content === msg.content);
            }

            if (pendingIdx > -1) {
              const updated = [...messages];
              updated[pendingIdx] = { ...msg, isPending: false, isFailed: false };
              this.messagesSubject.next(updated);
            } else {
              this.messagesSubject.next([...messages, msg]);
            }
          }
        }
        // Update conversation preview in sidebar
        this.updateConversationPreviewFromBroadcast(conversationId, msg);
      });

    // ── chat:read:update (real-time broadcast) ──────────────────────────────
    this.socketService.on<any>('chat:read:update')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (!event) return;
        const active = this.activeConversationSubject.value;
        if (active && event.conversationId === active.id) {
          this.messagesSubject.next(
            this.messagesSubject.value.map(m => ({ ...m, isRead: true }))
          );
        }
        this.conversationsSubject.next(
          this.conversationsSubject.value.map(c =>
            c.id === event.conversationId
              ? { ...c, unreadCount: event.unreadCount ?? 0 }
              : c
          )
        );
      });

    // ── chat:list:update (real-time broadcast: { conversationId }) ──────────
    // Server sends only conversationId — re-fetch conversation list to get latest
    this.socketService.on<any>('chat:list:update')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (!event?.conversationId) return;
        // Reload the full list to get latest lastMessage / unreadCount
        this.socketService.emit('chat:list', { page: 1, limit: 20 });
      });

    // ── chat:error ──────────────────────────────────────────────────────────
    this.socketService.on<any>('chat:error')
      .pipe(takeUntil(this.destroy$))
      .subscribe(err => {
        const msg = err?.message || 'Chat error occurred.';
        const messages = this.messagesSubject.value.filter(m => !m.isPending);
        this.messagesSubject.next(messages);
      });

    // Generic socket error (connection-level)
    this.socketService.on<{ message: string }>('error')
      .pipe(takeUntil(this.destroy$))
      .subscribe(err => {
        const msg = err?.message || 'Socket connection error.';
        this.toastService.show(msg, 'error');
      });
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  private mapMessage(m: any): ChatMessage {
    const parsedSenderId = m.senderId ?? (typeof m.sender === 'object' ? m.sender?.id : (typeof m.sender === 'number' ? m.sender : undefined));
    return {
      ...m,
      content: m.content || m.body,
      senderId: parsedSenderId,
      senderRole: m.senderRole || (m.sender?.role),
      senderName: m.senderName || (m.sender?.fullName || m.sender?.name || 'Unknown'),
      senderAvatar: m.senderAvatar || (m.sender?.profileImage || m.sender?.avatar || null)
    };
  }

  /** Load available contacts to start a conversation with */
  loadContacts(): void {
    this.loadingContactsSubject.next(true);
    this.socketService.emit('chat:contacts');
  }

  /** Load the conversation list (first page) */
  loadConversations(): void {
    this.loadingConversationsSubject.next(true);
    this.conversationPagination = { page: 1, limit: 20, hasMore: false };
    this.socketService.emit('chat:list', { page: 1, limit: 20 });
  }

  /** Load the next page of conversations */
  loadMoreConversations(): void {
    if (!this.conversationPagination.hasMore) return;
    this.loadingConversationsSubject.next(true);
    const nextPage = this.conversationPagination.page + 1;
    this.socketService.emit('chat:list', { page: nextPage, limit: 20 });
  }

  /** Create a new conversation with a contact */
  createConversation(payload: CreateConversationPayload): void {
    this.socketService.emit('chat:conversation:create', payload);
  }

  /** Select and join a conversation — loads its messages and marks as read */
  selectConversation(conversation: Conversation): void {
    if (this.activeConversationSubject.value?.id === conversation.id) return;
    this.activeConversationSubject.next(conversation);
    this.messagesSubject.next([]);
    this.messagePagination = { page: 1, limit: 30, hasMore: false };

    // Join the conversation room
    this.socketService.emit('chat:join', { conversationId: conversation.id });

    // Load messages
    this.loadingMessagesSubject.next(true);
    this.socketService.emit('chat:messages', { conversationId: conversation.id, limit: 30 });

    // Mark as read
    this.markRead(conversation.id);
  }

  /** Load older messages via infinite scroll */
  loadOlderMessages(): void {
    const active = this.activeConversationSubject.value;
    if (!active || !this.messagePagination.hasMore) return;
    const messages = this.messagesSubject.value;
    if (messages.length === 0) return;
    const oldestId = messages[0].id;
    this.loadingOlderSubject.next(true);
    const payload: LoadMessagesPayload = {
      conversationId: active.id,
      beforeMessageId: oldestId,
      limit: 30
    };
    this.socketService.emit('chat:messages', payload);
  }

  /**
   * Send a message with optimistic UI.
   * The message is immediately inserted as "pending" and replaced/removed
   * once the server confirms or rejects it.
   */
  sendMessage(content: string, currentUserId: number, currentUserName: string,
    currentUserAvatar: string | null, currentUserRole: string): void {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > 4000) {
      this.toastService.show('Message exceeds 4000 characters.', 'error');
      return;
    }

    const active = this.activeConversationSubject.value;
    if (!active) {
      this.toastService.show('No conversation selected.', 'error');
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const optimisticMsg: ChatMessage = {
      id: -1,
      tempId,
      conversationId: active.id,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      senderRole: currentUserRole,
      content: trimmed,
      createdAt: new Date().toISOString(),
      isRead: false,
      isPending: true,
      isFailed: false
    };

    this.messagesSubject.next([...this.messagesSubject.value, optimisticMsg]);
    this.sendingSubject.next(true);

    const payload: SendMessagePayload = {
      conversationId: active.id,
      body: trimmed,
      tempId
    };
    this.socketService.emit('chat:message:send', payload);

    // Sending state resets on chat:message:new (success) or chat:error (failure)
    // Add a safety timeout in case neither event fires
    setTimeout(() => {
      if (this.sendingSubject.value) {
        this.sendingSubject.next(false);
      }
    }, 10000);
  }

  /** Emit a read receipt for the active conversation */
  markRead(conversationId: number): void {
    const payload: ReadReceiptPayload = { conversationId };
    this.socketService.emit('chat:read', payload);

    // Optimistically zero out unread count locally
    const conversations = this.conversationsSubject.value.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    );
    this.conversationsSubject.next(conversations);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get activeConversation(): Conversation | null {
    return this.activeConversationSubject.value;
  }

  get currentMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Derive the other participant from a conversation (i.e., not the current user).
   */
  getOtherParticipant(conversation: Conversation, currentUserId: number) {
    if (!conversation) return {} as any;
    
    // The backend provides `otherParticipant` directly
    const other = conversation.otherParticipant;
    if (other) {
      return {
        id: other.id,
        name: other.fullName ?? `${other.firstName ?? ''} ${other.lastName ?? ''}`.trim(),
        role: other.role ?? 'user',
        avatar: other.profileImage ?? null,
        isOnline: other.isOnline ?? false
      };
    }

    // Fallback if `participants` arrives as an array
    if (Array.isArray(conversation.participants)) {
      const p = conversation.participants.find(p => p.id !== currentUserId) ?? conversation.participants[0];
      if (p) {
        return {
          id: p.id,
          name: p.fullName ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
          role: p.role ?? 'user',
          avatar: p.profileImage ?? null,
          isOnline: p.isOnline ?? false
        };
      }
    }

    // Fallback if `participants` is an object (e.g. { parent: {...}, teacher: {...}, student: {...} })
    if (conversation.participants && typeof conversation.participants === 'object') {
      const p = conversation.participants as any;
      const users = [p.teacher, p.parent, p.student].filter(u => u != null);
      const otherUser = users.find(u => u.id !== currentUserId) ?? users[0];
      if (otherUser) {
        return {
          id: otherUser.id,
          name: otherUser.fullName ?? `${otherUser.firstName ?? ''} ${otherUser.lastName ?? ''}`.trim(),
          role: otherUser.role ?? 'user',
          avatar: otherUser.profileImage ?? null,
          isOnline: otherUser.isOnline ?? false
        };
      }
    }

    // Ultimate fallback to prevent crashes
    return {
      id: -1,
      name: 'Unknown User',
      role: 'user',
      avatar: null,
      isOnline: false
    };
  }

  private updateConversationPreviewFromBroadcast(conversationId: number, message: ChatMessage): void {
    const conversations = this.conversationsSubject.value;
    const idx = conversations.findIndex(c => c.id === conversationId);
    if (idx === -1) return;

    const updated = { ...conversations[idx] };
    updated.lastMessage = message.content;
    updated.lastMessageTime = message.createdAt;

    const active = this.activeConversationSubject.value;
    const isActive = active?.id === conversationId;
    if (!isActive) {
      updated.unreadCount = (updated.unreadCount ?? 0) + 1;
    }

    const newList = [...conversations];
    newList.splice(idx, 1);
    this.conversationsSubject.next([updated, ...newList]);
  }


  // ─── Cleanup ───────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
