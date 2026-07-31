import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { Conversation, ChatMessage, ChatContact } from '../../../core/models/chat.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-messages.component.html',
  styleUrl: './parent-messages.component.css'
})
export class ParentMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatContainer') chatContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

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
  currentUserRole = 'parent';

  // ─── Loading ────────────────────────────────────────────────────────────────
  loadingConversations = false;
  loadingMessages = false;
  loadingOlder = false;
  sending = false;

  // ─── Attachment State ───────────────────────────────────────────────────────
  selectedFile: File | null = null;
  attachmentPreview: string | null = null;
  uploading = false;
  uploadError: string | null = null;

  // ─── Image Lightbox ─────────────────────────────────────────────────────────
  lightboxImageUrl: string | null = null;

  // ─── Allowed file types & max size ──────────────────────────────────────────
  readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  readonly ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  // ─── UI State ───────────────────────────────────────────────────────────────
  showContactsPanel = false;
  private shouldScrollToBottom = false;
  private preserveScrollPosition = false;
  private previousScrollHeight = 0;

  private subs: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private profileService: ProfileService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

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
    if (!text && !this.selectedFile) return;
    if (this.sending || this.uploading) return;

    if (this.selectedFile) {
      // Upload the file first, then send the socket message
      this.uploading = true;
      this.uploadError = null;
      this.cdr.markForCheck();

      this.chatService.uploadAttachment(this.selectedFile).subscribe({
        next: (res) => {
          this.uploading = false;
          if (res?.data) {
            const attachment = {
              attachmentUrl: res.data.url,
              attachmentName: res.data.name,
              attachmentType: res.data.type
            };
            this.newMessageText = '';
            this.shouldScrollToBottom = true;
            this.chatService.sendMessage(
              text,
              this.currentUserId,
              this.currentUserName,
              this.currentUserAvatar,
              this.currentUserRole,
              attachment
            );
            this.removeAttachment();
          } else {
            this.uploadError = 'Upload failed. Please try again.';
            this.toastService.show('File upload failed.', 'error');
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.uploading = false;
          this.uploadError = err?.message || 'Upload failed. Please try again.';
          this.toastService.show('File upload failed.', 'error');
          this.cdr.markForCheck();
        }
      });
    } else {
      // Text-only message (existing flow)
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
  }

  // ─── Attachment Methods ─────────────────────────────────────────────────────

  onAttachmentClick(): void {
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    input.value = '';

    const allAllowed = [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOC_TYPES];
    if (!allAllowed.includes(file.type)) {
      this.toastService.show('Unsupported file type. Please select an image or document.', 'error');
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.toastService.show('File is too large. Maximum size is 10 MB.', 'error');
      return;
    }

    this.selectedFile = file;
    this.uploadError = null;

    // Create preview for images
    if (this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        this.attachmentPreview = reader.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    } else {
      this.attachmentPreview = null;
    }
    this.cdr.markForCheck();
  }

  removeAttachment(): void {
    this.selectedFile = null;
    this.attachmentPreview = null;
    this.uploadError = null;
    this.cdr.markForCheck();
  }

  // ─── Attachment Display Helpers ─────────────────────────────────────────────

  isImageAttachment(message: ChatMessage): boolean {
    if (!message.attachmentType) return false;
    return message.attachmentType.startsWith('image/');
  }

  isDocumentAttachment(message: ChatMessage): boolean {
    if (!message.attachmentUrl || !message.attachmentType) return false;
    return !message.attachmentType.startsWith('image/');
  }

  getAttachmentFullUrl(path: string | null | undefined): string {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/');
    if (normalized.startsWith('http')) return normalized;
    const base = environment.imageBaseUrl.endsWith('/')
      ? environment.imageBaseUrl : `${environment.imageBaseUrl}/`;
    return `${base}${normalized.startsWith('/') ? normalized.slice(1) : normalized}`;
  }

  getFileIcon(type: string | null | undefined): string {
    if (!type) return 'fa-file';
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('word') || type.includes('document')) return 'fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fa-file-excel';
    if (type.includes('text')) return 'fa-file-lines';
    return 'fa-file';
  }

  openImagePreview(url: string): void {
    this.lightboxImageUrl = url;
  }

  closeImagePreview(): void {
    this.lightboxImageUrl = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    return message.senderRole === 'parent' || message.senderId === this.currentUserId;
  }

  // ─── TrackBy ────────────────────────────────────────────────────────────────

  trackByConvId(_: number, conv: Conversation): number { return conv.id; }
  trackByMsgId(_: number, msg: ChatMessage): string | number { return msg.tempId ?? msg.id; }
  trackByContactId(_: number, contact: ChatContact): number { return contact.id; }
}
