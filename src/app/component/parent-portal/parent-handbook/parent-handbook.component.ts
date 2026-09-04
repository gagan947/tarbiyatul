import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface Handbook {
  id: number;
  title: string;
  description?: string;
  grade_level?: string;
  file_url: string;
  file_size?: string;
  file_type?: string;
}

@Component({
  selector: 'app-parent-handbook',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-handbook.component.html',
  styleUrl: './parent-handbook.component.css'
})
export class ParentHandbookComponent implements OnInit, OnDestroy {
  selectedStudentId: number | null = null;
  isLoading = false;
  isPaid = false;
  isPayingTuition = false;
  pendingInvoiceId: number | string = 10;
  handbookInfo: Handbook | null = null;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();
  private queryParamsSub?: Subscription;

  constructor(
    private profileService: ProfileService,
    private apiService: ApiService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 1. Check for return from Stripe checkout
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

    // 2. Listen to changes in the selected student
    this.profileService.selectedStudent$
      .pipe(takeUntil(this.destroy$))
      .subscribe(student => {
        if (student && student.id) {
          this.selectedStudentId = student.id;
          this.checkPaymentStatusAndFetch();
        } else {
          this.selectedStudentId = null;
          this.isPaid = false;
          this.handbookInfo = null;
          this.errorMessage = null;
          this.cdr.markForCheck();
        }
      });
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
    this.cdr.markForCheck();

    this.apiService.get<any>(`payment/verify-session?session_id=${encodeURIComponent(sessionId)}`).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isPaid = true;
        const inv = res?.data?.invoiceNumber || res?.data?.invoiceId || '';
        this.toastService.success(res?.message || (inv ? `Payment verified for invoice ${inv}! Parent Handbook is now unlocked.` : 'Payment successful! Parent Handbook unlocked.'));
        this.cleanQueryParams();
        this.fetchHandbook();
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Session verification fallback/error:', err);
        this.cleanQueryParams();
        this.checkPaymentStatusAndFetch();
      }
    });
  }

  checkPaymentStatusAndFetch(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const paymentUrl = this.selectedStudentId ? `parent/payments?student_id=${this.selectedStudentId}` : 'parent/payments';
    this.apiService.get<any>(paymentUrl).subscribe({
      next: (res) => {
        const data = res?.data || res;
        const stats = data?.stats;
        const payments = data?.payments;

        // Check if there is an outstanding balance or pending payments
        const hasPendingInvoice = Array.isArray(payments) && payments.some((p: any) => p.status !== 'Paid');
        const hasOutstandingBalance = stats && (stats.outstanding_balance > 0);

        if (hasPendingInvoice || hasOutstandingBalance) {
          this.isPaid = false;
          this.isLoading = false;

          const pending = Array.isArray(payments) ? payments.find((p: any) => p.status !== 'Paid') : null;
          if (pending) {
            this.pendingInvoiceId = pending.invoice_id || pending.id || 10;
          }
          this.cdr.markForCheck();
        } else {
          this.isPaid = true;
          this.fetchHandbook();
        }
      },
      error: () => {
        // If payment check fails, attempt handbook fetch directly
        this.fetchHandbook();
      }
    });
  }

  fetchHandbook(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const url = this.selectedStudentId ? `parent/handbook?studentId=${this.selectedStudentId}` : `parent/handbook`;
    this.apiService.get<any>(url).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success === false) {
          this.errorMessage = res.message || 'Handbook is not available.';
          this.cdr.markForCheck();
          return;
        }

        if (res?.data) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            this.handbookInfo = res.data[0];
          } else if (!Array.isArray(res.data)) {
            this.handbookInfo = res.data;
          }
        } else if (res && !res.data && res.file_url) {
          this.handbookInfo = res;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        // Fallback to legacy endpoint
        const fallbackUrl = this.selectedStudentId ? `handbooks/parent?studentId=${this.selectedStudentId}` : `handbooks/parent`;
        this.apiService.get<any>(fallbackUrl).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res?.data) {
              this.handbookInfo = Array.isArray(res.data) ? res.data[0] : res.data;
            }
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error fetching handbook:', err);
            this.errorMessage = err?.error?.message || 'Failed to fetch handbook information.';
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  payTuition(): void {
    if (this.isPayingTuition) return;

    this.isPayingTuition = true;
    this.cdr.markForCheck();

    const currentPath = window.location.pathname;
    const origin = window.location.origin;
    const invoiceId = this.pendingInvoiceId || 10;
    const successUrl = `${origin}${currentPath}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}&status=success`;
    const cancelUrl = `${origin}${currentPath}?invoice_id=${invoiceId}&status=cancelled`;

    const payload = {
      invoice_id: invoiceId,
      success_url: successUrl,
      cancel_url: cancelUrl
    };

    this.apiService.post<any>('payment/create-checkout-session', payload).subscribe({
      next: (res) => {
        this.isPayingTuition = false;
        this.cdr.markForCheck();
        const checkoutUrl = res?.data?.url || res?.url;
        if (checkoutUrl) {
          // Redirect parent to Stripe Checkout Page
          window.location.href = checkoutUrl;
        } else {
          this.toastService.error('Unable to open Stripe checkout. Please try again.');
        }
      },
      error: (err) => {
        this.isPayingTuition = false;
        this.cdr.markForCheck();
        this.toastService.error(err?.error?.message || err?.message || 'Failed to create Stripe checkout session.');
      }
    });
  }

  downloadHandbook(): void {
    if (this.isLoading) return;

    // Use authenticated API download endpoint
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || '';
    const base = environment.apiUrl.endsWith('/') ? environment.apiUrl : `${environment.apiUrl}/`;
    const downloadUrl = `${base}parent/handbook/download`;

    this.isLoading = true;
    this.cdr.markForCheck();

    fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err?.message || `Download failed (${response.status})`);
          });
        }

        const contentDisposition = response.headers.get('Content-Disposition') || '';
        let filename = 'Parent_Handbook.pdf';
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }

        return response.blob().then(blob => ({ blob, filename }));
      })
      .then((result: any) => {
        this.isLoading = false;
        this.cdr.markForCheck();

        const { blob, filename } = result;
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);

        this.toastService.success('Handbook downloaded successfully!');
      })
      .catch((err: any) => {
        this.isLoading = false;
        this.cdr.markForCheck();

        const msg = err?.message || 'Failed to download handbook. Please try again.';

        // If token issue, fallback to direct file_url open (for CDN-hosted files)
        if ((msg.includes('token') || msg.includes('401') || msg.includes('403')) && this.handbookInfo?.file_url) {
          const normalizedPath = this.handbookInfo.file_url.replace(/\\/g, '/');
          let fullUrl = normalizedPath;
          if (!normalizedPath.startsWith('http')) {
            const imgBase = environment.imageBaseUrl.endsWith('/')
              ? environment.imageBaseUrl
              : `${environment.imageBaseUrl}/`;
            fullUrl = `${imgBase}${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
          }
          window.open(fullUrl, '_blank');
          this.toastService.show('Opening handbook in new tab.', 'info');
        } else {
          this.toastService.error(msg);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
  }
}
