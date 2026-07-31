import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject } from 'rxjs';
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
  isPaid = false; // Temporary state, default to false initially
  isSimulatingPayment = false;
  handbookInfo: Handbook | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private profileService: ProfileService,
    private apiService: ApiService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Listen to changes in the selected student
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

  checkPaymentStatusAndFetch(): void {
    // For now, default to unpaid when switching to a child unless we have a backend flag
    // We assume it's unpaid initially to show the Locked UI flow.
    this.isPaid = false;
    this.handbookInfo = null;
    this.errorMessage = null;
    this.cdr.markForCheck();
  }

  fetchHandbook(): void {
    if (!this.selectedStudentId) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.apiService.get<any>(`handbooks/parent?studentId=${this.selectedStudentId}`).subscribe({
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

  payTuition(): void {
    if (this.isSimulatingPayment) return;

    this.isSimulatingPayment = true;
    this.cdr.markForCheck();

    // Simulate 5 seconds payment process
    setTimeout(() => {
      this.isSimulatingPayment = false;
      this.isPaid = true;
      this.toastService.show('Payment successful!', 'success');
      this.fetchHandbook(); // Fetch handbook now that it is "paid"
    }, 5000);
  }

  downloadHandbook(): void {
    if (!this.handbookInfo?.file_url) {
      this.toastService.show('Handbook file not available.', 'error');
      return;
    }

    // Construct full URL
    const normalizedPath = this.handbookInfo.file_url.replace(/\\/g, '/');
    let fullUrl = normalizedPath;

    if (!normalizedPath.startsWith('http')) {
      const base = environment.imageBaseUrl.endsWith('/') ? environment.imageBaseUrl : `${environment.imageBaseUrl}/`;
      fullUrl = `${base}${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
    }

    // Open in new tab / download
    window.open(fullUrl, '_blank');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
