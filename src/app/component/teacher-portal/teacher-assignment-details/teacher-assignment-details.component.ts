import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { AssignmentListItem } from '../../../core/models/assignment.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-teacher-assignment-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-assignment-details.component.html',
  styleUrl: './teacher-assignment-details.component.css'
})
export class TeacherAssignmentDetailsComponent implements OnInit {
  assignmentId!: string | number;
  assignment: AssignmentListItem | null = null;
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
      next: (response) => {
        this.isLoading = false;
        if (response.data) {
          this.assignment = response.data;
        } else if (response && typeof response === 'object' && 'id' in response) {
          this.assignment = response as unknown as AssignmentListItem;
        } else {
          this.errorMessage = 'Assignment details not found';
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

  getCoverImage(item: AssignmentListItem | null): string {
    if (!item) return this.defaultCoverImage;
    const imgPath = item.book_cover_url || item.attachment_url || item.bookCover || item.attachmentUrl || item.attachment;
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

  formatDate(dateStr?: string | null): string {
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

  getInstructionsList(instructionsStr?: string | null): string[] {
    if (!instructionsStr || !instructionsStr.trim()) {
      return [];
    }
    return instructionsStr
      .split(/\r?\n/)
      .map(line => line.replace(/^[\s\-\*\•]+/, '').trim())
      .filter(line => line.length > 0);
  }

  isIslamicAlertEnabled(item: AssignmentListItem | null): boolean {
    if (!item) return false;
    return item.enable_islamic_alert === 1 || item.enable_islamic_alert === true;
  }

  backToList(): void {
    this.router.navigate(['/teacher/assignments']);
  }

  editAssignment(): void {
    if (this.assignment && (this.assignment.id || this.assignment._id)) {
      const id = this.assignment.id || this.assignment._id;
      this.router.navigate(['/teacher/assignments/edit', id]);
    }
  }

  viewStudentRecords(): void {
    if (this.assignment && (this.assignment.id || this.assignment._id)) {
      const id = this.assignment.id || this.assignment._id;
      this.router.navigate(['/teacher/assignments', id, 'submissions']);
    }
  }
}
