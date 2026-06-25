import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-std-portal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './std-portal.component.html',
  styleUrl: './std-portal.component.css'
})
export class StdPortalComponent {
  studentName = 'Ali Khan';
  studentGrade = 'Grade 4';
  quote = '“Seeking Knowledge Is An Obligation For Every Muslim.”';
}
