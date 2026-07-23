import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-parent-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-calendar.component.html',
  styleUrl: './parent-calendar.component.css'
})
export class ParentCalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();

  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  weeks: any[][] = [];
  upcomingEvents: any[] = [];
  allEvents: any[] = [];
  selectedEvent: any = null;

  private colorPalette: string[] = ['orange', 'purple', 'green', 'blue', 'yellow', 'pink', 'red'];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.generateCalendar();
    this.getParentEvents();
  }

  openEventDetails(event: any) {
    this.selectedEvent = event;
  }

  closeEventDetails() {
    this.selectedEvent = null;
  }

  getParentEvents() {
    this.apiService.get<{ success: boolean; data: any[] }>('events/parent').subscribe({
      next: (response) => {
        console.log('Parent Events Data:', response);
        if (response && response.success && Array.isArray(response.data)) {
          this.mapEvents(response.data);
          this.generateCalendar();
        }
      },
      error: (error) => {
        console.error('Error fetching parent events:', error);
      }
    });
  }

  mapEvents(apiEvents: any[]) {
    this.allEvents = apiEvents.map((event, index) => {
      const dateObj = event.eventDate ? new Date(event.eventDate) : new Date();
      const colorClass = this.colorPalette[index % this.colorPalette.length];
      const formattedTime = this.formatTime(event.eventTime);

      return {
        ...event,
        id: event.id,
        title: event.title,
        description: event.description,
        date: dateObj,
        time: formattedTime,
        colorClass: colorClass
      };
    });

    // Upcoming events: future or today's events, sorted chronologically
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingEvents = this.allEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);
  }

  formatTime(timeStr?: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
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
