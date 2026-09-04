import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

interface AssignmentHistory {
  id: number;
  title: string;
  subject: string;
  status: 'REVIEWED' | 'PENDING' | 'COMPLETED';
  score: string;
}

@Component({
  selector: 'app-teacher-student-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-student-details.component.html',
  styleUrl: './teacher-student-details.component.css'
})
export class TeacherStudentDetailsComponent implements OnInit {
  studentId: string | number = 0;
  isLoading = false;
  errorMessage: string | null = null;
  imageBaseUrl = environment.imageBaseUrl;
  
  student: any = {
    firstName: '',
    lastName: '',
    rollNumber: '',
    grade: '',
    dateOfBirth: '',
    gender: 'N/A',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    avatar: 'assets/img/boy.jpg'
  };

  history: AssignmentHistory[] = [
    {
      id: 1,
      title: 'Stories of the Prophets',
      subject: 'Islamic Studies',
      status: 'REVIEWED',
      score: '95/100'
    },
    {
      id: 2,
      title: 'Fractions Practice',
      subject: 'Mathematics',
      status: 'REVIEWED',
      score: '88/100'
    },
    {
      id: 3,
      title: 'Science Reading',
      subject: 'Science',
      status: 'PENDING',
      score: '—'
    },
    {
      id: 4,
      title: 'Quran Memorization',
      subject: 'Islamic Studies',
      status: 'REVIEWED',
      score: '91/100'
    },
    {
      id: 5,
      title: 'Pillars of Islam',
      subject: 'Islamic Studies',
      status: 'COMPLETED',
      score: '—'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.studentId = params['id'];
      if (this.studentId) {
        this.fetchStudentDetails(this.studentId);
      }
    });
  }

  fetchStudentDetails(id: string | number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.get<any>(`teacher/students/${id}`).subscribe({
      next: (res) => {
        this.isLoading = false;
        const data = res?.data || res;
        if (data) {
          const names = (data.name || '').trim().split(' ');
          this.student = {
            firstName: data.firstName || names[0] || '',
            lastName: data.lastName || names.slice(1).join(' ') || '',
            rollNumber: data.rollNumber || data.rollNo || 'N/A',
            grade: data.grade || 'N/A',
            dateOfBirth: data.dateOfBirth || data.dob || 'N/A',
            gender: data.gender || 'N/A',
            parentName: data.parentName || 'N/A',
            parentEmail: data.parentEmail || 'N/A',
            parentPhone: data.parentPhone || 'N/A',
            avatar: this.getAvatarUrl(data.avatar)
          };

          if (Array.isArray(data.assignmentRecords) || Array.isArray(data.assignments) || Array.isArray(data.history)) {
            const records = data.assignmentRecords || data.assignments || data.history;
            if (records.length > 0) {
              this.history = records;
            }
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load student details.';
      }
    });
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

  goBack() {
    this.router.navigate(['/teacher/students']);
  }
}
