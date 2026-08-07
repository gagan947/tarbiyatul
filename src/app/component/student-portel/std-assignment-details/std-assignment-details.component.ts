import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudentAssignmentItem, AssignmentListItem } from '../../../core/models/assignment.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-std-assignment-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './std-assignment-details.component.html',
  styleUrl: './std-assignment-details.component.css'
})
export class StdAssignmentDetailsComponent implements OnInit {
  assignmentId!: string | number;
  assignment: StudentAssignmentItem | AssignmentListItem | null = null;
  isLoading = false;
  isUpdatingStatus = false;
  errorMessage: string | null = null;

  imageBaseUrl = environment.imageBaseUrl;
  defaultCoverImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private toastService: ToastService
  ) { }

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
      next: (response) => {
        this.isLoading = false;
        if (response.data) {
          this.assignment = response.data as unknown as StudentAssignmentItem;
        } else if (response && typeof response === 'object' && ('id' in response || 'assignment_id' in response)) {
          this.assignment = response as unknown as StudentAssignmentItem;
        } else {
          this.errorMessage = 'Assignment details not found.';
        }
      },
      error: (err: Error) => {
        this.isLoading = false;
        const msg = err.message || 'Failed to load assignment details.';
        this.errorMessage = msg;
        this.toastService.error(msg);
      }
    });
  }

  getComputedStatus(item: StudentAssignmentItem | AssignmentListItem | null): 'Pending' | 'In Progress' | 'Completed' | 'Overdue' {
    if (!item) return 'Pending';
    const rawStatus = (item.status || item.submission_status || item.my_submission?.status || 'pending').toLowerCase().trim();
    if (rawStatus === 'completed' || rawStatus === 'submitted' || rawStatus === 'graded') {
      return 'Completed';
    }
    if (rawStatus === 'overdue') {
      return 'Overdue';
    }
    if (rawStatus === 'in progress' || rawStatus === 'in_progress' || rawStatus === 'continue reading') {
      return 'In Progress';
    }
    return 'Pending';
  }

  startReading(): void {
    if (!this.assignmentId || this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    const payload = { status: 'continue reading' };

    this.assignmentService.updateAssignmentStatus(this.assignmentId, payload).subscribe({
      next: (res) => {
        this.isUpdatingStatus = false;
        const successMsg = res.message || 'Reading started successfully!';
        // this.toastService.success(successMsg);
        if (this.assignment) {
          this.assignment.status = 'in progress';
        }
        this.fetchAssignmentDetails(this.assignmentId);
      },
      error: (err: Error) => {
        this.isUpdatingStatus = false;
        const errMsg = err.message || 'Failed to update assignment status.';
        // this.toastService.error(errMsg);
      }
    });
  }

  markAsCompleted(): void {
    if (!this.assignmentId || this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    const payload = { status: 'mark as completed' };

    this.assignmentService.updateAssignmentStatus(this.assignmentId, payload).subscribe({
      next: (res) => {
        this.isUpdatingStatus = false;
        const successMsg = res.message || 'Assignment marked as completed!';
        this.toastService.success(successMsg);

        // Update local state and reload details
        if (this.assignment) {
          this.assignment.status = 'completed';
          if (this.assignment.my_submission) {
            this.assignment.my_submission.status = 'submitted';
          }
        }
        this.fetchAssignmentDetails(this.assignmentId);
      },
      error: (err: Error) => {
        this.isUpdatingStatus = false;
        const errMsg = err.message || 'Failed to mark assignment as completed.';
        this.toastService.error(errMsg);
      }
    });
  }

  getTeacherName(item: StudentAssignmentItem | AssignmentListItem | null): string {
    if (!item) return 'Teacher';
    const stdItem = item as StudentAssignmentItem;
    const first = stdItem.teacher_first_name || '';
    const last = stdItem.teacher_last_name || '';
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

  getCoverImage(item: StudentAssignmentItem | AssignmentListItem | null): string {
    if (!item) return this.defaultCoverImage;
    const imgPath = item.book_cover_url || item.attachment || item.attachment_url || (item as StudentAssignmentItem).assignment_attachment;
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

  isIslamicAlertEnabled(item: StudentAssignmentItem | AssignmentListItem | null): boolean {
    if (!item) return false;
    return item.enable_islamic_alert === 1 || item.enable_islamic_alert === true;
  }

  backToList(): void {
    this.router.navigate(['/student/assignments']);
  }

  navigateToMessages(): void {
    this.router.navigate(['/student/message-teacher']);
  }
}
