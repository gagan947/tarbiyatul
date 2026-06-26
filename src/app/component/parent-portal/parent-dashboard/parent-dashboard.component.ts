import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrl: './parent-dashboard.component.css'
})
export class ParentDashboardComponent {

}
