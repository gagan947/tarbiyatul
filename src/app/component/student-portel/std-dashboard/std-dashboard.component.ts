import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-std-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './std-dashboard.component.html',
  styleUrl: './std-dashboard.component.css'
})
export class StdDashboardComponent {
  progressPercentage = 60;

  newAssignments = [
    { title: 'The World of Plants', subject: 'Science', due: '12/6/2026', image: 'assets/img/book_1.png' },
    { title: 'The World of Plants', subject: 'Science', due: '12/6/2026', image: 'assets/img/book_2.png' },
    { title: 'The World of Plants', subject: 'Science', due: '12/6/2026', image: 'assets/img/book_3.png' }
  ];

  checklist = [
    { title: 'The World of Plants', subject: 'Science', completed: true },
    { title: 'The World of Plants', subject: 'Science', completed: false },
    { title: 'The World of Plants', subject: 'Science', completed: true },
    { title: 'The World of Plants', subject: 'Science', completed: true }
  ];

  announcement = {
    title: 'Jummah Reminder',
    body: "Don't forget to read Surah Al-Kahf and send your reflection in the class group.",
    teacher: 'Ustadh Hamza',
    date: '20 May, 2025'
  };

  alert = {
    body: 'Some pages in "Stories of the Prophets – Chapter 4" may not align with the Islamic learning objectives of this course. Please skip pages 24–28.',
    teacher: 'Ustadh Hamza',
    date: '20 May, 2025'
  };

  toggleCheck(index: number): void {
    this.checklist[index].completed = !this.checklist[index].completed;
  }
}
