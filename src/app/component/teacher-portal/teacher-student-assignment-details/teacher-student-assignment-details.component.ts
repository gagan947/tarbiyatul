import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-teacher-student-assignment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-student-assignment-details.component.html',
  styleUrl: './teacher-student-assignment-details.component.css'
})
export class TeacherStudentAssignmentDetailsComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
