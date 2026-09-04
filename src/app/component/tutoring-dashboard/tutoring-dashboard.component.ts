import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from 'src/environments/environment';

export interface TutoringUserProfile {
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phone: string;
  program: string;
  enrollmentDate: string;
  address: string;
  notes: string;
  gradeLevel?: string;
  profileImage?: string;
}

interface TutoringAssignment {
  id: number | string;
  assignment_id?: number | string;
  title: string;
  subject: string;
  dueDate?: string;
  due_date?: string;
  status: 'Pending' | 'Submitted' | 'Graded' | string;
  score?: string;
  marks_obtained?: number | null;
  total_points?: number | string;
  instructions?: string;
  description?: string;
  reading_instructions?: string;
  submission_text?: string;
  attachment_url?: string;
  my_submission?: any;
}

export interface TutoringPaymentStats {
  current_balance_due?: number;
  formatted_balance_due?: string;
  due_date_text?: string;
  total_paid_this_year?: number;
  formatted_total_paid?: string;
  paid_cycles_count?: number;
  paid_cycles_text?: string;
  monthly_plan_rate?: number;
  formatted_plan_rate?: string;
  plan_description?: string;
  currency?: string;
  currencySymbol?: string;
}

export interface TutoringStatement {
  s_no?: number;
  id?: string | number;
  invoice_id?: number | string;
  invoice_number?: string;
  month?: string;
  billing_cycle?: string;
  program_service?: string;
  amount?: number;
  amountUSD?: number;
  formatted_amount?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | string;
  due_date?: string;
  dueDate?: string;
  action?: string;
  can_pay?: boolean;
  is_paid?: boolean;
  receipt_url?: string;
  service?: string;
  total?: number;
}

@Component({
  selector: 'app-tutoring-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutoring-dashboard.component.html',
  styleUrl: './tutoring-dashboard.component.css'
})
export class TutoringDashboardComponent implements OnInit {
  activeTab: 'assignments' | 'payments' | 'profile' | 'support' = 'assignments';
  selectedSubjectFilter: string = 'All';
  isSidebarOpen: boolean = false;
  isLoadingAssignments: boolean = false;
  isLoadingPayments: boolean = false;
  isPayingInvoiceId: number | string | null = null;

  // Support Tab State
  isLoadingSupport: boolean = false;
  isSubmittingSupport: boolean = false;
  isSendingSupportReply: boolean = false;
  isLoadingSupportThread: boolean = false;

  supportStats = {
    total_tickets: 0,
    open_tickets: 0,
    in_progress_tickets: 0,
    resolved_tickets: 0,
    unread_replies: 0
  };

  supportTickets: any[] = [];
  selectedSupportFilter: 'all' | 'open' | 'in_progress' | 'resolved' = 'all';
  supportSearchQuery: string = '';
  baseUrl = environment.imageBaseUrl;
  showSupportCreateModal: boolean = false;
  newSupportTicket = {
    subject: '',
    category: 'Academic & Assignments',
    priority: 'medium',
    message: ''
  };

  supportCategories: string[] = [
    'General',
    'Technical Support',
    'Billing & Tuition',
    'Academic & Assignments',
    'Portal Access',
    'Other'
  ];

  supportPriorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  showSupportThreadModal: boolean = false;
  selectedSupportTicket: any = null;
  supportReplyMessage: string = '';

  // Details Modal state
  showDetailsModal: boolean = false;
  selectedAssignmentForDetails: TutoringAssignment | null = null;

  // Submit Modal state
  showSubmitModal: boolean = false;
  selectedAssignmentForSubmit: TutoringAssignment | null = null;
  submissionText: string = '';
  selectedSubmitFile: File | null = null;
  isSubmitting: boolean = false;

  // View Submission Modal state
  showViewModal: boolean = false;
  viewingAssignment: TutoringAssignment | null = null;

  // Edit Profile Modal state
  showEditProfileModal: boolean = false;
  gradeOptions: string[] = [
    'Pre-K',
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    'Adult Learner / Tutoring',
    'Adult Learner'
  ];
  editProfileData = {
    firstName: '',
    lastName: '',
    phone: '',
    gradeLevel: ''
  };
  selectedProfileImageFile: File | null = null;
  profileImagePreview: string | null = null;
  isUpdatingProfile: boolean = false;

