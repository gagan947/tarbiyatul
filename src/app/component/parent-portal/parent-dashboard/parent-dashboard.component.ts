import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

export interface ChildItem {
  id: number | string;
  name: string;
  grade_level?: string;
  profile_image?: string | null;
  isSelected?: boolean;
}

export interface DashboardStats {
  outstanding_balance?: string;
  outstanding_balance_usd?: number;
  total_assignments?: number;
  completed_assignments?: number;
  pending_assignments?: number;
  total_children?: number;
}

export interface DailyBreakdown {
  day: string;
  score: number;
}

export interface WeeklyProgress {
  scale_max: number;
  current_score: number;
  daily_breakdown?: DailyBreakdown[];
}

export interface RecentAssignment {
  student_id?: number | string;
  student_name?: string;
  assignment_id?: number | string;
  book: string;
  subject_area: string;
  total_points?: number;
  due_date?: string;
  status: string;
  score?: string;
  book_image?: string;
}

export interface UpcomingEvent {
  id: number | string;
  title: string;
  eventDate: string;
  eventTime?: string;
  categories?: string[];
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrl: './parent-dashboard.component.css'
})
export class ParentDashboardComponent implements OnInit, OnDestroy {
  isLoading = false;
  isPaying = false;
  selectedStudentId: number | string | null = null;
  selectedStudent: ChildItem | null = null;
  linkedChildren: ChildItem[] = [];

  stats: DashboardStats = {
    outstanding_balance: '$350.00',
    outstanding_balance_usd: 350,
    total_assignments: 18,
    completed_assignments: 6,
    pending_assignments: 12,
    total_children: 1
  };

  weeklyProgress: WeeklyProgress = {
    scale_max: 500,
    current_score: 234,
    daily_breakdown: []
  };

  recentAssignments: RecentAssignment[] = [
    {
      book: 'Stories Of The Prophets',
      subject_area: 'Islamic Studies',
      score: '95/100',
      status: 'Completed'
    },
    {
      book: 'The World Of Plants',
      subject_area: 'Science',
      score: '95/100',
      status: 'In Progress'
    },
    {
      book: 'Fractions And Decimals',
      subject_area: 'Mathematics',
      score: '--',
      status: 'Overdue'
    },
    {
      book: 'Stories Of The Prophets',
      subject_area: 'Islamic Studies',
      score: '--',
      status: 'Not Started'
    }
  ];

  upcomingEvents: UpcomingEvent[] = [
    {
      id: 1,
      title: 'Parent Meeting',
      eventDate: 'May 25, 2025',
      eventTime: '10:00 AM',
      categories: ['Meeting']
    },
    {
      id: 2,
      title: 'End Of Term Exam',
      eventDate: 'May 30, 2025',
      eventTime: '09:00 AM',
      categories: ['Academic']
    },
    {
      id: 3,
      title: 'Eid-Ul-Adha Holiday',
      eventDate: 'Jun 06, 2025',
      eventTime: 'All Day',
      categories: ['Holiday']
    },
    {
      id: 4,
      title: 'Sports Day',
      eventDate: 'Jun 15, 2025',
      eventTime: '08:00 AM',
      categories: ['Sports']
    }
  ];

  private destroy$ = new Subject<void>();
  private queryParamsSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private profileService: ProfileService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Check for Stripe checkout redirect return
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

    // 2. Listen to profile service for selected student
    this.profileService.selectedStudent$
      .pipe(takeUntil(this.destroy$))
      .subscribe(student => {
        if (student && student.id && student.id !== this.selectedStudentId) {
          this.selectedStudentId = student.id;
          this.fetchDashboardData();
        }
      });

    if (!this.selectedStudentId) {
      const savedStudentId = localStorage.getItem('selectedStudentId');
      if (savedStudentId) {
        this.selectedStudentId = savedStudentId;
      }
    }

