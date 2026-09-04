import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';

export interface ChildInfo {
  id: number | string;
  name: string;
  gradeLevel?: string;
  academy?: string;
  isSelected?: boolean;
}

export interface PaymentItem {
  s_no?: number;
  id: string;
  invoice_id?: number | string;
  student_name?: string;
  grade?: string;
  month: string;
  tuitionFee: string | number;
  bookFee: string | number;
  total: string | number;
  status: 'Pending' | 'Overdue' | 'Paid' | string;
  dueDate: string;
  action?: string;
  can_pay?: boolean;
  receipt_url?: string;
}

export interface PaymentStats {
  outstanding_balance?: number;
  formatted_outstanding_balance?: string;
  total_paid_this_year?: number;
  formatted_total_paid?: string;
  next_due_date?: string;
}

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-payments.component.html',
  styleUrl: './parent-payments.component.css'
})
export class ParentPaymentsComponent implements OnInit, OnDestroy {
  isLoading = false;
  isPayingInvoiceId: number | string | null = null;

  children: ChildInfo[] = [];
  selectedChildId: number | string | null = null;
  selectedStudent: any = null;

  stats: PaymentStats = {
    outstanding_balance: 350.00,
    formatted_outstanding_balance: '$350.00',
    total_paid_this_year: 18,
    formatted_total_paid: '$1,800.00',
    next_due_date: '31 May 2025'
  };

  payments: PaymentItem[] = [
    {
      s_no: 1,
      id: 'INV-20260903-14-9974',
      invoice_id: 9,
      month: 'May 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Pending',
      dueDate: 'May 20, 2025',
      can_pay: true
    },
    {
      s_no: 2,
      id: 'INV-20260903-14-9973',
      invoice_id: 8,
      month: 'April 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Overdue',
      dueDate: 'Apr 20, 2025',
      can_pay: true
    },
    {
      s_no: 3,
      id: 'INV-20260903-14-9972',
      invoice_id: 7,
      month: 'Mar 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Paid',
      dueDate: 'Mar 20, 2025',
      can_pay: false
    }
  ];

  selectedFilter: 'All' | 'Paid' | 'Pending' | 'Overdue' = 'All';
  selectedYear: string = '2026';
  availableYears: string[] = ['2026', '2025', '2024'];

  currentPage: number = 1;
  pageSize: number = 5;

  private studentSub?: Subscription;
  private queryParamsSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private profileService: ProfileService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check for return from Stripe checkout
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const status = params['status'];

