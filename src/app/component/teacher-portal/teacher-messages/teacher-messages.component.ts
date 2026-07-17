import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { ProfileService } from '../../../core/services/profile.service';
import { Conversation, ChatMessage, ChatContact } from '../../../core/models/chat.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-teacher-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-messages.component.html',
  styleUrl: './teacher-messages.component.css'
})
export class TeacherMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatContainer') chatContainerRef!: ElementRef<HTMLDivElement>;

  // ─── State ─────────────────────────────────────────────────────────────────
  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  contacts: ChatContact[] = [];
  activeConversation: Conversation | null = null;
  newMessageText = '';

  // ─── Current User ───────────────────────────────────────────────────────────
  currentUserId = 0;
  currentUserName = '';
  currentUserAvatar: string | null = null;
  currentUserRole = 'teacher';

  // ─── Loading ────────────────────────────────────────────────────────────────
  loadingConversations = false;
  loadingMessages = false;
  loadingOlder = false;
  sending = false;

  // ─── UI State ───────────────────────────────────────────────────────────────
  showContactsPanel = false;
  private shouldScrollToBottom = false;
  private preserveScrollPosition = false;
  private previousScrollHeight = 0;

  private subs: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadCurrentUser();
    this.chatService.init();

    this.subs.push(
      this.chatService.conversations$.subscribe(convs => {
        this.conversations = convs;
        this.cdr.markForCheck();
      }),
      this.chatService.messages$.subscribe(msgs => {
        const wasAtBottom = this.isAtBottom();
        const wasLoadingOlder = this.loadingOlder;

        if (wasLoadingOlder) {
          this.preserveScrollPosition = true;
          this.previousScrollHeight = this.chatContainerRef?.nativeElement.scrollHeight ?? 0;
        } else if (wasAtBottom) {
          this.shouldScrollToBottom = true;
        }

        this.messages = msgs;
        this.cdr.markForCheck();
      }),
      this.chatService.contacts$.subscribe(c => {
        this.contacts = c;
        this.cdr.markForCheck();
      }),
      this.chatService.activeConversation$.subscribe(conv => {
        this.activeConversation = conv;
        this.shouldScrollToBottom = true;
        this.cdr.markForCheck();
      }),
      this.chatService.loadingConversations$.subscribe(v => {
        this.loadingConversations = v;
        this.cdr.markForCheck();
      }),
      this.chatService.loadingMessages$.subscribe(v => {
        this.loadingMessages = v;
        if (!v) this.shouldScrollToBottom = true;
        this.cdr.markForCheck();
      }),
      this.chatService.loadingOlder$.subscribe(v => {
        this.loadingOlder = v;
        this.cdr.markForCheck();
      }),
      this.chatService.sending$.subscribe(v => {
        this.sending = v;
        if (!v) this.shouldScrollToBottom = true;
        this.cdr.markForCheck();
      })
    );

    this.chatService.loadConversations();
    this.chatService.loadContacts();
  }

  ngAfterViewChecked(): void {
    if (this.preserveScrollPosition && this.chatContainerRef) {
      const el = this.chatContainerRef.nativeElement;
      el.scrollTop = el.scrollHeight - this.previousScrollHeight;
      this.preserveScrollPosition = false;
    } else if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ─── User ───────────────────────────────────────────────────────────────────

  private loadCurrentUser(): void {
    this.subs.push(
      this.profileService.profile$.subscribe(profile => {
        if (profile?.data) {
          const user = profile.data.user ?? profile.data;
          this.currentUserId = user.id ?? 0;
          this.currentUserName = user.fullName ?? user.name ?? '';
          this.currentUserAvatar = user.profileImage ?? user.avatar ?? null;
          this.cdr.markForCheck();
        }
      })
    );
  }

  // ─── Conversation Selection ─────────────────────────────────────────────────

  selectConversation(conv: Conversation): void {
    if (this.activeConversation?.id === conv.id) return;
    this.shouldScrollToBottom = true;
    this.chatService.selectConversation(conv);
  }

  selectContact(contact: ChatContact): void {
    this.chatService.createConversation({
      recipientRole: contact.role,
      recipientId: contact.id
    });
    this.showContactsPanel = false;
  }

  toggleContactsPanel(): void {
    this.showContactsPanel = !this.showContactsPanel;
  }

  // ─── Messages ───────────────────────────────────────────────────────────────

  sendMessage(): void {
    const text = this.newMessageText.trim();
    if (!text || this.sending) return;
    this.newMessageText = '';
    this.shouldScrollToBottom = true;
    this.chatService.sendMessage(
      text,
      this.currentUserId,
      this.currentUserName,
      this.currentUserAvatar,
      this.currentUserRole
    );
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLDivElement;
    if (el.scrollTop <= 80 && !this.loadingOlder && this.chatService.hasMoreMessages) {
      this.chatService.loadOlderMessages();
    }
  }

  // ─── Scroll Helpers ─────────────────────────────────────────────────────────

  private isAtBottom(): boolean {
    if (!this.chatContainerRef) return true;
    const el = this.chatContainerRef.nativeElement;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainerRef) {
        this.chatContainerRef.nativeElement.scrollTop =
          this.chatContainerRef.nativeElement.scrollHeight;
      }
    }, 0);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getOtherParticipant(conv: Conversation) {
    return this.chatService.getOtherParticipant(conv, this.currentUserId);
  }

  getAvatarUrl(avatar: string | null | undefined): string {
    if (!avatar) return 'assets/img/placeholder.jpg';
    const normalizedAvatar = avatar.replace(/\\/g, '/');
    if (normalizedAvatar.startsWith('http') || normalizedAvatar.startsWith('data:') || normalizedAvatar.startsWith('assets/')) {
      return normalizedAvatar;
    }
    const base = environment.imageBaseUrl.endsWith('/')
      ? environment.imageBaseUrl : `${environment.imageBaseUrl}/`;
    return `${base}${normalizedAvatar.startsWith('/') ? normalizedAvatar.slice(1) : normalizedAvatar}`;
  }

  formatTime(isoString: string | null | undefined): string {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatLastMessageTime(isoString: string | null | undefined): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  isMyMessage(message: ChatMessage): boolean {
    return Number(message.senderId) === Number(this.currentUserId);
  }

  // ─── TrackBy ────────────────────────────────────────────────────────────────

  trackByConvId(_: number, conv: Conversation): number { return conv.id; }
  trackByMsgId(_: number, msg: ChatMessage): string | number { return msg.tempId ?? msg.id; }
  trackByContactId(_: number, contact: ChatContact): number { return contact.id; }
}
