import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-teacher-signup',
  templateUrl: './teacher-signup.component.html',
  styleUrls: ['./teacher-signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink]
})
export class TeacherSignupComponent implements OnInit {
  maxDate: string = new Date().toISOString().split('T')[0];
  signupForm!: FormGroup;
  currentStep = 1; // 1: Personal Info, 2: Professional Info, 3: Success
  isLoading = false;
  submitted = false;
  showPassword = false;
  errorMessage: string | null = null;

  // Duplicate email modal
  showDuplicateEmailModal = false;
  duplicateEmailAddress = '';

  // Grade levels dropdown options
  gradeLevels: string[] = [
    'Adult Learner',
    'Pre-K',
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
  ];

  countryCodes = [
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
    { name: 'Qatar', code: '+974', flag: '🇶🇦' },
    { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
    { name: 'Oman', code: '+968', flag: '🇴🇲' },
    { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Italy', code: '+39', flag: '🇮🇹' },
    { name: 'Spain', code: '+34', flag: '🇪🇸' },
    { name: 'Turkey', code: '+90', flag: '🇹🇷' },
    { name: 'Egypt', code: '+20', flag: '🇪🇬' },
    { name: 'Jordan', code: '+962', flag: '🇯🇴' },
    { name: 'Lebanon', code: '+961', flag: '🇱🇧' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬' },
    { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
    { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
    { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
    { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
    { name: 'Ireland', code: '+353', flag: '🇮🇪' },
    { name: 'Sweden', code: '+46', flag: '🇸🇪' },
    { name: 'Norway', code: '+47', flag: '🇳🇴' },
    { name: 'Denmark', code: '+45', flag: '🇩🇰' },
    { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
    { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
    { name: 'Belgium', code: '+32', flag: '🇧🇪' },
    { name: 'Austria', code: '+43', flag: '🇦🇹' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'Mexico', code: '+52', flag: '🇲🇽' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'South Korea', code: '+82', flag: '🇰🇷' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'Hong Kong', code: '+852', flag: '🇭🇰' },
    { name: 'Philippines', code: '+63', flag: '🇵🇭' }
  ];

  isCountryDropdownOpen = false;
  countrySearchQuery = '';

  toggleCountryDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
    this.countrySearchQuery = '';
  }

  selectCountryCode(code: string): void {
    this.signupForm.patchValue({ countryCode: code });
    this.isCountryDropdownOpen = false;
    this.countrySearchQuery = '';
  }

  get filteredCountryCodes() {
    const q = this.countrySearchQuery.trim().toLowerCase();
    if (!q) return this.countryCodes;
    return this.countryCodes.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isCountryDropdownOpen = false;
  }

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      role: ['teacher'],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      countryCode: ['+1'],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', [Validators.required]],
      gender: ['Male', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      // Professional details
      qualification: ['', [Validators.required]],
      experienceYears: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      specialization: ['', [Validators.required]],
      teachingGrade: ['', [Validators.required]]
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  nextStep(): void {
    this.errorMessage = null;
    this.submitted = true;

    // Validate fields for Step 1
    const personalFields = ['firstName', 'lastName', 'phone', 'email', 'dob', 'gender', 'password'];
    let step1Valid = true;

    personalFields.forEach(field => {
      const control = this.signupForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          step1Valid = false;
        }
      }
    });

    if (step1Valid) {
      this.submitted = false;
      this.currentStep = 2;
    }
  }

  prevStep(): void {
    this.errorMessage = null;
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    // Validate fields for Step 2
    const professionalFields = ['qualification', 'experienceYears', 'specialization', 'teachingGrade'];
    let step2Valid = true;

    professionalFields.forEach(field => {
      const control = this.signupForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          step2Valid = false;
        }
      }
    });

    if (!step2Valid || this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;

    const rawPhone = this.signupForm.value.phone ? `${this.signupForm.value.countryCode || '+1'} ${this.signupForm.value.phone}`.trim() : '';

    const payload = {
      role: 'teacher',
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      phone: rawPhone,
      email: this.signupForm.value.email,
      dob: this.signupForm.value.dob,
      gender: this.signupForm.value.gender,
      password: this.signupForm.value.password,
      qualification: this.signupForm.value.qualification,
      specialization: this.signupForm.value.specialization,
      experienceYears: parseInt(this.signupForm.value.experienceYears, 10) || 0,
      teachingGrade: this.signupForm.value.teachingGrade
    };

    this.apiService.post<any>('users/auth/signup', payload)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.currentStep = 3;
        },
        error: (err) => {
          this.isLoading = false;
          const rawErr = err?.error?.message || err?.message || '';

          if (
            rawErr.includes('Duplicate entry') ||
            rawErr.includes('users.email') ||
            rawErr.includes('already registered') ||
            rawErr.includes('already exists') ||
            err?.status === 409
          ) {
            this.duplicateEmailAddress = this.signupForm.value.email || '';
            this.showDuplicateEmailModal = true;
            this.errorMessage = `An account with ${this.duplicateEmailAddress} is already registered. Please sign in or use another email.`;
            this.toastService.warning('This email address is already registered.');
          } else {
            this.errorMessage = rawErr || 'Failed to submit application. Please check your information and try again.';
            this.toastService.error(this.errorMessage || 'Failed to submit application.');
          }
        }
      });
  }

  closeDuplicateModalAndEditEmail(): void {
    this.showDuplicateEmailModal = false;
    this.errorMessage = null;
    this.currentStep = 1;
  }

  closeDuplicateModal(): void {
    this.showDuplicateEmailModal = false;
  }
}
