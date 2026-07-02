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
  status: 'In Progress' | 'Overdue' | 'Completed' | 'Not Started';
  coverImage: string;
  grade: string;
  subject: string;
  instructions: string[];
  notice?: string;
  score?: string;
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
      title: 'Stories of the Prophets',
      assignedBy: 'Ustadh Hamza',
      assignedDate: '18 May, 2025',
      dueDate: 'May 20, 2025',
      bookTitle: 'Stories of the Prophets',
      pagesRange: 'Read Pages 10–20',
      status: 'Completed',
      coverImage: 'assets/img/book_1.png',
      grade: 'Grade 4',
      subject: 'Islamic Studies',
      instructions: [
        'Read pages 10–20 carefully',
        'Focus on key lessons from the story of Prophet Yusuf (AS)',
        'Complete the reflection activity before the due date',
        'Understand moral lessons and apply them to daily life'
      ],
      notice: 'This reading contains sections that require teacher guidance. Please avoid pages 15–16 and follow your teacher\'s instructions.',
      score: '16/20'
    },
    {
      id: 2,
      title: 'Fractions Worksheet',
      assignedBy: 'Mr. Ahmed',
      assignedDate: '18 May, 2025',
      dueDate: 'May 16, 2025',
      bookTitle: 'Fractions Worksheet',
      pagesRange: 'Exercise 4A & 4B',
      status: 'In Progress',
      coverImage: 'assets/img/book_2.png',
      grade: 'Grade 4',
      subject: 'Mathematics',
      instructions: [
        'Complete all questions on Fractions Worksheet',
        'Verify your answers using the guide'
      ],
      score: '--'
    },
    {
      id: 3,
      title: 'Dua Memorization',
      assignedBy: 'Ustadh Hamza',
      assignedDate: '18 May, 2025',
      dueDate: 'May 2, 2025',
      bookTitle: 'Dua Memorization',
      pagesRange: 'Surah Al-Kahf 1-20',
      status: 'Overdue',
      coverImage: 'assets/img/book_3.png',
      grade: 'Grade 4',
      subject: 'Islamic Studies',
      instructions: [
        'Read and memorize Surah Al-Kahf 1-20 carefully'
      ],
      score: '--'
    },
    {
      id: 4,
      title: 'Eplore Science',
      assignedBy: 'Ustadh Hamza',
      assignedDate: '18 May, 2025',
      dueDate: 'May 14, 2025',
      bookTitle: 'Eplore Science',
      pagesRange: 'Read Pages 15–22',
      status: 'Not Started',
      coverImage: 'assets/img/book_2.png',
      grade: 'Grade 4',
      subject: 'Science',
      instructions: [
        'Read Pages 15–22 of Explore Science book'
      ],
      score: '--'
    },
    {
      id: 5,
      title: 'Quran Reading Practice',
      assignedBy: 'Ustadh Hamza',
      assignedDate: '18 May, 2025',
      dueDate: 'May 26, 2025',
      bookTitle: 'Quran Reading Practice',
      pagesRange: 'Surah Al-Kahf 1-20',
      status: 'Completed',
      coverImage: 'assets/img/book_1.png',
      grade: 'Grade 4',
      subject: 'Islamic Studies',
      instructions: [
        'Practice Quran Reading for Surah Al-Kahf 1-20'
      ],
      score: '37/50'
    }
  ];

  selectedFilter: 'All' | 'In Progress' | 'Completed' | 'Not Started' | 'Overdue' = 'All';
  currentPage = 1;
  totalPages = 3;

  constructor(private router: Router) {}

  filteredAssignments(): Assignment[] {
    if (this.selectedFilter === 'All') {
      return this.assignments;
    }
    return this.assignments.filter(a => a.status === this.selectedFilter);
  }

  setFilter(filter: 'All' | 'In Progress' | 'Completed' | 'Not Started' | 'Overdue'): void {
    this.selectedFilter = filter;
  }

  viewDetails(assignmentId: number): void {
    this.router.navigate(['/parent/assignments', assignmentId]);
  }
}
