import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface Assignment {
  id: number;
  title: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  bookTitle: string;
  pagesRange: string;
  status: 'In Progress' | 'Overdue' | 'Completed';
  coverImage: string;
  grade: string;
  subject: string;
  instructions: string[];
  notice?: string;
}

@Component({
  selector: 'app-parent-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-assignments.component.html',
  styleUrl: './parent-assignments.component.css'
})
export class ParentAssignmentsComponent {
  assignments: Assignment[] = [
    {
      id: 1,
      title: 'Stories of the Prophets – Reflection Activity',
      assignedBy: 'Ustadh Hamza',
      assignedDate: '18 May, 2025',
      dueDate: '25 May, 2025',
      bookTitle: 'Stories of the Prophets',
      pagesRange: 'Pages 10 – 20',
      status: 'In Progress',
      coverImage: 'assets/img/book_1.png',
      grade: 'Grade 4',
      subject: 'Islamic Studies',
      instructions: [
        'Read pages 10–20 carefully',
        'Focus on key lessons from the story of Prophet Yusuf (AS)',
        'Complete the reflection activity before the due date',
        'Understand moral lessons and apply them to daily life'
      ],
      notice: 'This reading contains sections that require teacher guidance. Please avoid pages 15–16 and follow your teacher\'s instructions.'
    },
    {
      id: 2,
      title: 'Stories of the Prophets – Reflection Activity',
      assignedBy: 'Mr. Ahmed',
      assignedDate: '18 May, 2025',
      dueDate: '25 May, 2025',
      bookTitle: 'Stories of the Prophets',
      pagesRange: 'Pages 10 – 20',
      status: 'Overdue',
      coverImage: 'assets/img/book_2.png',
      grade: 'Grade 4',
      subject: 'Islamic Studies',
      instructions: [
        'Read pages 10–20 carefully',
        'Complete before the due date'
      ],
      notice: 'This reading contains sections that require teacher guidance. Please avoid pages 15–16 and follow your teacher\'s instructions.'
    },
    {
      id: 3,
      title: 'Fractions and Decimals – Worksheet 4',
      assignedBy: 'Ustadh Hamza',
      assignedDate: '18 May, 2025',
      dueDate: '25 May, 2025',
      bookTitle: 'Arabic Writing Workbook',
      pagesRange: 'Pages 10 – 20',
      status: 'Completed',
      coverImage: 'assets/img/book_3.png',
      grade: 'Grade 4',
      subject: 'Mathematics',
      instructions: [
        'Complete all questions on Worksheet 4',
        'Verify your answers using the guide'
      ]
    },
    {
      id: 4,
      title: 'Fractions and Decimals – Worksheet 4',
      assignedBy: 'Ustadh Hamza',
      assignedDate: '18 May, 2025',
      dueDate: '25 May, 2025',
      bookTitle: 'Arabic Writing Workbook',
      pagesRange: 'Pages 10 – 20',
      status: 'Completed',
      coverImage: 'assets/img/book_1.png',
      grade: 'Grade 4',
      subject: 'Mathematics',
      instructions: [
        'Complete all questions on Worksheet 4'
      ]
    }
  ];

  selectedFilter: 'All' | 'Pending' | 'Completed' | 'Overdue' = 'All';
  currentPage = 1;
  totalPages = 3;

  constructor(private router: Router) {}

  filteredAssignments(): Assignment[] {
    if (this.selectedFilter === 'All') {
      return this.assignments;
    }
    if (this.selectedFilter === 'Pending') {
      return this.assignments.filter(a => a.status === 'In Progress');
    }
    if (this.selectedFilter === 'Completed') {
      return this.assignments.filter(a => a.status === 'Completed');
    }
    if (this.selectedFilter === 'Overdue') {
      return this.assignments.filter(a => a.status === 'Overdue');
    }
    return this.assignments;
  }

  setFilter(filter: 'All' | 'Pending' | 'Completed' | 'Overdue'): void {
    this.selectedFilter = filter;
  }

  viewDetails(assignmentId: number): void {
    this.router.navigate(['/student/assignments', assignmentId]);
  }
}
