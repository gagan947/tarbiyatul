import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

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
  studentId: number = 0;
  
  // Mock Data
  student = {
    firstName: 'Ali',
    lastName: 'Khan',
    rollNumber: 'STU-2024-001',
    grade: '5th',
    dateOfBirth: '15 March 2012',
    gender: 'Male',
    parentName: 'Ahmed Khan',
    parentEmail: 'ahmedkhan@email.com',
    parentPhone: '+1 (610) 977-1700',
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.studentId = +params['id'];
      // In a real application, fetch student details and history using this.studentId
    });
  }

  goBack() {
    this.router.navigate(['/teacher/students']);
  }
}
