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
  selectedRole: 'teacher' | 'parent' = 'teacher';

  constructor(private router: Router) { }

  ngOnInit(): void { }

  selectRole(role: 'teacher' | 'parent'): void {
    this.selectedRole = role;
  }

  onContinue(): void {
    if (this.selectedRole === 'teacher') {
      this.router.navigate(['/teacher-signup']);
    } else {
      this.router.navigate(['/signup']);
    }
  }
}
