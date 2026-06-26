import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
  selector: 'app-parent-assignment-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-assignment-details.component.html',
  styleUrl: './parent-assignment-details.component.css'
})
export class ParentAssignmentDetailsComponent implements OnInit {
  assignmentId!: number;
  assignment: Assignment | null = null;

  // Mock list to find the assignment by ID
  assignmentsMock: Assignment[] = [
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
        'Focus on key lessons',
        'Complete before due date',
        'Understand moral lessons'
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.assignmentId = +idParam;
      const found = this.assignmentsMock.find(a => a.id === this.assignmentId);
      if (found) {
        this.assignment = found;
      }
    }
  }

  backToList(): void {
    this.router.navigate(['/student/assignments']);
  }

  markAsCompleted(): void {
    if (this.assignment) {
      this.assignment.status = 'Completed';
    }
  }

  navigateToMessages(): void {
    this.router.navigate(['/student/message-teacher']);
  }
}
