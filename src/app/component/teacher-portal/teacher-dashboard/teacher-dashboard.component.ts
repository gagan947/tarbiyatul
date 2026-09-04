import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { AssignmentListItem } from '../../../core/models/assignment.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {
  isLoading = false;
  dashboardData: any = null;
  recentAssignments: AssignmentListItem[] = [];
  modalImgUrl = 'assets/img/book_1.png';
  imageBaseUrl = environment.imageBaseUrl;

  // Dashboard Stats matching backend { stats: { total_students, teaching_grade, total_assignments, pending_gradings } }
  totalStudents: number | string = 0;
  teachingGrade: string = '1st Grade';
  activeAssignments: number | string = 0;
  pendingReviews: number | string = 0;

  constructor(
    private apiService: ApiService,
    private assignmentService: AssignmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.isLoading = true;
    this.apiService.get<any>('teacher/dashboard').subscribe({
      next: (res) => {
        this.isLoading = false;
        this.dashboardData = res?.data || res;
        this.processDashboardStats();
        this.loadRecentAssignments();
      },
      error: () => {
        // Fallback to legacy dashboard endpoint
        this.apiService.get<any>('dashboard/teacher').subscribe({
          next: (res) => {
            this.isLoading = false;
            this.dashboardData = res?.data || res;
            this.processDashboardStats();
            this.loadRecentAssignments();
          },
          error: () => {
            this.isLoading = false;
            this.loadRecentAssignments();
          }
        });
      }
    });
  }

  private processDashboardStats(): void {
    if (!this.dashboardData) return;

    const stats = this.dashboardData.stats || this.dashboardData;

    // Total Students
    if (stats.total_students !== undefined) {
      this.totalStudents = stats.total_students;
    } else if (stats.totalStudents !== undefined) {
      this.totalStudents = stats.totalStudents;
    } else if (stats.studentsCount !== undefined) {
      this.totalStudents = stats.studentsCount;
    }

    // Teaching Grade
    if (stats.teaching_grade !== undefined) {
      this.teachingGrade = stats.teaching_grade;
    } else if (stats.teachingGrade !== undefined) {
      this.teachingGrade = stats.teachingGrade;
    } else if (stats.total_grades !== undefined) {
      this.teachingGrade = `${stats.total_grades} Grades`;
    } else if (stats.totalGrades !== undefined) {
      this.teachingGrade = `${stats.totalGrades} Grades`;
    }

    // Total / Active Assignments
    if (stats.total_assignments !== undefined) {
      this.activeAssignments = stats.total_assignments;
    } else if (stats.active_assignments !== undefined) {
      this.activeAssignments = stats.active_assignments;
    } else if (stats.activeAssignments !== undefined) {
      this.activeAssignments = stats.activeAssignments;
    } else if (stats.totalAssignments !== undefined) {
      this.activeAssignments = stats.totalAssignments;
    }

    // Pending Reviews / Gradings
    if (stats.pending_gradings !== undefined) {
      this.pendingReviews = stats.pending_gradings;
    } else if (stats.pending_reviews !== undefined) {
      this.pendingReviews = stats.pending_reviews;
    } else if (stats.pendingReviews !== undefined) {
      this.pendingReviews = stats.pendingReviews;
    } else if (stats.pendingSubmissions !== undefined) {
      this.pendingReviews = stats.pendingSubmissions;
    }
  }

  private loadRecentAssignments(): void {
    // 1. Check if dashboard payload already contains recent_assignments
    const recent = this.dashboardData?.recent_assignments || 
                   this.dashboardData?.recentAssignments || 
                   this.dashboardData?.assignments;

    if (Array.isArray(recent) && recent.length > 0) {
      this.recentAssignments = recent.slice(0, 5);
      return;
    }

    // 2. If recent_assignments is an empty array provided by the API
    if (Array.isArray(this.dashboardData?.recent_assignments) || Array.isArray(this.dashboardData?.recentAssignments)) {
      this.recentAssignments = (this.dashboardData?.recent_assignments || this.dashboardData?.recentAssignments || []).slice(0, 5);
      return;
    }

    // 3. Fallback to querying teacher assignments
    this.assignmentService.getTeacherAssignments({ page: 1, limit: 5 }).subscribe({
      next: (res) => {
        let list: AssignmentListItem[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).assignments)) {
          list = (res.data as any).assignments;
        } else if (Array.isArray(res.assignments)) {
          list = res.assignments;
        }

        this.recentAssignments = list.slice(0, 5);
      },
      error: () => {
        this.recentAssignments = [];
      }
    });
  }

  getCoverImage(item: AssignmentListItem): string {
    const imgPath = item.book_cover_url || item.attachment_url || item.bookCover || item.attachmentUrl || item.attachment || item.assignment_attachment;
    if (!imgPath) {
      return 'assets/img/book_1.png';
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

  formatDueDate(dateStr?: string | null): string {
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
    } catch {
      // Fallback
    }
    return dateStr;
  }

  getSubjectBadgeClass(subject?: string | null): string {
    if (!subject) return 'badge-subject-default';
    const sub = subject.toLowerCase();
    if (sub.includes('islamic') || sub.includes('quran') || sub.includes('arabic')) {
      return 'badge-subject-green';
    } else if (sub.includes('math')) {
      return 'badge-subject-blue';
    } else if (sub.includes('science')) {
      return 'badge-subject-purple';
    } else if (sub.includes('english')) {
      return 'badge-subject-orange';
    }
    return 'badge-subject-default';
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