    this.fetchDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
  }

  cleanQueryParams(): void {
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
        this.fetchDashboardData();
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Session verification error/fallback:', err);
        this.cleanQueryParams();
        this.fetchDashboardData();
      }
    });
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    const url = this.selectedStudentId
      ? `dashboard/parent?student_id=${this.selectedStudentId}`
      : 'dashboard/parent';

    this.apiService.get<any>(url).subscribe({
      next: (res) => {
        this.isLoading = false;
        const data = res?.data || res;
        if (data) {
          this.applyDashboardData(data);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Failed to load parent dashboard API, using fallback / current state:', err);
        this.cdr.markForCheck();
      }
    });
  }

  private applyDashboardData(data: any): void {
    // 1. Selected Student & Linked Children
    if (data.selected_student) {
      this.selectedStudent = data.selected_student;
      if (!this.selectedStudentId && data.selected_student.id) {
        this.selectedStudentId = data.selected_student.id;
      }
    }

    if (Array.isArray(data.linked_children) && data.linked_children.length > 0) {
      this.linkedChildren = data.linked_children;
      if (!this.selectedStudent) {
        const active = data.linked_children.find((c: any) => c.isSelected) || data.linked_children[0];
        this.selectedStudent = active;
        this.selectedStudentId = active.id;
      }
    }

    // 2. Stats
    if (data.stats) {
      this.stats = {
        outstanding_balance: data.stats.outstanding_balance ?? '$0.00',
        outstanding_balance_usd: data.stats.outstanding_balance_usd ?? (parseFloat(String(data.stats.outstanding_balance).replace(/[^0-9.]/g, '')) || 0),
        total_assignments: data.stats.total_assignments ?? 0,
        completed_assignments: data.stats.completed_assignments ?? 0,
        pending_assignments: data.stats.pending_assignments ?? 0,
        total_children: data.stats.total_children ?? (this.linkedChildren.length || 1)
      };
    }

    // 3. Weekly Progress
    if (data.weekly_progress) {
      this.weeklyProgress = {
        scale_max: data.weekly_progress.scale_max || 500,
        current_score: data.weekly_progress.current_score || 0,
        daily_breakdown: data.weekly_progress.daily_breakdown || []
      };
    }

    // 4. Recent Assignments
    if (Array.isArray(data.recent_assignments) && data.recent_assignments.length > 0) {
      this.recentAssignments = data.recent_assignments;
    }

    // 5. Upcoming Events
    if (Array.isArray(data.upcoming_events) && data.upcoming_events.length > 0) {
      this.upcomingEvents = data.upcoming_events;
    }
  }

  get progressPercentage(): number {
    if (!this.weeklyProgress.scale_max) return 0;
    const pct = Math.round((this.weeklyProgress.current_score / this.weeklyProgress.scale_max) * 100);
    return Math.min(100, Math.max(0, pct));
  }

  onSelectChild(child: ChildItem): void {
    if (this.selectedStudentId === child.id) return;
    this.selectedStudentId = child.id;
    this.selectedStudent = child;
    this.profileService.selectStudent(child);
    this.fetchDashboardData();
  }

  getProfileImageUrl(img?: string | null): string {
    if (!img) return 'assets/img/chat_user_2.png';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('assets/')) {
      return img;
    }
    const clean = img.startsWith('/') ? img.substring(1) : img;
    const base = environment.imageBaseUrl.endsWith('/') ? environment.imageBaseUrl : `${environment.imageBaseUrl}/`;
    return `${base}${clean}`;
  }

  getBookCover(assignment: RecentAssignment, index: number): string {
    if (assignment.book_image) return assignment.book_image;
    const defaultCovers = [
      'assets/img/book_1.png',
      'assets/img/book_2.png',
      'assets/img/book_3.png',
      'assets/img/book_1.png'
    ];
    return defaultCovers[index % defaultCovers.length];
  }

  getStatusClass(status?: string): string {
    const s = (status || '').toLowerCase().trim();
    if (s === 'completed' || s === 'graded') return 'dash-badge-completed';
    if (s === 'in progress' || s === 'in_progress' || s === 'pending') return 'dash-badge-progress';
    if (s === 'overdue') return 'dash-badge-overdue';
    return 'dash-badge-notstarted';
  }

  getEventIcon(event: UpcomingEvent): string {
    const title = (event.title || '').toLowerCase();
    const cats = (event.categories || []).map(c => c.toLowerCase());
    if (title.includes('meeting') || cats.includes('meeting') || title.includes('parent')) return 'fa-users text-primary';
    if (title.includes('exam') || title.includes('test') || cats.includes('academic')) return 'fa-file-contract text-secondary';
    if (title.includes('holiday') || title.includes('eid') || title.includes('islamic')) return 'fa-mosque text-warning';
    if (title.includes('sport') || title.includes('game') || cats.includes('sports')) return 'fa-trophy text-warning';
    return 'fa-calendar-day text-info';
  }

  formatEventDate(event: UpcomingEvent): string {
    if (!event.eventDate) return '';
    const dateStr = event.eventDate.includes('T') ? event.eventDate.split('T')[0] : event.eventDate;
    if (event.eventTime) {
      return `${dateStr} • ${event.eventTime}`;
    }
    return dateStr;
  }

  payTuitionNow(): void {
    if (this.isPaying) return;
    this.isPaying = true;

    const paymentUrl = this.selectedStudentId ? `parent/payments?student_id=${this.selectedStudentId}` : 'parent/payments';
    this.apiService.get<any>(paymentUrl).subscribe({
      next: (res) => {
        const payments = res?.data?.payments;
        const pending = Array.isArray(payments) ? payments.find((p: any) => p.status !== 'Paid') : null;
        const invoiceId = pending?.invoice_id || pending?.id || 10;

        const currentPath = window.location.pathname;
        const origin = window.location.origin;
        const successUrl = `${origin}${currentPath}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}&status=success`;
        const cancelUrl = `${origin}${currentPath}?invoice_id=${invoiceId}&status=cancelled`;

        this.apiService.post<any>('payment/create-checkout-session', {
          invoice_id: invoiceId,
          success_url: successUrl,
          cancel_url: cancelUrl
        }).subscribe({
          next: (checkoutRes) => {
            this.isPaying = false;
            const url = checkoutRes?.data?.url || checkoutRes?.url;
            if (url) {
              window.location.href = url;
            } else {
              this.router.navigate(['/parent/payments']);
            }
          },
          error: (err) => {
            this.isPaying = false;
            console.warn('Checkout session error, navigating to payments page:', err);
            this.router.navigate(['/parent/payments']);
          }
        });
      },
      error: () => {
        this.isPaying = false;
        this.router.navigate(['/parent/payments']);
      }
    });
  }
}
