import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { AssignmentListItem, TeacherAssignmentQueryParams } from '../../../core/models/assignment.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './teacher-assignments.component.html',
  styleUrl: './teacher-assignments.component.css'
})
export class TeacherAssignmentsComponent implements OnInit, OnDestroy {
  assignments: AssignmentListItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  searchQuery = '';
  selectedGrade = '';
  currentPage = 1;
  limit = 10;
  totalRecords = 0;
  totalPages = 1;

  modalImgUrl = 'assets/img/book_1.png';
  imageBaseUrl = environment.imageBaseUrl;

  gradeOptions: string[] = [
    'Pre-K',
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    'Adult Learner / Tutoring'
  ];

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private router: Router,
    private assignmentService: AssignmentService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Setup search input debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery = term;
      this.currentPage = 1;
      this.loadAssignments();
    });

    this.loadAssignments();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const params: TeacherAssignmentQueryParams = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.searchQuery && this.searchQuery.trim()) {
      params.search = this.searchQuery.trim();
    }

    if (this.selectedGrade && this.selectedGrade.trim()) {
      params.grade_level = this.selectedGrade.trim();
    }

    this.assignmentService.getTeacherAssignments(params).subscribe({
      next: (response) => {
        this.isLoading = false;

        let list: AssignmentListItem[] = [];
        let total = 0;
        let totalPages = 1;

        if (Array.isArray(response.data)) {
          list = response.data;
          total = response.pagination?.total_items ?? response.pagination?.total ?? response.total_items ?? response.total ?? list.length;
          if (response.pagination?.page) this.currentPage = response.pagination.page;
          if (response.pagination?.limit) this.limit = response.pagination.limit;
          totalPages = response.pagination?.total_pages ?? response.pagination?.totalPages ?? (Math.ceil(total / this.limit) || 1);
        } else if (response.data && typeof response.data === 'object') {
          list = response.data.assignments || [];
          total = response.data.total_items ?? response.data.total ?? response.pagination?.total_items ?? response.pagination?.total ?? list.length;
          if (response.data.page) this.currentPage = response.data.page;
          if (response.data.limit) this.limit = response.data.limit;
          totalPages = response.data.total_pages ?? response.data.totalPages ?? response.pagination?.total_pages ?? (Math.ceil(total / this.limit) || 1);
        } else if (Array.isArray(response.assignments)) {
          list = response.assignments;
          total = response.pagination?.total_items ?? response.total ?? list.length;
          totalPages = response.pagination?.total_pages ?? (Math.ceil(total / this.limit) || 1);
        }

        this.assignments = list;
        this.totalRecords = total;
        this.totalPages = totalPages;
      },
      error: (err: Error) => {
        this.isLoading = false;
        const msg = err.message || 'Failed to load assignments. Please try again.';
        this.errorMessage = msg;
        this.toastService.error(msg);
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onGradeSelect(grade: string): void {
    this.selectedGrade = grade;
    this.currentPage = 1;
    this.loadAssignments();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage || this.isLoading) {
      return;
    }
    this.currentPage = page;
    this.loadAssignments();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get startIndex(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.limit + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.limit, this.totalRecords);
  }

  getCoverImage(item: AssignmentListItem): string {
    const imgPath = item.book_cover_url || item.attachment_url || item.bookCover || item.attachmentUrl || item.attachment;
    if (!imgPath) {
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10';
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

  formatDueDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (e) {
      console.warn('Error formatting date:', e);
    }
    return dateStr;
  }

  viewDetails(assignmentId: string | number | undefined): void {
    if (assignmentId !== undefined && assignmentId !== null) {
      this.router.navigate(['/teacher/assignments', assignmentId]);
    }
  }

  createAssignment(): void {
    this.router.navigate(['/teacher/assignments/new']);
  }

  openImg(item: AssignmentListItem): void {
    this.modalImgUrl = this.getCoverImage(item);
  }
}
