import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teacher-calendar',
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-calendar.component.html',
  styleUrl: './teacher-calendar.component.css'
})
export class TeacherCalendarComponent {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();

  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  weeks: any[][] = [];

  upcomingEvents: any[] = [
    { id: 1, title: 'Strategy Design Development', date: new Date(this.currentYear, this.currentMonth, 14), time: '5:00 PM', colorClass: 'orange' },
    { id: 2, title: 'Design For Humanity', date: new Date(this.currentYear, this.currentMonth, 19), time: '5:00 PM', colorClass: 'purple' },
    { id: 3, title: 'App Design Course', date: new Date(this.currentYear, this.currentMonth, 27), time: '5:00 PM', colorClass: 'green' },
    { id: 4, title: 'Strategy Design Development', date: new Date(this.currentYear, this.currentMonth, 29), time: '5:00 PM', colorClass: 'blue' }
  ];

  allEvents: any[] = [
    ...this.upcomingEvents,
    { id: 5, title: 'Design Workshop', date: new Date(this.currentYear, this.currentMonth, 1), time: '10:00 AM', colorClass: 'yellow' },
    { id: 6, title: 'Design Workshop', date: new Date(this.currentYear, this.currentMonth, 5), time: '10:00 AM', colorClass: 'green' },
    { id: 7, title: 'Design Workshop', date: new Date(this.currentYear, this.currentMonth, 9), time: '10:00 AM', colorClass: 'blue' },
    { id: 8, title: 'Design Workshop', date: new Date(this.currentYear, this.currentMonth, 10), time: '10:00 AM', colorClass: 'purple' },
    { id: 9, title: 'Design Workshop', date: new Date(this.currentYear, this.currentMonth, 18), time: '10:00 AM', colorClass: 'pink' },
    { id: 10, title: 'Design Workshop', date: new Date(this.currentYear, this.currentMonth, 18), time: '1:00 PM', colorClass: 'red' }
  ];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    this.weeks = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    // adjust first day to start on Monday
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6; // Sunday becomes 6

    const startDate = new Date(this.currentYear, this.currentMonth, 1 - startDayOfWeek);

    let currentDateInLoop = new Date(startDate);

    for (let i = 0; i < 6; i++) {
      const week: any[] = [];
      for (let j = 0; j < 7; j++) {
        const isCurrentMonth = currentDateInLoop.getMonth() === this.currentMonth;
        const isToday = this.isSameDay(currentDateInLoop, new Date());

        const dayEvents = this.allEvents.filter(event => this.isSameDay(event.date, currentDateInLoop));

        week.push({
          date: currentDateInLoop.getDate(),
          fullDate: new Date(currentDateInLoop),
          isCurrentMonth,
          isToday,
          events: dayEvents
        });

        currentDateInLoop.setDate(currentDateInLoop.getDate() + 1);
      }
      this.weeks.push(week);

      // Stop if we've rendered all days in the month and it's Sunday
      if (currentDateInLoop.getMonth() !== this.currentMonth && currentDateInLoop > lastDayOfMonth) {
        break;
      }
    }
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }
}
