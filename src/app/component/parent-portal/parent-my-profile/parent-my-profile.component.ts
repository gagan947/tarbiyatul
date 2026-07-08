import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.isLoading = true;
    this.apiService.get<any>('users/auth/profile').subscribe({
      next: (response) => {
        this.isLoading = false;
        this.profileData = response;
        console.log('Parent Profile API Response:', response);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to load profile data.';
        console.error('Error fetching parent profile:', err);
      }
    });
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
