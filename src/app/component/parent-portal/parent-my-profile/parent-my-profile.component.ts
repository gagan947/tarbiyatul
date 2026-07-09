import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-parent-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-my-profile.component.html',
  styleUrl: './parent-my-profile.component.css'
})
export class ParentMyProfileComponent implements OnInit {
  profileData: any = null;
  isLoading = false;
  errorMessage: string | null = null;
  imageBaseUrl = environment.imageBaseUrl
  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.profileService.profile$.subscribe({
      next: (data) => {
        this.profileData = data;
        if (data) {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to load profile data.';
      }
    });

    if (!this.profileService.getProfileData()) {
      this.profileService.fetchProfile().subscribe({
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to fetch profile.';
        }
      });
    }
  }

  getChildren(): any[] {
    return this.profileData?.data?.students || [];
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = date.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  }
}
