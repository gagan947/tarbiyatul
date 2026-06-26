import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parent-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-my-profile.component.html',
  styleUrl: './parent-my-profile.component.css'
})
export class ParentMyProfileComponent {

}
