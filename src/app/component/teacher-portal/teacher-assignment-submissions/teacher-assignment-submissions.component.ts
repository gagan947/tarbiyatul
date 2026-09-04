import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../core/services/assignment.service';
import { environment } from '../../../../environments/environment';

export interface AssignmentHeaderInfo {
  id?: number | string;
  title?: string;
  grade_level?: string;
  total_points?: number;
  book_title?: string;
  book_cover_url?: string;
}

export interface SubmissionItem {
  submission_id?: number | string | null;
  id?: number | string | null;
  assignment_id?: number | string;
  student_id: number | string;
  student_name?: string;
  roll_no?: string;
  rollNumber?: string;
  student_email?: string;
  student_grade_level?: string;
  student_profile_image?: string | null;
  avatar?: string;
  status?: string;
  status_label?: string;
  score?: string;
  marks_obtained?: number | string | null;
  total_points?: number;
  submitted_at?: string | null;
}

@Component({
  selector: 'app-teacher-assignment-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './teacher-assignment-submissions.component.html',
  styleUrl: './teacher-assignment-submissions.component.css'
})
export class TeacherAssignmentSubmissionsComponent implements OnInit {
  assignmentId: string | null = null;
  assignmentInfo: AssignmentHeaderInfo | null = null;
  submissions: SubmissionItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  imgUrl: string = 'assets/img/placeholder.jpg';
  imageBaseUrl = environment.imageBaseUrl;

  searchTerm: string = '';
  selectedStatus: string = 'All Status';
  statusOptions: string[] = ['All Status', 'COMPLETED', 'PENDING', 'GRADED', 'REVIEWED'];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private assignmentService: AssignmentService
  ) {
    this.assignmentId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.assignmentId) {
      this.fetchSubmissions();
    } else {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.assignmentId = params['id'];
          this.fetchSubmissions();
        }
      });
    }
  }

  fetchSubmissions(): void {
    if (!this.assignmentId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.assignmentService.getAssignmentSubmissions(this.assignmentId).subscribe({
      next: (res) => {
        this.isLoading = false;
        const data = res?.data || res;
        if (data) {
          if (data.assignment) {
            this.assignmentInfo = data.assignment;
          }
          if (Array.isArray(data.submissions)) {
            this.submissions = data.submissions;
          } else if (Array.isArray(data)) {
            this.submissions = data;
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load submissions.';
      }
    });
  }

  get filteredSubmissions(): SubmissionItem[] {
    return this.submissions.filter(item => {
      // Status filter
      if (this.selectedStatus && this.selectedStatus !== 'All Status') {
        const itemStatus = (item.status_label || item.status || '').toUpperCase();
        if (itemStatus !== this.selectedStatus.toUpperCase()) {
          return false;
        }
      }

      // Search filter
      if (this.searchTerm && this.searchTerm.trim()) {
        const query = this.searchTerm.toLowerCase().trim();
        const name = (item.student_name || '').toLowerCase();
        const roll = (item.roll_no || item.rollNumber || '').toLowerCase();
        const email = (item.student_email || '').toLowerCase();
        return name.includes(query) || roll.includes(query) || email.includes(query);
      }

      return true;
    });
  }

  get paginatedSubmissions(): SubmissionItem[] {
    const list = this.filteredSubmissions;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  }

  get totalCount(): number {
    return this.filteredSubmissions.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  get totalPagesArray(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages; i++) {
      arr.push(i);
    }
    return arr;
  }

  get startIndex(): number {
    if (this.totalCount === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  getBookCoverUrl(item?: any): string {
    if (!item) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10';
    const url = item.book_cover_url || item.bookCoverUrl || item.coverImage || item.bookCover || item.cover_image || item.cover || item.attachment_url;
    if (!url) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('assets/')) {
      return url;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const clean = url.startsWith('/') ? url.substring(1) : url;
    return `${base}${clean}`;
  }

  getAvatarUrl(avatar?: string | null): string {
    if (!avatar) return 'assets/img/placeholder.jpg';
    if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:') || avatar.startsWith('assets/')) {
      return avatar;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const path = avatar.startsWith('/') ? avatar.substring(1) : avatar;
    return `${base}${path}`;
  }

  getStatusBadgeColor(status?: string, statusLabel?: string): { bg: string; color: string } {
    const s = (statusLabel || status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'SUBMITTED' || s === 'GRADED') {
      return { bg: '#00B5361A', color: '#00B536' };
    }
    if (s === 'REVIEWED') {
      return { bg: '#0267EB1A', color: '#0267EB' };
    }
    return { bg: '#FF7A001A', color: '#FF7A00' };
  }

  getDisplayScore(item: SubmissionItem): string {
    if (item.marks_obtained !== null && item.marks_obtained !== undefined) {
      return `${item.marks_obtained}/${item.total_points || this.assignmentInfo?.total_points || 100}`;
    }
    if (item.score && item.score !== '--') {
      return item.score;
    }
    return '--';
  }

  openImg(item: SubmissionItem): void {
    this.imgUrl = this.getAvatarUrl(item.student_profile_image || item.avatar);
  }

  viewDetails(studentId: number | string): void {
    if (this.assignmentId) {
      this.router.navigate(['/teacher/assignments', this.assignmentId, 'submissions', studentId]);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