  // Change Password Modal state
  showChangePasswordModal: boolean = false;
  changePasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isChangingPassword: boolean = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // User Profile details
  userProfile: TutoringUserProfile = {
    firstName: 'Fatima',
    lastName: 'Al-Mansoor',
    fullName: 'Fatima Al-Mansoor',
    email: 'fatima.tutoring@tiaglobal.org',
    phone: '+1 (610) 977-1700',
    program: 'Adult Learning & Tutoring (Math & English)',
    enrollmentDate: 'January 15, 2026',
    address: 'Philadelphia, PA',
    notes: 'Enrolled in 1-on-1 Math and Practical English Reading & Writing.',
    gradeLevel: 'Adult Learner / Tutoring',
    profileImage: ''
  };

  assignments: TutoringAssignment[] = [];

  // Tutoring Stats & Statements in USD ($)
  paymentStats: TutoringPaymentStats = {
    current_balance_due: 250.00,
    formatted_balance_due: '$250.00',
    due_date_text: 'Due by Sep 10, 2026',
    total_paid_this_year: 500.00,
    formatted_total_paid: '$500.00',
    paid_cycles_count: 2,
    paid_cycles_text: '2 Monthly Cycles Paid',
    monthly_plan_rate: 250.00,
    formatted_plan_rate: '$250.00 /mo',
    plan_description: 'Adult Math & English 1-on-1'
  };

  statements: TutoringStatement[] = [
    {
      s_no: 1,
      id: 'INV-20260903-48-3550',
      invoice_id: 46,
      invoice_number: 'INV-20260903-48-3550',
      month: 'September 2026',
      billing_cycle: 'September 2026',
      program_service: 'Adult Math & English Tutoring (Monthly)',
      amount: 250.00,
      formatted_amount: '$250.00',
      status: 'Pending',
      due_date: 'Sep 10, 2026',
      action: 'Pay Now',
      can_pay: true,
      is_paid: false
    },
    {
      s_no: 2,
      id: 'INV-20260803-48-1120',
      invoice_id: 45,
      invoice_number: 'INV-20260803-48-1120',
      month: 'August 2026',
      billing_cycle: 'August 2026',
      program_service: 'Adult Math & English Tutoring (Monthly)',
      amount: 250.00,
      formatted_amount: '$250.00',
      status: 'Paid',
      due_date: 'Aug 10, 2026',
      action: 'Download Receipt',
      can_pay: false,
      is_paid: true
    },
    {
      s_no: 3,
      id: 'INV-20260703-48-9901',
      invoice_id: 44,
      invoice_number: 'INV-20260703-48-9901',
      month: 'July 2026',
      billing_cycle: 'July 2026',
      program_service: 'Adult Math & English Tutoring (Monthly)',
      amount: 250.00,
      formatted_amount: '$250.00',
      status: 'Paid',
      due_date: 'Jul 10, 2026',
      action: 'Download Receipt',
      can_pay: false,
      is_paid: true
    }
  ];

