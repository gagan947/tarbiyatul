import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-std-my-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './std-my-profile.component.html',
  styleUrl: './std-my-profile.component.css'
})
export class StdMyProfileComponent implements OnInit {
  profile$ = this.profileService.profile$;
  imageBaseUrl = environment.imageBaseUrl;

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.profileService.fetchProfile().subscribe();
  }

  getAvatarUrl(profileImage: string | null | undefined): string {
    if (!profileImage) {
      return 'assets/img/placeholder.jpg';
    }
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://') || profileImage.startsWith('data:')) {
      return profileImage;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const path = profileImage.startsWith('/') ? profileImage.substring(1) : profileImage;
    return `${base}${path}`;
  }
}