      if (status === 'success' && sessionId) {
        this.verifyStripeSession(sessionId);
      } else if (status === 'cancelled') {
        this.toastService.warning('Payment was cancelled.');
        this.cleanQueryParams();
      }
    });

    // Listen to profile service for selected student
    this.studentSub = this.profileService.selectedStudent$.subscribe(student => {
      if (student && student.id && student.id !== this.selectedChildId) {
        this.selectedChildId = student.id;
        this.fetchPayments();
      }
    });

    if (!this.selectedChildId) {
      const savedStudentId = localStorage.getItem('selectedStudentId');
      if (savedStudentId) {
        this.selectedChildId = savedStudentId;
      }
    }

    this.fetchPayments();
  }

  ngOnDestroy(): void {
    if (this.studentSub) {
      this.studentSub.unsubscribe();
    }
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
  }

  private cleanQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private verifyStripeSession(sessionId: string): void {
    this.isLoading = true;
    this.apiService.get<any>(`payment/verify-session?session_id=${encodeURIComponent(sessionId)}`).subscribe({
      next: (res) => {
        this.isLoading = false;
        const inv = res?.data?.invoiceNumber || res?.data?.invoiceId || '';
        this.toastService.success(res?.message || (inv ? `Payment verified for invoice ${inv}!` : 'Payment completed successfully!'));
        this.cleanQueryParams();
        this.fetchPayments();
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Session verification fallback/error:', err);
        this.cleanQueryParams();
        this.fetchPayments();
      }
    });
  }

  fetchPayments(): void {
    this.isLoading = true;
    let url = 'parent/payments';
    const params: string[] = [];

    if (this.selectedChildId) {
      params.push(`student_id=${this.selectedChildId}`);
    }
    if (this.selectedFilter && this.selectedFilter !== 'All') {
      params.push(`status=${this.selectedFilter}`);
    }
    if (this.selectedYear) {
      params.push(`year=${this.selectedYear}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    this.apiService.get<any>(url).subscribe({
      next: (res) => {
        this.isLoading = false;
        const data = res?.data || res;
        if (data) {
          // 1. Process Children list
          if (Array.isArray(data.children) && data.children.length > 0) {
            this.children = data.children;
            const activeChild = data.children.find((c: any) => c.isSelected) || data.selected_student;
            if (activeChild && !this.selectedChildId) {
              this.selectedChildId = activeChild.id;
            }
          }

          // 2. Selected Student
          if (data.selected_student) {
            this.selectedStudent = data.selected_student;
          }

          // 3. Stats
          if (data.stats) {
            this.stats = {
              outstanding_balance: data.stats.outstanding_balance ?? 0,
              formatted_outstanding_balance: data.stats.formatted_outstanding_balance || `$${Number(data.stats.outstanding_balance || 0).toFixed(2)}`,
              total_paid_this_year: data.stats.total_paid_this_year ?? 0,
              formatted_total_paid: data.stats.formatted_total_paid || `${data.stats.total_paid_this_year ?? 0}`,
              next_due_date: data.stats.next_due_date || '31 May 2025'
            };
          }

          // 4. Payments list
          const list = data.payments || (Array.isArray(data) ? data : []);
          if (Array.isArray(list)) {
            this.payments = list.map((p: any, idx: number) => ({
              s_no: p.s_no || idx + 1,
              id: p.id || `INV-${p.invoice_id || idx + 1}`,
              invoice_id: p.invoice_id || p.id,
              student_name: p.student_name,
              grade: p.grade,
              month: p.month || p.invoiceMonth || 'May 2025',
              tuitionFee: p.tuition_fee ?? p.tuitionFee ?? '300',
              bookFee: p.book_fee ?? p.bookFee ?? '50',
              total: p.total ?? p.amount ?? '350',
              status: this.normalizeStatus(p.status),
              dueDate: p.due_date || p.dueDate || 'May 20, 2025',
              action: p.action || (p.status === 'Paid' ? 'Download Receipt' : 'Pay Now'),
              can_pay: p.can_pay !== false && p.status !== 'Paid',
              receipt_url: p.receipt_url || p.receiptUrl
            }));
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('GET /api/parent/payments failed, keeping current state:', err);
      }
    });
  }

  private normalizeStatus(status: string): 'Paid' | 'Pending' | 'Overdue' {
    if (!status) return 'Pending';
    const s = status.toUpperCase().replace(/\s+/g, '');
    if (s === 'PAID') return 'Paid';
    if (s === 'OVERDUE') return 'Overdue';
    return 'Pending';
  }

  onSelectChild(childId: number | string): void {
    if (this.selectedChildId === childId) return;
    this.selectedChildId = childId;
    this.currentPage = 1;
    this.fetchPayments();
  }

  setFilter(filter: 'All' | 'Paid' | 'Pending' | 'Overdue'): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.fetchPayments();
  }

  selectYear(year: string): void {
    this.selectedYear = year;
    this.currentPage = 1;
    this.fetchPayments();
  }

  filteredPayments(): PaymentItem[] {
    if (this.selectedFilter === 'All') {
      return this.payments;
    }
    return this.payments.filter(p => p.status.toLowerCase() === this.selectedFilter.toLowerCase());
  }

  payNow(payment: PaymentItem): void {
    const invoiceId = payment.invoice_id || payment.id;
    if (!invoiceId) return;

    this.isPayingInvoiceId = invoiceId;

    const currentPath = window.location.pathname;
    const origin = window.location.origin;
    const successUrl = `${origin}${currentPath}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}&status=success`;
    const cancelUrl = `${origin}${currentPath}?invoice_id=${invoiceId}&status=cancelled`;

    const payload = {
      invoice_id: invoiceId,
      success_url: successUrl,
      cancel_url: cancelUrl
    };

    this.apiService.post<any>('payment/create-checkout-session', payload).subscribe({
      next: (res) => {
        this.isPayingInvoiceId = null;
        const checkoutUrl = res?.data?.url || res?.url;
        if (checkoutUrl) {
          // Redirect parent to Stripe Checkout Page
          window.location.href = checkoutUrl;
        } else {
          this.toastService.error('Unable to initiate Stripe checkout. Please try again.');
        }
      },
      error: (err) => {
        this.isPayingInvoiceId = null;
        this.toastService.error(err?.error?.message || err?.message || 'Failed to create Stripe checkout session.');
      }
    });
  }

  downloadReceipt(payment: PaymentItem): void {
    if (payment.receipt_url) {
      window.open(payment.receipt_url, '_blank');
    } else {
      this.toastService.info(`Downloading receipt for invoice ${payment.id}...`);
    }
  }
}
