import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProfileService } from '../../../core/services/profile.service';

export interface SupportTicket {
  s_no?: number;
  id: number | string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | string;
  status_label?: string;
  last_message?: string;
  last_reply_by?: string;
  is_unread?: boolean;
  total_messages?: number;
  created_at: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id?: number | string;
  sender_name?: string;
  sender_role?: string;
  is_admin?: boolean;
  is_me?: boolean;
  message: string;
  created_at: string;
}

export interface SupportStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  unread_replies?: number;
}

@Component({
  selector: 'app-parent-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './parent-support.component.html',
  styleUrls: ['./parent-support.component.css']
})
export class ParentSupportComponent implements OnInit {
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isSendingReply: boolean = false;
  isLoadingThread: boolean = false;

  selectedStudentId: number | string | null = null;

  stats: SupportStats = {
    total_tickets: 0,
    open_tickets: 0,
    in_progress_tickets: 0,
    resolved_tickets: 0,
    unread_replies: 0
  };

  tickets: SupportTicket[] = [];
  selectedFilter: 'all' | 'open' | 'in_progress' | 'resolved' = 'all';
  searchQuery: string = '';

  showCreateModal: boolean = false;
  newTicket = {
    subject: '',
    category: 'Academic & Assignments',
    priority: 'medium',
    message: '',
    student_id: null as number | null
  };

  categories: string[] = [
    'General',
    'Technical Support',
    'Billing & Tuition',
    'Academic & Assignments',
    'Portal Access',
    'Other'
  ];

  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  showThreadModal: boolean = false;
  selectedTicket: SupportTicket | null = null;
  replyMessage: string = '';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.profileService.selectedStudent$.subscribe(student => {
      if (student && student.id) {
        this.selectedStudentId = student.id;
      }
    });

    if (!this.selectedStudentId) {
      const savedStudentId = localStorage.getItem('selectedStudentId');
      if (savedStudentId) {
        this.selectedStudentId = savedStudentId;
      }
    }

    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    let url = 'support';
    const params: string[] = [];

