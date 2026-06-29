import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface Student {
  id: number;
  name: string;
  grade: string;
  parentName: string;
  avatar: string;
  status: 'Active' | 'Needs Attention';
}

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-students.component.html',
  styleUrl: './teacher-students.component.css'
})
export class TeacherStudentsComponent {
  students: Student[] = [
    {
      id: 1,
      name: 'Ali Khan',
      grade: 'Grade 4',
      parentName: 'Ali Khan (Parent)',
      avatar: 'assets/img/boy.jpg',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Sarah Ahmed',
      grade: 'Grade 4',
      parentName: 'Mr. Ahmed',
      avatar: 'assets/img/client_2.png',
      status: 'Needs Attention'
    },
    {
      id: 3,
      name: 'Omar Abdullah',
      grade: 'Grade 4',
      parentName: 'Mrs. Abdullah',
      avatar: 'assets/img/client_3.png',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Aisha Rahman',
      grade: 'Grade 4',
      parentName: 'Mr. Rahman',
      avatar: 'assets/img/client_1.png',
      status: 'Active'
    }
  ];

  constructor(private router: Router) {}

  viewDetails(studentId: number) {
    this.router.navigate(['/teacher/students', studentId]);
  }
}
