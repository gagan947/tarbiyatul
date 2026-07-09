import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-std-my-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './std-my-profile.component.html',
  styleUrl: './std-my-profile.component.css'
})
export class StdMyProfileComponent implements OnInit {
  profile$ = this.profileService.profile$;

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.profileService.fetchProfile().subscribe();
  }
}
