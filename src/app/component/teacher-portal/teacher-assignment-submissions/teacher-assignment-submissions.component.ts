import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

interface Submission {
  id: number;
  rollNo: string;
  avatar: string;
  name: string;
  status: 'REVIEWED' | 'COMPLETED' | 'PENDING';
  score: string;
}

@Component({
  selector: 'app-teacher-assignment-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-assignment-submissions.component.html',
  styleUrl: './teacher-assignment-submissions.component.css'
})
export class TeacherAssignmentSubmissionsComponent {
  assignmentId: string | null = null;
  
  submissions: Submission[] = [
    { id: 1, rollNo: 'STU-1001', avatar: 'assets/img/boy.jpg', name: 'Ali Khan', status: 'REVIEWED', score: '95/100' },
    { id: 2, rollNo: 'STU-1001', avatar: 'assets/img/boy.jpg', name: 'Ali Khan', status: 'COMPLETED', score: '--' },
    { id: 3, rollNo: 'STU-1001', avatar: 'assets/img/boy.jpg', name: 'Ali Khan', status: 'PENDING', score: '--' },
    { id: 4, rollNo: 'STU-1001', avatar: 'assets/img/boy.jpg', name: 'Ali Khan', status: 'REVIEWED', score: '95/100' },
    { id: 5, rollNo: 'STU-1001', avatar: 'assets/img/boy.jpg', name: 'Ali Khan', status: 'REVIEWED', score: '95/100' }
  ];

  constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
    this.assignmentId = this.route.snapshot.paramMap.get('id');
  }

  goBack(): void {
    this.location.back();
  }

  viewDetails(studentId: number): void {
    if (this.assignmentId) {
      this.router.navigate(['/teacher/assignments', this.assignmentId, 'submissions', studentId]);
    }
  }
}