    if (this.selectedFilter !== 'all') {
      params.push(`status=${this.selectedFilter}`);
    }
    if (this.searchQuery.trim()) {
      params.push(`search=${encodeURIComponent(this.searchQuery.trim())}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    this.apiService.get<any>(url).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.data || res;
        if (data) {
          if (data.stats) {
            this.stats = {
              total_tickets: data.stats.total_tickets ?? 0,
              open_tickets: data.stats.open_tickets ?? 0,
              in_progress_tickets: data.stats.in_progress_tickets ?? 0,
              resolved_tickets: data.stats.resolved_tickets ?? 0,
              unread_replies: data.stats.unread_replies ?? 0
            };
          }

          const list = data.tickets || (Array.isArray(data) ? data : []);
          if (Array.isArray(list)) {
            this.tickets = list.map((t: any, idx: number) => ({
              s_no: t.s_no || idx + 1,
              id: t.id || t.ticket_number || idx + 1,
              ticket_number: t.ticket_number || `TCK-2026-${idx + 1}`,
              subject: t.subject || 'Support Inquiry',
              category: t.category || 'General',
              priority: (t.priority || 'medium').toLowerCase(),
              status: (t.status || 'open').toLowerCase(),
              status_label: t.status_label || this.formatStatusLabel(t.status),
              last_message: t.last_message || t.message || '',
              last_reply_by: t.last_reply_by || 'admin',
              is_unread: !!t.is_unread,
              total_messages: t.total_messages || (t.messages ? t.messages.length : 1),
              created_at: t.created_at || t.createdAt || new Date().toISOString(),
              messages: t.messages || []
            }));

            if (!data.stats) {
              this.stats.total_tickets = this.tickets.length;
              this.stats.open_tickets = this.tickets.filter(t => t.status === 'open').length;
              this.stats.in_progress_tickets = this.tickets.filter(t => t.status === 'in_progress').length;
              this.stats.resolved_tickets = this.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
            }
          }
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.warn('GET /api/support error:', err);
        this.cdr.markForCheck();
      }
    });
  }

  setFilter(filter: 'all' | 'open' | 'in_progress' | 'resolved'): void {
    this.selectedFilter = filter;
    this.loadTickets();
  }

  onSearch(): void {
    this.loadTickets();
  }

  openCreateModal(): void {
    this.newTicket = {
      subject: '',
      category: 'Academic & Assignments',
      priority: 'medium',
      message: '',
      student_id: this.selectedStudentId ? Number(this.selectedStudentId) : null
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitTicket(): void {
    if (!this.newTicket.subject.trim()) {
      this.toastService.warning('Please enter a ticket subject.');
      return;
    }
    if (!this.newTicket.message.trim()) {
      this.toastService.warning('Please describe your issue or question.');
      return;
    }

    this.isSubmitting = true;
    const payload: any = {
      subject: this.newTicket.subject.trim(),
      category: this.newTicket.category,
      priority: this.newTicket.priority,
      message: this.newTicket.message.trim()
    };
    if (this.newTicket.student_id || this.selectedStudentId) {
      payload.student_id = this.newTicket.student_id || Number(this.selectedStudentId);
    }

    this.apiService.post<any>('support', payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toastService.success(res?.message || 'Support ticket submitted successfully! Our team will respond shortly.');
        this.closeCreateModal();
        this.loadTickets();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastService.error(err?.error?.message || err?.message || 'Failed to submit ticket. Please try again.');
      }
    });
  }

  openThread(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.showThreadModal = true;
    this.replyMessage = '';
    this.isLoadingThread = true;

    this.apiService.get<any>(`support/${ticket.id}`).subscribe({
      next: (res: any) => {
        this.isLoadingThread = false;
        const data = res?.data || res;
        if (data) {
          if (data.messages && Array.isArray(data.messages)) {
            this.selectedTicket!.messages = data.messages;
          }
          if (data.status) {
            this.selectedTicket!.status = data.status.toLowerCase();
          }
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoadingThread = false;
        console.warn(`GET /api/support/${ticket.id} error:`, err);
        if (!this.selectedTicket!.messages || this.selectedTicket!.messages.length === 0) {
          this.selectedTicket!.messages = [
            {
              sender_name: 'You',
              sender_role: 'parent',
              is_admin: false,
              is_me: true,
              message: ticket.last_message || ticket.subject,
              created_at: ticket.created_at
            }
          ];
        }
        this.cdr.markForCheck();
      }
    });
  }

  closeThreadModal(): void {
    this.showThreadModal = false;
    this.selectedTicket = null;
    this.replyMessage = '';
  }

  sendReply(): void {
    if (!this.replyMessage.trim() || !this.selectedTicket) return;

    this.isSendingReply = true;
    const msgText = this.replyMessage.trim();

    this.apiService.post<any>(`support/${this.selectedTicket.id}/reply`, {
      message: msgText
    }).subscribe({
      next: (res: any) => {
        this.isSendingReply = false;
        this.replyMessage = '';
        this.toastService.success(res?.message || 'Reply sent successfully!');

        if (!this.selectedTicket!.messages) {
          this.selectedTicket!.messages = [];
        }
        this.selectedTicket!.messages.push({
          id: Date.now(),
          sender_name: 'You',
          sender_role: 'parent',
          is_admin: false,
          is_me: true,
          message: msgText,
          created_at: new Date().toISOString()
        });
        this.loadTickets();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isSendingReply = false;
        this.toastService.error(err?.error?.message || err?.message || 'Failed to send reply.');
      }
    });
  }

  formatStatusLabel(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'in_progress' || s === 'in progress') return 'IN PROGRESS';
    if (s === 'resolved') return 'RESOLVED';
    if (s === 'closed') return 'CLOSED';
    return 'OPEN';
  }

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'bg-success-subtle text-success border border-success-subtle';
    if (s === 'in_progress' || s === 'in progress') return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
  }

  getPriorityBadgeClass(priority: string): string {
    const p = (priority || '').toLowerCase();
    if (p === 'urgent') return 'bg-danger text-white';
    if (p === 'high') return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (p === 'medium') return 'bg-primary-subtle text-primary border border-primary-subtle';
    return 'bg-success-subtle text-success border border-success-subtle';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
