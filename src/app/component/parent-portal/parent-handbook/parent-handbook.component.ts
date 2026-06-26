import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parent-handbook',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-handbook.component.html',
  styleUrl: './parent-handbook.component.css'
})
export class ParentHandbookComponent {

}
