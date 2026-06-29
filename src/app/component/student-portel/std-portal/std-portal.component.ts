import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
  studentName = 'Ali Khan';
  studentGrade = 'Grade 4';
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

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    // Monitor router navigation to adapt UI panels dynamically
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
      });
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
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfileSidebar(): void {
    this.isProfileSidebarOpen = !this.isProfileSidebarOpen;
  }
}
