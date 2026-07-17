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
    const normalizedAvatar = profileImage.replace(/\\/g, '/');
    if (
      normalizedAvatar.startsWith('http://') ||
      normalizedAvatar.startsWith('https://') ||
      normalizedAvatar.startsWith('data:') ||
      normalizedAvatar.startsWith('blob:') ||
      normalizedAvatar.startsWith('assets/')
    ) {
      return normalizedAvatar;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const path = normalizedAvatar.startsWith('/') ? normalizedAvatar.substring(1) : normalizedAvatar;
    return `${base}${path}`;
  }
}
