import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-parent-change-password',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './parent-change-password.component.html',
  styleUrl: './parent-change-password.component.css'
})
export class ParentChangePasswordComponent {

}
