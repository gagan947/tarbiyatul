import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Book {
  title: string;
  category: string;
  grade: string;
  coverImage: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  status: 'Reading' | 'Completed' | 'Pending';
}

@Component({
  selector: 'app-std-my-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './std-my-books.component.html',
  styleUrl: './std-my-books.component.css'
})
export class StdMyBooksComponent {
  books: Book[] = [
    {
      title: 'Stories of the Prophets',
      category: 'Islamic Studies',
      grade: 'Grade 4',
      coverImage: 'assets/img/book_1.png',
      progress: 50,
      currentPage: 10,
      totalPages: 20,
      status: 'Reading'
    },
    {
      title: 'Daily Duas for Kids',
      category: 'Supplications',
      grade: 'Grade 4',
      coverImage: 'assets/img/book_2.png',
      progress: 30,
      currentPage: 24,
      totalPages: 80,
      status: 'Reading'
    },
    {
      title: 'Arabic Writing Workbook',
      category: 'Language',
      grade: 'Grade 4',
      coverImage: 'assets/img/book_3.png',
      progress: 100,
      currentPage: 60,
      totalPages: 60,
      status: 'Completed'
    },
    {
      title: 'Islamic Manners',
      category: 'Akhlaq',
      grade: 'Grade 4',
      coverImage: 'assets/img/book_4.png',
      progress: 0,
      currentPage: 0,
      totalPages: 45,
      status: 'Pending'
    },
    {
      title: 'Quran Stories for Kids',
      category: 'Quranic Studies',
      grade: 'Grade 4',
      coverImage: 'assets/img/book_5.png',
      progress: 30,
      currentPage: 15,
      totalPages: 50,
      status: 'Reading'
    }
  ];

  selectedFilter: 'All' | 'Reading' | 'Completed' | 'Pending' = 'All';

  filteredBooks(): Book[] {
    if (this.selectedFilter === 'All') {
      return this.books;
    }
    return this.books.filter(book => book.status === this.selectedFilter);
  }

  setFilter(filter: 'All' | 'Reading' | 'Completed' | 'Pending'): void {
    this.selectedFilter = filter;
  }
}
