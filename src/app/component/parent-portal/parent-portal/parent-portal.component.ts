import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProfileService } from '../../../core/services/profile.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from 'src/environments/environment';
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
  selector: 'app-parent-portal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-portal.component.html',
  styleUrl: './parent-portal.component.css'
})
export class ParentPortalComponent implements OnInit {
  studentName = 'Ali Khan';
  studentGrade = 'Grade 4';
  quote = '“Seeking Knowledge Is An Obligation For Every Muslim.”';

  showLogoutModal = false;
  currentUrl = '';
  selectedResource: any = null;
  isSidebarOpen = false;
  isProfileSidebarOpen = false;
  imageBaseUrl = environment.imageBaseUrl;
  profileData: any = null;
  selectedStudent: any = null;
  studentsList: any[] = [];

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
    private apiService: ApiService,
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

    // Subscribe to profile changes
    this.profileService.profile$.subscribe(data => {
      this.profileData = data;
      const students = data?.data?.students || data?.data?.children || data?.data?.linked_children || data?.students;
      if (Array.isArray(students) && students.length > 0) {
        this.studentsList = students;
      }
    });

    // Subscribe to students list changes
    this.profileService.studentsList$.subscribe(students => {
      if (Array.isArray(students) && students.length > 0) {
        this.studentsList = students;
      }
    });

    // Subscribe to selected student changes
    this.profileService.selectedStudent$.subscribe(student => {
      this.selectedStudent = student;
      if (student) {
        this.studentName = this.getStudentDisplayName(student);
        this.studentGrade = student.grade_level || student.gradeLevel || student.grade || 'N/A';
      }
    });

    // Trigger profile fetch
    this.profileService.fetchProfile().subscribe({
      next: (data) => {
        console.log('ParentPortal header profile loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load profile for header:', err);
      }
    });

    // Fetch dashboard/parent to guarantee children list & selection are available in header
    this.apiService.get<any>('dashboard/parent').subscribe({
      next: (res) => {
        const data = res?.data || res;
        const children = data?.linked_children || data?.students || [];
        if (Array.isArray(children) && children.length > 0) {
          this.studentsList = children;
          this.profileService.setStudentsList(children);
          if (!this.selectedStudent) {
            const savedId = localStorage.getItem('selectedStudentId');
            const found = (savedId && children.find((c: any) => String(c.id) === String(savedId)))
              || data?.selected_student
              || children.find((c: any) => c.isSelected)
              || children[0];
            if (found) {
              this.profileService.selectStudent(found);
            }
          }
        }
      },
      error: () => {}
    });
  }

  getStudentDisplayName(student: any): string {
    if (!student) return 'Select Child';
    return student.name || student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.firstName || 'Select Child';
  }

  getStudentImage(student: any): string {
    const img = student?.profile_image || student?.profileImage;
    if (!img) return 'assets/img/placeholder.jpg';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('assets/')) {
      return img;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const clean = img.startsWith('/') ? img.substring(1) : img;
    return `${base}${clean}`;
  }

  isStudentSelected(student: any): boolean {
    if (!student || !this.selectedStudent) return false;
    return String(student.id) === String(this.selectedStudent.id);
  }

  selectStudent(student: any): void {
    this.profileService.selectStudent(student);
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
    this.profileService.clearProfile();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfileSidebar(): void {
    this.isProfileSidebarOpen = !this.isProfileSidebarOpen;
  }
}