  // Legacy fallback alias
  get payments(): TutoringStatement[] {
    return this.statements;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private assignmentService: AssignmentService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Check for return from Stripe checkout
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const status = params['status'];

      if (status === 'success' && sessionId) {
        this.activeTab = 'payments';
        this.verifyStripeSession(sessionId);
      } else if (status === 'cancelled') {
        this.toastService.warning('Payment was cancelled.');
        this.cleanQueryParams();
      }
    });

    this.loadTutoringProfile();
    this.loadTutoringData();
    this.loadTutoringPayments();
  }

  private cleanQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private verifyStripeSession(sessionId: string): void {
    this.isLoadingPayments = true;
    this.apiService.get<any>(`payment/verify-session?session_id=${encodeURIComponent(sessionId)}`).subscribe({
      next: (res: any) => {
        this.isLoadingPayments = false;
        const inv = res?.data?.invoiceNumber || res?.data?.invoiceId || '';
        this.toastService.success(res?.message || (inv ? `Payment verified for statement ${inv}!` : 'Tutoring payment completed successfully!'));
        this.cleanQueryParams();
        this.loadTutoringPayments();
        this.loadTutoringProfile();
      },
      error: (err: any) => {
        this.isLoadingPayments = false;
        console.warn('Session verification error/fallback:', err);
        this.cleanQueryParams();
        this.loadTutoringPayments();
      }
    });
  }

  loadTutoringPayments(): void {
    this.isLoadingPayments = true;
    this.apiService.get<any>('tutoring/payments').subscribe({
      next: (res: any) => {
        this.isLoadingPayments = false;
        const data = res?.data || res;
        if (data) {
          if (data.learner) {
            this.applyProfileData(data.learner);
          }
          if (data.stats) {
            this.paymentStats = {
              current_balance_due: data.stats.current_balance_due ?? 0,
              formatted_balance_due: data.stats.formatted_balance_due || `$${Number(data.stats.current_balance_due || 0).toFixed(2)}`,
              due_date_text: data.stats.due_date_text || 'Due by Sep 10, 2026',
              total_paid_this_year: data.stats.total_paid_this_year ?? 0,
              formatted_total_paid: data.stats.formatted_total_paid || `$${Number(data.stats.total_paid_this_year || 0).toFixed(2)}`,
              paid_cycles_count: data.stats.paid_cycles_count ?? 0,
              paid_cycles_text: data.stats.paid_cycles_text || `${data.stats.paid_cycles_count || 0} Monthly Cycles Paid`,
              monthly_plan_rate: data.stats.monthly_plan_rate ?? 0,
              formatted_plan_rate: data.stats.formatted_plan_rate || `$${Number(data.stats.monthly_plan_rate || 0).toFixed(2)} /mo`,
              plan_description: data.stats.plan_description || 'Adult Math & English 1-on-1'
            };
          }
          const list = data.statements || data.payments || (Array.isArray(data) ? data : []);
          if (Array.isArray(list) && list.length > 0) {
            this.statements = list.map((st: any, idx: number) => ({
              s_no: st.s_no || idx + 1,
              id: st.id || st.invoice_number || `INV-${st.invoice_id || idx + 1}`,
              invoice_id: st.invoice_id || st.id,
              invoice_number: st.invoice_number || st.id,
              month: st.month || st.billing_cycle || 'September 2026',
              billing_cycle: st.billing_cycle || st.month || 'September 2026',
              program_service: st.program_service || st.service || 'Adult Math & English Tutoring (Monthly)',
              amount: st.amount ?? st.total ?? 250,
              amountUSD: st.amountUSD ?? st.amount ?? 250,
              formatted_amount: st.formatted_amount || `$${Number(st.amount ?? st.total ?? 250).toFixed(2)}`,
              status: st.status === 'PAID' ? 'Paid' : (st.status === 'OVERDUE' ? 'Overdue' : (st.status || 'Pending')),
              due_date: st.due_date || st.dueDate || 'Sep 10, 2026',
              action: st.action || (st.status === 'Paid' ? 'Download Receipt' : 'Pay Now'),
              can_pay: st.can_pay !== undefined ? st.can_pay : (st.status !== 'Paid'),
              is_paid: st.is_paid !== undefined ? st.is_paid : (st.status === 'Paid'),
              receipt_url: st.receipt_url || st.receiptUrl
            }));
          }
        }
      },
      error: (err: any) => {
        this.isLoadingPayments = false;
        console.warn('GET /api/tutoring/payments error, keeping fallback state:', err);
      }
    });
  }

  payStatement(statement?: TutoringStatement): void {
    let invoiceId: number | string | null = null;
    if (statement) {
      invoiceId = statement.invoice_id || statement.id || null;
    } else {
      const pending = this.statements.find(s => s.status !== 'Paid');
      invoiceId = (pending ? (pending.invoice_id || pending.id) : (this.statements[0]?.invoice_id || this.statements[0]?.id || 46)) ?? 46;
    }

    if (!invoiceId) return;

    this.isPayingInvoiceId = invoiceId;

    const currentPath = window.location.pathname;
    const origin = window.location.origin;
    const successUrl = `${origin}${currentPath}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}&status=success`;
    const cancelUrl = `${origin}${currentPath}?invoice_id=${invoiceId}&status=cancelled`;

    this.apiService.post<any>('payment/create-checkout-session', {
      invoice_id: invoiceId,
      success_url: successUrl,
      cancel_url: cancelUrl
    }).subscribe({
      next: (res: any) => {
        this.isPayingInvoiceId = null;
        const checkoutUrl = res?.data?.url || res?.url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          this.toastService.error('Unable to initiate Stripe checkout. Please try again.');
        }
      },
      error: (err: any) => {
        this.isPayingInvoiceId = null;
        this.toastService.error(err?.error?.message || err?.message || 'Failed to create checkout session.');
      }
    });
  }

  downloadReceipt(statement: TutoringStatement): void {
    if (statement.receipt_url) {
      window.open(statement.receipt_url, '_blank');
    } else {
      this.toastService.info(`Downloading official receipt for ${statement.invoice_number || statement.id}...`);
    }
  }

  loadTutoringProfile(): void {
    this.apiService.get<any>('tutoring/profile').subscribe({
      next: (res: any) => {
        const data = res?.data?.profile || res?.data?.user || res?.data || res?.profile || res?.user;
        if (data) {
          this.applyProfileData(data);
        }
      },
      error: (err: any) => {
        console.warn('GET /api/tutoring/profile fallback:', err);
      }
    });
  }

  private applyProfileData(data: any): void {
    if (!data) return;
    const fn = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim();
    if (fn) {
      this.userProfile.fullName = fn;
    }
    this.userProfile.firstName = data.firstName || this.userProfile.firstName || (fn ? fn.split(' ')[0] : '');
    this.userProfile.lastName = data.lastName || this.userProfile.lastName || (fn ? fn.split(' ').slice(1).join(' ') : '');
    if (data.email) this.userProfile.email = data.email;
    if (data.phone) this.userProfile.phone = data.phone;
    if (data.gradeLevel) this.userProfile.gradeLevel = data.gradeLevel;
    if (data.profileImage || data.avatar) this.userProfile.profileImage = data.profileImage || data.avatar;
    if (data.program || data.academy || data.subject) {
      this.userProfile.program = data.program || data.academy || data.subject;
    }
    if (data.address) this.userProfile.address = data.address;
    if (data.enrollmentDate) this.userProfile.enrollmentDate = data.enrollmentDate;
    if (data.notes) this.userProfile.notes = data.notes;
  }

  loadTutoringData(): void {
    this.isLoadingAssignments = true;

    // Fetch dashboard/tutoring (which returns learner, upcomingSession, payments, and assignments)
    this.apiService.get<any>('dashboard/tutoring').subscribe({
      next: (res: any) => {
        this.isLoadingAssignments = false;
        const data = res?.data || res;
        if (data) {
          // 1. Learner Profile
          if (data.learner) {
            this.applyProfileData(data.learner);
          }

          // 2. Assignments from dashboard
          if (Array.isArray(data.assignments) && data.assignments.length > 0) {
            this.parseAndSetAssignments(data.assignments);
          } else {
            // Fallback to /api/assignments/tutoring
            this.loadTutoringAssignmentsFallback();
          }

          // 3. Payments
          if (Array.isArray(data.payments) && data.payments.length > 0) {
            this.statements = data.payments;
          }
        }
      },
      error: () => {
        this.loadTutoringAssignmentsFallback();
      }
    });

    // Also fetch basic profile as extra fallback
    this.apiService.get<any>('users/auth/profile').subscribe({
      next: (res: any) => {
        const user = res?.data?.user || res?.user || res?.data || res;
        if (user) {
          this.applyProfileData(user);
        }
      },
      error: () => { }
    });
  }

  loadTutoringAssignments(): void {
    this.loadTutoringData();
  }

  private loadTutoringAssignmentsFallback(): void {
    this.assignmentService.getTutoringAssignments().subscribe({
      next: (res: any) => {
        this.isLoadingAssignments = false;
        const list = res?.data || res?.assignments || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          this.parseAndSetAssignments(list);
        }
      },
      error: () => {
        this.isLoadingAssignments = false;
      }
    });
  }

  private parseAndSetAssignments(rawList: any[]): void {
    this.assignments = rawList.map((item: any) => {
      let status = 'Pending';
      const rawStatus = (item.status || item.submission_status || '').toLowerCase();
      if (rawStatus === 'submitted') {
        status = 'Submitted';
      } else if (rawStatus === 'graded' || (item.marks_obtained !== null && item.marks_obtained !== undefined) || (item.score !== null && item.score !== undefined)) {
        status = 'Graded';
      }

      const due = item.dueDate || item.due_date;
      const formattedDueDate = due ? new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Due Date';

      const numericId = item.numericId || (typeof item.id === 'string' && item.id.startsWith('asg_') ? item.id.replace('asg_', '') : item.id);

      return {
        id: numericId || item.id,
        assignment_id: numericId || item.assignment_id || item.id,
        title: item.title || 'Untitled Assignment',
        subject: item.subject || 'General',
        dueDate: formattedDueDate,
        due_date: due,
        status: status,
        score: item.score ? String(item.score) : (item.marks_obtained ? `${item.marks_obtained}/${item.totalPoints || item.total_points || 100}` : (item.grade || undefined)),
        instructions: item.instructions || item.reading_instructions || item.description || '',
        description: item.description,
        reading_instructions: item.reading_instructions,
        submission_text: item.submissionText || item.submission_text || item.my_submission?.submission_text || '',
        attachment_url: item.attachmentUrl || item.attachment_url || item.my_submission?.attachment_url || '',
        my_submission: item.my_submission
      };
    });
  }

  setTab(tab: 'assignments' | 'payments' | 'profile' | 'support'): void {
    this.activeTab = tab;
    if (tab === 'support') {
      this.loadSupportTickets();
    }
  }

  loadSupportTickets(): void {
    this.isLoadingSupport = true;
    let url = 'support';
    const params: string[] = [];

    if (this.selectedSupportFilter !== 'all') {
      params.push(`status=${this.selectedSupportFilter}`);
    }
    if (this.supportSearchQuery.trim()) {
      params.push(`search=${encodeURIComponent(this.supportSearchQuery.trim())}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    this.apiService.get<any>(url).subscribe({
      next: (res: any) => {
        this.isLoadingSupport = false;
        const data = res?.data || res;
        if (data) {
          if (data.stats) {
            this.supportStats = {
              total_tickets: data.stats.total_tickets ?? 0,
              open_tickets: data.stats.open_tickets ?? 0,
              in_progress_tickets: data.stats.in_progress_tickets ?? 0,
              resolved_tickets: data.stats.resolved_tickets ?? 0,
              unread_replies: data.stats.unread_replies ?? 0
            };
          }

          const list = data.tickets || (Array.isArray(data) ? data : []);
          if (Array.isArray(list)) {
            this.supportTickets = list.map((t: any, idx: number) => ({
              s_no: t.s_no || idx + 1,
              id: t.id || t.ticket_number || idx + 1,
              ticket_number: t.ticket_number || `TCK-2026-${idx + 1}`,
              subject: t.subject || 'Support Inquiry',
              category: t.category || 'General',
              priority: (t.priority || 'medium').toLowerCase(),
              status: (t.status || 'open').toLowerCase(),
              status_label: t.status_label || (t.status === 'in_progress' ? 'IN PROGRESS' : (t.status === 'resolved' ? 'RESOLVED' : 'OPEN')),
              last_message: t.last_message || t.message || '',
              last_reply_by: t.last_reply_by || 'admin',
              is_unread: !!t.is_unread,
              total_messages: t.total_messages || (t.messages ? t.messages.length : 1),
              created_at: t.created_at || t.createdAt || new Date().toISOString(),
              messages: t.messages || []
            }));

            if (!data.stats) {
              this.supportStats.total_tickets = this.supportTickets.length;
              this.supportStats.open_tickets = this.supportTickets.filter(t => t.status === 'open').length;
              this.supportStats.in_progress_tickets = this.supportTickets.filter(t => t.status === 'in_progress').length;
              this.supportStats.resolved_tickets = this.supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
            }
          }
        }
      },
      error: (err: any) => {
        this.isLoadingSupport = false;
        console.warn('GET /api/support error:', err);
      }
    });
  }

  setSupportFilter(filter: 'all' | 'open' | 'in_progress' | 'resolved'): void {
    this.selectedSupportFilter = filter;
    this.loadSupportTickets();
  }

  onSupportSearch(): void {
    this.loadSupportTickets();
  }

  openSupportCreateModal(): void {
    this.newSupportTicket = {
      subject: '',
      category: 'Academic & Assignments',
      priority: 'medium',
      message: ''
    };
    this.showSupportCreateModal = true;
  }

  closeSupportCreateModal(): void {
    this.showSupportCreateModal = false;
  }

  submitSupportTicket(): void {
    if (!this.newSupportTicket.subject.trim()) {
      this.toastService.warning('Please enter a ticket subject.');
      return;
    }
    if (!this.newSupportTicket.message.trim()) {
      this.toastService.warning('Please describe your issue or question.');
      return;
    }

    this.isSubmittingSupport = true;
    const payload: any = {
      subject: this.newSupportTicket.subject.trim(),
      category: this.newSupportTicket.category,
      priority: this.newSupportTicket.priority,
      message: this.newSupportTicket.message.trim()
    };

    this.apiService.post<any>('support', payload).subscribe({
      next: (res: any) => {
        this.isSubmittingSupport = false;
        this.toastService.success(res?.message || 'Support ticket submitted successfully!');
        this.closeSupportCreateModal();
        this.loadSupportTickets();
      },
      error: (err: any) => {
        this.isSubmittingSupport = false;
        this.toastService.error(err?.error?.message || err?.message || 'Failed to submit ticket.');
      }
    });
  }

  openSupportThread(ticket: any): void {
    this.selectedSupportTicket = ticket;
    this.showSupportThreadModal = true;
    this.supportReplyMessage = '';
    this.isLoadingSupportThread = true;

    this.apiService.get<any>(`support/${ticket.id}`).subscribe({
      next: (res: any) => {
        this.isLoadingSupportThread = false;
        const data = res?.data || res;
        if (data) {
          if (data.messages && Array.isArray(data.messages)) {
            this.selectedSupportTicket.messages = data.messages;
          }
          if (data.status) {
            this.selectedSupportTicket.status = data.status.toLowerCase();
          }
        }
      },
      error: (err: any) => {
        this.isLoadingSupportThread = false;
        if (!this.selectedSupportTicket.messages || this.selectedSupportTicket.messages.length === 0) {
          this.selectedSupportTicket.messages = [
            {
              sender_name: 'You',
              sender_role: 'tutoring',
              is_admin: false,
              is_me: true,
              message: ticket.last_message || ticket.subject,
              created_at: ticket.created_at
            }
          ];
        }
      }
    });
  }

  closeSupportThreadModal(): void {
    this.showSupportThreadModal = false;
    this.selectedSupportTicket = null;
    this.supportReplyMessage = '';
  }

  sendSupportReply(): void {
    if (!this.supportReplyMessage.trim() || !this.selectedSupportTicket) return;

    this.isSendingSupportReply = true;
    const msgText = this.supportReplyMessage.trim();

    this.apiService.post<any>(`support/${this.selectedSupportTicket.id}/reply`, {
      message: msgText
    }).subscribe({
      next: (res: any) => {
        this.isSendingSupportReply = false;
        this.supportReplyMessage = '';
        this.toastService.success(res?.message || 'Reply sent successfully!');

        if (!this.selectedSupportTicket.messages) {
          this.selectedSupportTicket.messages = [];
        }
        this.selectedSupportTicket.messages.push({
          id: Date.now(),
          sender_name: 'You',
          sender_role: 'tutoring',
          is_admin: false,
          is_me: true,
          message: msgText,
          created_at: new Date().toISOString()
        });
        this.loadSupportTickets();
      },
      error: (err: any) => {
        this.isSendingSupportReply = false;
        this.toastService.error(err?.error?.message || err?.message || 'Failed to send reply.');
      }
    });
  }

  formatSupportDate(dateStr: string): string {
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

  setSubjectFilter(filter: string): void {
    this.selectedSubjectFilter = filter;
  }

  get availableSubjects(): string[] {
    const subjects = new Set<string>();
    this.assignments.forEach(a => {
      if (a.subject) subjects.add(a.subject);
    });
    return Array.from(subjects);
  }

  get filteredAssignments(): TutoringAssignment[] {
    if (this.selectedSubjectFilter === 'All') {
      return this.assignments;
    }
    return this.assignments.filter(a => a.subject.toLowerCase() === this.selectedSubjectFilter.toLowerCase());
  }

  // Open submission modal
  openSubmitModal(assignment: TutoringAssignment): void {
    this.selectedAssignmentForSubmit = assignment;
    this.submissionText = '';
    this.selectedSubmitFile = null;
    this.showSubmitModal = true;
  }

  closeSubmitModal(): void {
    this.showSubmitModal = false;
    this.selectedAssignmentForSubmit = null;
    this.submissionText = '';
    this.selectedSubmitFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedSubmitFile = input.files[0];
    }
  }

  /**
   * 2.2 Submit Assignment (POST /api/student/assignments/:id/submit)
   */
  submitAssignment(): void {
    if (!this.selectedAssignmentForSubmit) return;
    if (!this.submissionText.trim() && !this.selectedSubmitFile) {
      this.toastService.error('Please enter your submission text or upload a file.');
      return;
    }

    this.isSubmitting = true;
    const assignmentId = this.selectedAssignmentForSubmit.id;

    // If a file is attached, upload it first then submit
    if (this.selectedSubmitFile) {
      this.apiService.uploadFile(this.selectedSubmitFile, 'submissions').subscribe({
        next: (uploadRes: any) => {
          const fileUrl = uploadRes?.data?.fileUrl || uploadRes?.fileUrl || uploadRes?.url || '';
          this.sendSubmissionPayload(assignmentId, this.submissionText, fileUrl);
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.toastService.error(err.message || 'File upload failed');
        }
      });
    } else {
      this.sendSubmissionPayload(assignmentId, this.submissionText, '');
    }
  }

  private sendSubmissionPayload(assignmentId: number | string, text: string, attachmentUrl: string): void {
    const payload = {
      submissionText: text,
      attachmentUrl: attachmentUrl
    };

    this.assignmentService.submitStudentAssignment(assignmentId, payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toastService.success(res?.message || 'Assignment submitted successfully!');
        this.closeSubmitModal();
        this.loadTutoringData();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastService.error(err.message || 'Failed to submit assignment.');
      }
    });
  }

  openDetailsModal(assignment: TutoringAssignment): void {
    this.selectedAssignmentForDetails = assignment;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedAssignmentForDetails = null;
  }

  getAttachmentFullUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${this.baseUrl}${cleanUrl}`;
  }

  openViewModal(assignment: TutoringAssignment): void {
    this.viewingAssignment = assignment;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewingAssignment = null;
  }

  getProfileImageUrl(profileImage?: string | null): string {
    if (!profileImage) {
      return 'assets/img/user-avatar.png';
    }
    const normalized = profileImage.replace(/\\/g, '/');
    if (
      normalized.startsWith('http://') ||
      normalized.startsWith('https://') ||
      normalized.startsWith('data:') ||
      normalized.startsWith('blob:') ||
      normalized.startsWith('assets/')
    ) {
      return normalized;
    }
    const base = environment.imageBaseUrl.endsWith('/') ? environment.imageBaseUrl : `${environment.imageBaseUrl}/`;
    const path = normalized.startsWith('/') ? normalized.substring(1) : normalized;
    return `${base}${path}`;
  }

  openEditProfileModal(): void {
    let fName = this.userProfile.firstName || '';
    let lName = this.userProfile.lastName || '';
    if (!fName && this.userProfile.fullName) {
      const parts = this.userProfile.fullName.trim().split(/\s+/);
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }
    const currentGrade = this.userProfile.gradeLevel || 'Adult Learner / Tutoring';
    if (currentGrade && !this.gradeOptions.includes(currentGrade)) {
      this.gradeOptions.push(currentGrade);
    }
    this.editProfileData = {
      firstName: fName,
      lastName: lName,
      phone: this.userProfile.phone || '',
      gradeLevel: currentGrade
    };
    this.selectedProfileImageFile = null;
    this.profileImagePreview = null;
    this.showEditProfileModal = true;
  }

  closeEditProfileModal(): void {
    this.showEditProfileModal = false;
    this.selectedProfileImageFile = null;
    this.profileImagePreview = null;
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProfileImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedProfileImageFile);
    }
  }

  /**
   * PATCH /api/tutoring/profile
   * Accepts multipart/form-data: firstName, lastName, phone, gradeLevel, profileImage
   */
  saveProfile(): void {
    if (!this.editProfileData.firstName.trim()) {
      this.toastService.error('First name is required.');
      return;
    }

    this.isUpdatingProfile = true;
    const formData = new FormData();
    formData.append('firstName', this.editProfileData.firstName.trim());
    formData.append('lastName', this.editProfileData.lastName.trim());
    formData.append('phone', this.editProfileData.phone.trim());
    if (this.editProfileData.gradeLevel) {
      formData.append('gradeLevel', this.editProfileData.gradeLevel.trim());
    }
    if (this.selectedProfileImageFile) {
      formData.append('profileImage', this.selectedProfileImageFile);
    }

    this.apiService.patch<any>('tutoring/profile', formData).subscribe({
      next: (res: any) => {
        this.isUpdatingProfile = false;
        const updated = res?.data?.profile || res?.data?.user || res?.data || res?.profile || res?.user;
        if (updated) {
          this.applyProfileData(updated);
        } else {
          this.userProfile.firstName = this.editProfileData.firstName.trim();
          this.userProfile.lastName = this.editProfileData.lastName.trim();
          this.userProfile.fullName = `${this.userProfile.firstName} ${this.userProfile.lastName}`.trim();
          this.userProfile.phone = this.editProfileData.phone.trim();
          this.userProfile.gradeLevel = this.editProfileData.gradeLevel.trim();
          if (this.profileImagePreview) {
            this.userProfile.profileImage = this.profileImagePreview;
          }
        }
        this.toastService.success(res?.message || 'Profile updated successfully!');
        this.closeEditProfileModal();
      },
      error: (err: any) => {
        this.isUpdatingProfile = false;
        this.toastService.error(err.message || 'Failed to update profile.');
      }
    });
  }

  openChangePasswordModal(): void {
    this.changePasswordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  /**
   * PATCH /api/tutoring/change-password
   * Accepts application/json: { oldPassword, newPassword }
   */
  submitChangePassword(): void {
    if (!this.changePasswordData.currentPassword || !this.changePasswordData.newPassword || !this.changePasswordData.confirmPassword) {
      this.toastService.error('Please fill in all password fields.');
      return;
    }
    if (this.changePasswordData.newPassword !== this.changePasswordData.confirmPassword) {
      this.toastService.error('New password and confirm password do not match.');
      return;
    }
    if (this.changePasswordData.newPassword.length < 6) {
      this.toastService.error('Password must be at least 6 characters.');
      return;
    }

    this.isChangingPassword = true;
    const payload = {
      oldPassword: this.changePasswordData.currentPassword,
      newPassword: this.changePasswordData.newPassword
    };

    this.apiService.patch<any>('tutoring/change-password', payload).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        this.toastService.success(res?.message || 'Password changed successfully!');
        this.closeChangePasswordModal();
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        this.toastService.error(err.message || 'Failed to change password.');
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('portalType');
    this.router.navigate(['/login']);
  }
}
