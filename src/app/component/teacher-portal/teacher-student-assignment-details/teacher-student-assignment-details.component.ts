import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-teacher-student-assignment-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './teacher-student-assignment-details.component.html',
  styleUrl: './teacher-student-assignment-details.component.css'
})
export class TeacherStudentAssignmentDetailsComponent implements OnInit {
  assignmentId: string | number | null = null;
  studentId: string | number | null = null;

  assignment: any = null;
  submission: any = null;
  student: any = null;

  isLoading = false;
  isSavingGrade = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imageBaseUrl = environment.imageBaseUrl;

  // Grading form
  gradeForm = {
    marks_obtained: null as number | null,
    grade: '',
    feedback: ''
  };

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assignmentId = params['id'] || this.route.snapshot.paramMap.get('id');
      this.studentId = params['studentId'] || this.route.snapshot.paramMap.get('studentId');
      if (this.assignmentId && this.studentId) {
        this.fetchDetails();
      }
    });
  }

  fetchDetails(): void {
    if (!this.assignmentId || !this.studentId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.assignmentService.getStudentAssignmentDetail(this.assignmentId, this.studentId).subscribe({
      next: (res) => {
        this.isLoading = false;
        const data = res?.data || res;
        if (data) {
          this.assignment = data;
          this.submission = data.my_submission || data.submission || null;
          const info = data.student_info || data.student || {};
          this.student = {
            name: info.name || (info.first_name ? `${info.first_name} ${info.last_name || ''}`.trim() : '') || data.student_name || 'Student',
            rollNumber: info.roll_no || info.rollNumber || data.roll_no || data.rollNumber || 'STU-' + this.studentId,
            gradeLevel: info.grade_level || info.gradeLevel || data.student_grade_level || data.grade_level || 'Grade',
            profileImage: info.profile_image || info.profileImage || info.avatar || data.student_profile_image || data.avatar
          };

          // Pre-populate grade form if already graded or has feedback
          const marks = data.marks_obtained ?? this.submission?.marks_obtained ?? null;
          const gradeLetter = data.grade ?? this.submission?.grade ?? '';
          const teacherFeedback = data.feedback ?? this.submission?.feedback ?? '';

          this.gradeForm.marks_obtained = marks !== null ? Number(marks) : null;
          this.gradeForm.grade = gradeLetter;
          this.gradeForm.feedback = teacherFeedback;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load student assignment details.';
      }
    });
  }

  saveGrade(): void {
    if (!this.assignmentId || !this.studentId) return;

    if (this.gradeForm.marks_obtained === null || this.gradeForm.marks_obtained === undefined) {
      this.toastService.error('Please enter marks obtained.');
      return;
    }

    if (this.assignment?.total_points && this.gradeForm.marks_obtained > this.assignment.total_points) {
      this.toastService.error(`Marks obtained cannot exceed total points (${this.assignment.total_points}).`);
      return;
    }

    this.isSavingGrade = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      student_id: this.studentId,
      marks_obtained: Number(this.gradeForm.marks_obtained),
      grade: this.gradeForm.grade ? this.gradeForm.grade.trim() : undefined,
      feedback: this.gradeForm.feedback ? this.gradeForm.feedback.trim() : undefined
    };

    this.assignmentService.gradeAssignment(this.assignmentId, payload).subscribe({
      next: (res) => {
        this.isSavingGrade = false;
        const msg = res?.message || 'Grade saved successfully';
        this.successMessage = msg;
        this.toastService.success(msg);

        // Update local state
        if (this.assignment) {
          this.assignment.marks_obtained = payload.marks_obtained;
          this.assignment.grade = payload.grade;
          this.assignment.feedback = payload.feedback;
          this.assignment.submission_status = 'graded';
          this.assignment.status = 'graded';
        }
        if (this.submission) {
          this.submission.marks_obtained = payload.marks_obtained;
          this.submission.grade = payload.grade;
          this.submission.feedback = payload.feedback;
          this.submission.status = 'graded';
        }
      },
      error: (err) => {
        this.isSavingGrade = false;
        const errMsg = err?.error?.message || err?.message || 'Failed to save grade. Please try again.';
        this.errorMessage = errMsg;
        this.toastService.error(errMsg);
      }
    });
  }

  get isSubmitted(): boolean {
    if (!this.assignment && !this.submission) return false;
    const s = (this.assignment?.submission_status || this.assignment?.status || this.submission?.status || '').toLowerCase();
    return s === 'submitted' || s === 'completed' || s === 'graded' || s === 'reviewed' || !!this.submission;
  }

  get isGraded(): boolean {
    const s = (this.assignment?.submission_status || this.assignment?.status || this.submission?.status || '').toLowerCase();
    return s === 'graded' || s === 'reviewed' || this.assignment?.marks_obtained !== null && this.assignment?.marks_obtained !== undefined;
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

  getStudentAvatarUrl(student?: any): string {
    if (!student) return 'assets/img/placeholder.jpg';
    const url = student.profileImage || student.profile_image || student.avatar;
    if (!url) return 'assets/img/placeholder.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('assets/')) {
      return url;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const clean = url.startsWith('/') ? url.substring(1) : url;
    return `${base}${clean}`;
  }

  getImageUrl(url?: string | null): string {
    if (!url) return 'assets/img/placeholder.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('assets/')) {
      return url;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const clean = url.startsWith('/') ? url.substring(1) : url;
    return `${base}${clean}`;
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  goBack(): void {
    this.location.back();
  }
}
