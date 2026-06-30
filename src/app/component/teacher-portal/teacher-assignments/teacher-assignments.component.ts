import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface Assignment {
  id: number;
  bookCover: string;
  bookTitle: string;
  requiredReading: string;
  subject: string;
  grade: string;
  dueDate: string;
}

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-assignments.component.html',
  styleUrl: './teacher-assignments.component.css'
})
export class TeacherAssignmentsComponent {
  assignments: Assignment[] = [
    {
      id: 1,
      bookCover: 'assets/img/book_1.png',
      bookTitle: 'Stories of the Prophets',
      requiredReading: 'Read Pages 10–20',
      subject: 'Islamic Studies',
      grade: 'Grade 3',
      dueDate: 'May 20, 2025'
    },
    {
      id: 2,
      bookCover: 'assets/img/book_2.png',
      bookTitle: 'Fractions Worksheet',
      requiredReading: 'Exercise 4A & 4B',
      subject: 'Mathematics',
      grade: 'Grade 2',
      dueDate: 'May 16, 2025'
    },
    {
      id: 3,
      bookCover: 'assets/img/book_3.png',
      bookTitle: 'Dua Memorization',
      requiredReading: 'Surah Al-Kahf 1-20',
      subject: 'Islamic Studies',
      grade: 'Grade 3',
      dueDate: 'May 2, 2025'
    },
    {
      id: 4,
      bookCover: 'assets/img/book_1.png',
      bookTitle: 'Eplore Science',
      requiredReading: 'Read Pages 15–22',
      subject: 'Science',
      grade: 'Grade 1',
      dueDate: 'May 14, 2025'
    },
    {
      id: 5,
      bookCover: 'assets/img/book_2.png',
      bookTitle: 'Quran Reading Practice',
      requiredReading: 'Surah Al-Kahf 1-20',
      subject: 'Islamic Studies',
      grade: 'Grade 4',
      dueDate: 'May 26, 2025'
    }
  ];

  constructor(private router: Router) {}

  viewDetails(assignmentId: number): void {
    this.router.navigate(['/teacher/assignments', assignmentId]);
  }

  createAssignment(): void {
    this.router.navigate(['/teacher/assignments/new']);
  }
}
