import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-parent-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './parent-my-profile.component.html',
  styleUrl: './parent-my-profile.component.css'
})
export class ParentMyProfileComponent implements OnInit {
  maxDate: string = new Date().toISOString().split('T')[0];
  profileData: any = null;
  isLoading = false;
  errorMessage: string | null = null;
  imageBaseUrl = environment.imageBaseUrl;

  // Modal State
  showChildModal = false;
  isEditMode = false;
  editingChildId: string | number | null = null;
  childForm!: FormGroup;
  modalErrorMessage: string | null = null;
  isModalLoading = false;
  submitted = false;

  gradeLevels: string[] = [
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade'
  ];

  academies: string[] = [
    'Global Academy',
    'Religious Academy'
  ];
  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;

    // Configure child modal reactive form group
    this.childForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gradeLevel: ['', [Validators.required]],
      academy: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });

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

  get f() {
    return this.childForm.controls;
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

  openAddChildModal(): void {
    this.isEditMode = false;
    this.editingChildId = null;
    this.modalErrorMessage = null;
    this.submitted = false;
    this.childForm.reset({
      firstName: '',
      lastName: '',
      dob: '',
      gradeLevel: '',
      academy: '',
      email: ''
    });
    this.showChildModal = true;
  }

  openEditChildModal(child: any): void {
    this.isEditMode = true;
    this.submitted = false;
    this.editingChildId = child.id;
    this.modalErrorMessage = null;

    // Format date string to YYYY-MM-DD for date input element
    let formattedDob = '';
    if (child.dob || child.dateOfBirth) {
      const d = new Date(child.dob || child.dateOfBirth);
      if (!isNaN(d.getTime())) {
        formattedDob = d.toISOString().split('T')[0];
      }
    }

    this.childForm.setValue({
      firstName: child.firstName || '',
      lastName: child.lastName || '',
      dob: formattedDob,
      gradeLevel: child.gradeLevel || child.grade || '',
      academy: child.academy || '',
      email: child.email || ''
    });
    this.showChildModal = true;
  }

  closeChildModal(): void {
    this.showChildModal = false;
    this.modalErrorMessage = null;
  }

  onSaveChild(): void {
    debugger
    this.submitted = true;
    if (this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      return;
    }

    this.isModalLoading = true;
    this.modalErrorMessage = null;

    const val = this.childForm.value;
    const formData = new FormData();
    formData.append('firstName', val.firstName);
    formData.append('lastName', val.lastName);
    formData.append('dob', val.dob);
    formData.append('gradeLevel', val.gradeLevel);
    formData.append('academy', val.academy);
    formData.append('email', val.email);

    if (this.isEditMode && this.editingChildId) {
      this.apiService.patch<any>(`users/auth/students/${this.editingChildId}`, formData)
        .subscribe({
          next: () => {
            this.isModalLoading = false;
            this.showChildModal = false;
            this.profileService.fetchProfile().subscribe();
          },
          error: (err) => {
            this.isModalLoading = false;
            this.modalErrorMessage = err.message || 'Failed to update child details. Please try again.';
          }
        });
    } else {
      this.apiService.post<any>('users/auth/students', formData)
        .subscribe({
          next: () => {
            this.isModalLoading = false;
            this.showChildModal = false;
            this.profileService.fetchProfile().subscribe();
          },
          error: (err) => {
            this.isModalLoading = false;
            this.modalErrorMessage = err.message || 'Failed to add child. Please try again.';
          }
        });
    }
  }
}
