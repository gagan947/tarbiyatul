import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudentAssignmentItem, AssignmentListItem } from '../../../core/models/assignment.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-assignment-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-assignment-details.component.html',
  styleUrl: './parent-assignment-details.component.css'
})
export class ParentAssignmentDetailsComponent implements OnInit {
  assignmentId!: string | number;
  assignment: StudentAssignmentItem | AssignmentListItem | any | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  imageBaseUrl = environment.imageBaseUrl;
  defaultCoverImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.assignmentId = idParam;
      this.fetchAssignmentDetails(this.assignmentId);
    } else {
      this.errorMessage = 'Invalid Assignment ID';
    }
  }

  fetchAssignmentDetails(id: string | number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.assignmentService.getAssignmentById(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          this.assignment = response.data;
        } else if (response && (response.id || response.assignment_id)) {
          this.assignment = response;
        } else {
          this.errorMessage = 'Assignment details not found.';
        }
      },
      error: (err: Error) => {
        this.isLoading = false;
        console.error('Error fetching assignment details:', err);
        const msg = err.message || 'Failed to load assignment details.';
        this.errorMessage = msg;
        this.toastService.error(msg);
      }
    });
  }

  getComputedStatus(item: any): string {
    if (!item) return 'In Progress';
    const raw = (item.status || item.submission_status || item.my_submission?.status || 'In Progress').toLowerCase().trim();
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

  getTeacherName(item: any): string {
    if (!item) return 'Teacher';
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

  getCoverImage(item: any): string {
    if (!item) return this.defaultCoverImage;
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

  getInstructionsList(instructionsStr?: string | null): string[] {
    if (!instructionsStr || !instructionsStr.trim()) {
      return [];
    }
    return instructionsStr
      .split(/\r?\n/)
      .map(line => line.replace(/^[\s\-\*\•]+/, '').trim())
      .filter(line => line.length > 0);
  }

  isIslamicAlertEnabled(item: any): boolean {
    if (!item) return false;
    return item.enable_islamic_alert === 1 || item.enable_islamic_alert === true;
  }

  getScoreDisplay(item: any): string {
    if (!item) return '--';
    if (item.score) return item.score;
    const sub = item.my_submission;
    if (sub) {
      if (sub.marks_obtained !== undefined && sub.marks_obtained !== null) {
        return item.total_points ? `${sub.marks_obtained}/${item.total_points}` : `${sub.marks_obtained}`;
      }
      if (sub.grade) return sub.grade;
    }
    if (item.marks_obtained !== undefined && item.marks_obtained !== null) {
      return item.total_points ? `${item.marks_obtained}/${item.total_points}` : `${item.marks_obtained}`;
    }
    if (item.grade) return item.grade;
    return '--';
  }

  getTeacherFeedback(item: any): string | null {
    if (!item) return null;
    if (item.feedback) return item.feedback;
    if (item.my_submission && item.my_submission.feedback) {
      return item.my_submission.feedback;
    }
    return null;
  }

  backToList(): void {
    this.router.navigate(['/parent/assignments']);
  }
}
