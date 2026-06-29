import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

interface AssignmentHistory {
  id: number;
  title: string;
  subject: string;
  status: 'Completed' | 'In Progress' | 'Overdue' | 'Not Started';
  score: string;
  dueDate: string;
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
    name: 'Ali Khan',
    grade: 'Grade 4',
    parentName: 'Ali Khan (Parent)',
    avatar: 'assets/img/boy.jpg',
    status: 'Active',
    email: 'ali.khan@example.com',
    attendance: '95%'
  };

  history: AssignmentHistory[] = [
    {
      id: 1,
      title: 'Stories Of The Prophets',
      subject: 'Islamic Studies',
      status: 'Completed',
      score: '95/100',
      dueDate: 'May 20, 2025'
    },
    {
      id: 2,
      title: 'The World Of Plants',
      subject: 'Science',
      status: 'In Progress',
      score: '--',
      dueDate: 'May 25, 2025'
    },
    {
      id: 3,
      title: 'Fractions And Decimals',
      subject: 'Mathematics',
      status: 'Overdue',
      score: '--',
      dueDate: 'May 18, 2025'
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

  openChat() {
    this.router.navigate(['/teacher/message-teacher']);
  }

  assignTask() {
    this.router.navigate(['/teacher/assignments']);
  }

  goBack() {
    this.router.navigate(['/teacher/students']);
  }
}
