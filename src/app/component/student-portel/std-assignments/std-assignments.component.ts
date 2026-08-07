import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudentAssignmentItem } from '../../../core/models/assignment.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-std-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './std-assignments.component.html',
  styleUrl: './std-assignments.component.css'
})
export class StdAssignmentsComponent implements OnInit {
  assignmentsList: StudentAssignmentItem[] = [];
  allAssignmentsForStats: StudentAssignmentItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  selectedFilter: 'All' | 'Pending' | 'Completed' | 'Overdue' = 'All';

  imageBaseUrl = environment.imageBaseUrl;
  defaultCoverImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10';

  constructor(
    private router: Router,
    private assignmentService: AssignmentService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.fetchStudentAssignments();
  }

  fetchStudentAssignments(filter?: 'All' | 'Pending' | 'Completed' | 'Overdue'): void {
    this.isLoading = true;
    this.errorMessage = null;
    const filterParam = filter || this.selectedFilter;

    this.assignmentService.getStudentAssignments(filterParam).subscribe({
      next: (response) => {
        this.isLoading = false;
        let list: StudentAssignmentItem[] = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            list = response.data;
          } else if (response.data.assignments && Array.isArray(response.data.assignments)) {
            list = response.data.assignments;
          }
        }

        this.assignmentsList = list;

        // If fetching overall list, cache it for statistics counters
        if (filterParam === 'All') {
          this.allAssignmentsForStats = list;
        }
      },
      error: (err: Error) => {
        this.isLoading = false;
        const msg = err.message || 'Failed to load student assignments.';
        this.errorMessage = msg;
        this.toastService.error(msg);
      }
    });
  }

  getStatusDisplay(item: StudentAssignmentItem): 'In Progress' | 'Completed' | 'Overdue' {
    const raw = (item.status || item.submission_status || 'In Progress').toLowerCase().trim();
    if (raw === 'completed' || raw === 'submitted' || raw === 'graded') {
      return 'Completed';
    }
    if (raw === 'overdue') {
      return 'Overdue';
    }
    return 'In Progress';
  }

  get totalCount(): number {
    return (this.allAssignmentsForStats.length > 0 ? this.allAssignmentsForStats : this.assignmentsList).length;
  }

  get inProgressCount(): number {
    const list = this.allAssignmentsForStats.length > 0 ? this.allAssignmentsForStats : this.assignmentsList;
    return list.filter(a => this.getStatusDisplay(a) === 'In Progress').length;
  }

  get completedCount(): number {
    const list = this.allAssignmentsForStats.length > 0 ? this.allAssignmentsForStats : this.assignmentsList;
    return list.filter(a => this.getStatusDisplay(a) === 'Completed').length;
  }

  get overdueCount(): number {
    const list = this.allAssignmentsForStats.length > 0 ? this.allAssignmentsForStats : this.assignmentsList;
    return list.filter(a => this.getStatusDisplay(a) === 'Overdue').length;
  }

  filteredAssignments(): StudentAssignmentItem[] {
    return this.assignmentsList;
  }

  setFilter(filter: 'All' | 'Pending' | 'Completed' | 'Overdue'): void {
    if (this.selectedFilter === filter) return;
    this.selectedFilter = filter;
    this.fetchStudentAssignments(filter);
  }

  getTeacherName(item: StudentAssignmentItem): string {
    const first = item.teacher_first_name || '';
    const last = item.teacher_last_name || '';
    const fullName = `${first} ${last}`.trim();
    return fullName || 'Teacher';
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (e) {
      console.warn('Error formatting date:', e);
    }
    return dateStr;
  }

  getCoverImage(item: StudentAssignmentItem): string {
    const imgPath = item.book_cover_url || item.assignment_attachment || item.student_attachment || item.attachment;
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

  viewDetails(assignmentId: number | string): void {
    this.router.navigate(['/student/assignments', assignmentId]);
  }
}
