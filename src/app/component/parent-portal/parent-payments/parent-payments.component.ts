import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Payment {
  month: string;
  tuitionFee: string;
  bookFee: string;
  total: string;
  status: 'Pending' | 'Overdue' | 'Paid';
  dueDate: string;
}

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parent-payments.component.html',
  styleUrl: './parent-payments.component.css'
})
export class ParentPaymentsComponent {
  payments: Payment[] = [
    {
      month: 'May 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Pending',
      dueDate: 'May 20, 2025'
    },
    {
      month: 'April 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Overdue',
      dueDate: 'May 20, 2025'
    },
    {
      month: 'Mar 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Paid',
      dueDate: 'May 20, 2025'
    },
    {
      month: 'Feb 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Paid',
      dueDate: 'May 20, 2025'
    },
    {
      month: 'Jan 2025',
      tuitionFee: '300',
      bookFee: '50',
      total: '350',
      status: 'Paid',
      dueDate: 'May 20, 2025'
    }
  ];

  selectedFilter: 'All' | 'Paid' | 'Pending' | 'Overdue' = 'All';

  filteredPayments(): Payment[] {
    if (this.selectedFilter === 'All') {
      return this.payments;
    }
    return this.payments.filter(p => p.status === this.selectedFilter);
  }

  setFilter(filter: 'All' | 'Paid' | 'Pending' | 'Overdue'): void {
    this.selectedFilter = filter;
  }
}
