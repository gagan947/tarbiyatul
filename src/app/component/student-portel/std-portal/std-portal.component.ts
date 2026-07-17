import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProfileService } from '../../../core/services/profile.service';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../core/services/socket.service';

interface TeacherThread {
  name: string;
  subject: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unreadCount: number;
  online: boolean;
}

@Component({
  selector: 'app-std-portal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './std-portal.component.html',
  styleUrl: './std-portal.component.css'
})
export class StdPortalComponent implements OnInit {
  profile$ = this.profileService.profile$;
  quote = '“Seeking Knowledge Is An Obligation For Every Muslim.”';

  showLogoutModal = false;
  currentUrl = '';
  selectedResource: any = null;
  isSidebarOpen = false;
  isProfileSidebarOpen = false;

  // Mock list of teachers matching Messages tab details
  teacherThreads: TeacherThread[] = [
    {
      name: 'Ustadh Hamza',
      subject: 'Islamic Studies',
      lastMessage: 'Please complete page 20 and...',
      time: '10:30 AM',
      avatar: 'assets/img/client_1.png',
      unreadCount: 2,
      online: true
    },
    {
      name: 'Ms. Fatima',
      subject: 'Mathematics',
      lastMessage: 'Great work on fractions!',
      time: '9:15 AM',
      avatar: 'assets/img/client_2.png',
      unreadCount: 1,
      online: true
    },
    {
      name: 'Mr. Ahmed',
      subject: 'Science',
      lastMessage: 'Don\'t forget to submit your...',
      time: 'Yesterday',
      avatar: 'assets/img/client_3.png',
      unreadCount: 1,
      online: false
    },
    {
      name: 'Ms. Sarah',
      subject: 'English',
      lastMessage: 'Check the reading comprehension...',
      time: 'Yesterday',
      avatar: 'assets/img/client_2.png',
      unreadCount: 0,
      online: false
    },
    {
      name: 'School Support',
      subject: 'Support',
      lastMessage: 'How can we help you?',
      time: '2 days ago',
      avatar: 'assets/img/client_1.png',
      unreadCount: 0,
      online: false
    }
  ];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private socketService: SocketService
  ) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    // Monitor router navigation to adapt UI panels dynamically
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
      });

    // Trigger profile fetch
    this.profileService.fetchProfile().subscribe({
      next: (data) => {
        console.log('StudentPortal profile loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load student profile:', err);
      }
    });
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
    const base = environment.imageBaseUrl.endsWith('/') ? environment.imageBaseUrl : `${environment.imageBaseUrl}/`;
    const path = normalizedAvatar.startsWith('/') ? normalizedAvatar.substring(1) : normalizedAvatar;
    return `${base}${path}`;
  }

  onSubComponentActivated(componentRef: any): void {
    // Check if the loaded component emits selected resources
    if (componentRef.resourceSelected) {
      componentRef.resourceSelected.subscribe((resource: any) => {
        this.selectedResource = resource;
      });
    }
  }

  triggerLogoutPrompt(event: Event): void {
    event.preventDefault();
    this.showLogoutModal = true;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.socketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isPasswordGenerated');
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfileSidebar(): void {
    this.isProfileSidebarOpen = !this.isProfileSidebarOpen;
  }
}
