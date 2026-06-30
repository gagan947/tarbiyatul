import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-teacher-create-assignment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-create-assignment.component.html',
  styleUrl: './teacher-create-assignment.component.css'
})
export class TeacherCreateAssignmentComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
