import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

export interface StudentItem {
  id: number | string;
  sNo?: number;
  rollNo?: string;
  rollNumber?: string;
  avatar?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  grade?: string;
  dob?: string;
  dateOfBirth?: string;
  email?: string;
  status?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
}

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './teacher-students.component.html',
  styleUrl: './teacher-students.component.css'
})
export class TeacherStudentsComponent implements OnInit {
  imgUrl: any = '';
  students: StudentItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  imageBaseUrl = environment.imageBaseUrl;

  searchTerm: string = '';
  selectedGrade: string = 'All Grade';
  private searchSubject = new Subject<string>();

  gradeOptions: string[] = [
    'All Grade',
    'Pre-K',
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    'Adult Learner / Tutoring'
  ];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalStudents: number = 0;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.fetchStudents();
    });

    this.fetchStudents();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  selectGrade(grade: string): void {
    this.selectedGrade = grade;
    this.currentPage = 1;
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.isLoading = true;
    this.errorMessage = null;

    let endpoint = 'teacher/students';
    const params: string[] = [];

    if (this.selectedGrade && this.selectedGrade !== 'All Grade') {
      params.push(`grade=${encodeURIComponent(this.selectedGrade)}`);
    }

    if (this.searchTerm && this.searchTerm.trim()) {
      params.push(`search=${encodeURIComponent(this.searchTerm.trim())}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    this.apiService.get<any>(endpoint).subscribe({
      next: (res) => {
        this.isLoading = false;
        let list: StudentItem[] = [];
        if (Array.isArray(res)) {
          list = res;
          this.totalStudents = res.length;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
          this.totalStudents = res.total !== undefined ? res.total : res.data.length;
        } else if (res && Array.isArray(res.students)) {
          list = res.students;
          this.totalStudents = res.total !== undefined ? res.total : res.students.length;
        }

        this.students = list;

        // Auto collect any new grades dynamically from backend response if present
        list.forEach(std => {
          if (std.grade && !this.gradeOptions.includes(std.grade)) {
            this.gradeOptions.push(std.grade);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load students.';
      }
    });
  }

  get paginatedStudents(): StudentItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.students.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalStudents / this.pageSize) || 1;
  }

  get totalPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get startIndex(): number {
    if (this.totalStudents === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalStudents);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getAvatarUrl(avatar?: string | null): string {
    if (!avatar) return 'assets/img/boy.jpg';
    if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:') || avatar.startsWith('assets/')) {
      return avatar;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const path = avatar.startsWith('/') ? avatar.substring(1) : avatar;
    return `${base}${path}`;
  }

  viewDetails(studentId: number | string): void {
    this.router.navigate(['/teacher/students', studentId]);
  }

  openImg(std: StudentItem): void {
    this.imgUrl = this.getAvatarUrl(std.avatar);
  }
}
