import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-std-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './std-dashboard.component.html',
  styleUrl: './std-dashboard.component.css'
})
export class StdDashboardComponent implements OnInit {
  progressPercentage = 0;
  newAssignments: any[] = [];
  announcements: any[] = [];
  alert: any = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.get<any>('student/dashboard').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bindData(response.data);
        } else if (response.data) {
          this.bindData(response.data);
        } else {
          this.bindData(response);
        }
      },
      error: () => {
        // Fallback to legacy endpoint
        this.apiService.get<any>('dashboard/student').subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.bindData(response.data);
            }
          },
          error: (error) => {
            console.error('Error fetching student dashboard:', error);
          }
        });
      }
    });
  }

  bindData(data: any): void {
    // 1. Weekly Progress
    if (data.weekly_progress) {
      const wp = data.weekly_progress;
      this.progressPercentage = wp.scale_max ? Math.round((wp.current_score / wp.scale_max) * 100) : 0;
    }

    // 2. New Assignments
    if (data.recent_assignments) {
      this.newAssignments = data.recent_assignments.map((item: any, index: number) => ({
        id: item.assignment_id,
        title: item.book || item.subject_area,
        subject: item.subject_area,
        due: new Date(item.due_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        image: item.book_cover_url || item.assignment_attachment || item.student_attachment || item.attachment || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2hVJDy3F4XWmkk83hnAhRBH67skWqDYvstj-5y9wxlA&s=10`
      }));

      // 3. (Checklist removed as per request)
    }

    // 4. Upcoming Events (Announcements)
    const upcomingEvents = data.upcoming_events;
    if (upcomingEvents && Array.isArray(upcomingEvents)) {
      this.announcements = upcomingEvents
        .map((event: any) => ({
          title: event.title,
          body: event.description,
          teacher: 'Admin', // The API doesn't provide a teacher name for events
          date: new Date(event.createdAt || event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        }));
    }
  }
}
