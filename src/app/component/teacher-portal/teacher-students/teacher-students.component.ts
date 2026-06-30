import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface Student {
  id: number;
  rollNo: string;
  avatar: string;
  name: string;
  grade: string;
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
      rollNo: 'STU-1001',
      avatar: 'assets/img/boy.jpg',
      name: 'Ali Khan',
      grade: 'Grade 1'
    },
    {
      id: 2,
      rollNo: 'STU-1001',
      avatar: 'assets/img/boy.jpg',
      name: 'Ali Khan',
      grade: 'Grade 4'
    },
    {
      id: 3,
      rollNo: 'STU-1001',
      avatar: 'assets/img/boy.jpg',
      name: 'Ali Khan',
      grade: 'Grade 2'
    },
    {
      id: 4,
      rollNo: 'STU-1001',
      avatar: 'assets/img/boy.jpg',
      name: 'Ali Khan',
      grade: 'Grade 3'
    },
    {
      id: 5,
      rollNo: 'STU-1001',
      avatar: 'assets/img/boy.jpg',
      name: 'Ali Khan',
      grade: 'Grade 1'
    }
  ];

  constructor(private router: Router) {}

  viewDetails(studentId: number) {
    this.router.navigate(['/teacher/students', studentId]);
  }
}
