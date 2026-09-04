import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-choose-role',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './choose-role.component.html',
  styleUrl: './choose-role.component.css'
})
export class ChooseRoleComponent implements OnInit {
  selectedRole: 'parent' | 'teacher' | 'tutoring' = 'parent';

  constructor(private router: Router) { }

  ngOnInit(): void { }

  selectRole(role: 'parent' | 'teacher' | 'tutoring'): void {
    this.selectedRole = role;
  }

  onContinue(): void {
    if (this.selectedRole === 'teacher') {
      this.router.navigate(['/signup-teacher']);
    } else if (this.selectedRole === 'tutoring') {
      this.router.navigate(['/signup'], { queryParams: { role: 'tutoring' } });
    } else {
      this.router.navigate(['/signup'], { queryParams: { role: 'parent' } });
    }
  }
}
