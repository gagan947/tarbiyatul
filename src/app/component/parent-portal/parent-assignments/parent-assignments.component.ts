import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileService } from '../../../core/services/profile.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

export interface ParentAssignmentItem {
  assignment_id?: number | string;
  id?: number | string;
  title: string;
  description?: string | null;
  grade_level?: string;
  subject?: string;
  due_date?: string;
  dueDate?: string;
  total_points?: number;
  book_title?: string | null;
  bookTitle?: string | null;
  required_reading?: string | null;
  requiredReading?: string | null;
  reading_instructions?: string | null;
  enable_islamic_alert?: number | boolean;
  islamic_alert_description?: string | null;
  book_cover_url?: string | null;
  attachment_url?: string | null;
  attachment?: string | null;
  assignment_attachment?: string | null;
  status?: string;
  submission_status?: string;
  score?: string;
  marks_obtained?: number | null;
  grade?: string | null;
  created_at?: string;
  assignment_created_at?: string;
}

@Component({
  selector: 'app-parent-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-assignments.component.html',
  styleUrl: './parent-assignments.component.css'
})
export class ParentAssignmentsComponent implements OnInit, OnDestroy {
  selectedStudentId: number | null = null;
  assignmentsList: ParentAssignmentItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  selectedFilter: 'All' | 'In Progress' | 'Completed' | 'Not Started' | 'Overdue' = 'All';

  imageBaseUrl = environment.imageBaseUrl;
  defaultCoverImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private assignmentService: AssignmentService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Listen to selected student changes in header
    this.profileService.selectedStudent$
      .pipe(takeUntil(this.destroy$))
      .subscribe(student => {
        if (student && student.id) {
          this.selectedStudentId = student.id;
          this.fetchParentAssignments();
        } else {
          this.selectedStudentId = null;
          this.assignmentsList = [];
          this.errorMessage = null;
          this.cdr.markForCheck();
        }
      });
  }

  fetchParentAssignments(filter?: 'All' | 'In Progress' | 'Completed' | 'Not Started' | 'Overdue'): void {
    if (!this.selectedStudentId) {
      this.assignmentsList = [];
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const filterParam = filter || this.selectedFilter;

    this.assignmentService.getParentAssignments(this.selectedStudentId, filterParam).subscribe({
      next: (response) => {
        this.isLoading = false;
        let list: ParentAssignmentItem[] = [];

        if (response) {
          if (Array.isArray(response)) {
            list = response;
          } else if (response.data) {
            if (Array.isArray(response.data)) {
              list = response.data;
            } else if (response.data.children && Array.isArray(response.data.children)) {
              let child = response.data.children.find((c: any) => c.student_id === this.selectedStudentId);
              if (!child && response.data.children.length > 0) {
                child = response.data.children[0];
              }
              if (child && Array.isArray(child.assignments)) {
                list = child.assignments;
              }
            } else if (response.data.assignments && Array.isArray(response.data.assignments)) {
              list = response.data.assignments;
            }
          } else if (response.children && Array.isArray(response.children)) {
            let child = response.children.find((c: any) => c.student_id === this.selectedStudentId);
            if (!child && response.children.length > 0) {
              child = response.children[0];
            }
            if (child && Array.isArray(child.assignments)) {
              list = child.assignments;
            }
          } else if (response.assignments && Array.isArray(response.assignments)) {
            list = response.assignments;
          }
        }

        this.assignmentsList = list;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.isLoading = false;
        console.error('Error fetching parent assignments:', err);
        const msg = err.message || 'Failed to load assignments.';
        this.errorMessage = msg;
        this.toastService.error(msg);
        this.cdr.markForCheck();
      }
    });
  }

  setFilter(filter: 'All' | 'In Progress' | 'Completed' | 'Not Started' | 'Overdue'): void {
    if (this.selectedFilter === filter) return;
    this.selectedFilter = filter;
    this.fetchParentAssignments(filter);
  }

  getStatusDisplay(item: ParentAssignmentItem): string {
    const raw = (item.status || item.submission_status || 'In Progress').toLowerCase().trim();
    if (raw === 'completed' || raw === 'submitted' || raw === 'graded') {
      return 'Completed';
    }
    if (raw === 'overdue') {
      return 'Overdue';
    }
    if (raw === 'not started' || raw === 'not_started' || raw === 'pending') {
      return 'Not Started';
    }
    return 'In Progress';
  }

  getScoreDisplay(item: ParentAssignmentItem): string {
    if (item.score) return item.score;
    if (item.marks_obtained !== undefined && item.marks_obtained !== null) {
      if (item.total_points) {
        return `${item.marks_obtained}/${item.total_points}`;
      }
      return `${item.marks_obtained}`;
    }
    if (item.grade) return item.grade;
    return '--';
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });
      }
    } catch (e) {
      console.warn('Error formatting date:', e);
    }
    return dateStr;
  }

  getCoverImage(item: ParentAssignmentItem): string {
    const imgPath = item.book_cover_url || item.attachment_url || item.attachment || item.assignment_attachment;
    if (!imgPath) {
      return this.defaultCoverImage;
    }

    if (
      imgPath.startsWith('http://') ||
      imgPath.startsWith('https://') ||
      imgPath.startsWith('data:') ||
      imgPath.startsWith('assets/')
    ) {
      return imgPath;
    }

    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const path = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
    return `${base}${path}`;
  }

  viewDetails(assignmentId?: number | string): void {
    if (assignmentId) {
      this.router.navigate(['/parent/assignments', assignmentId]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
