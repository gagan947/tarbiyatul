import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parent-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-calendar.component.html',
  styleUrl: './parent-calendar.component.css'
})
export class ParentCalendarComponent {

}
