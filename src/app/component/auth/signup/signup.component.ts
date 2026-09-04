import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { SignupRequest, SignupResponse } from '../../../core/models/signup.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink]
})
export class SignupComponent implements OnInit {
  maxDate: string = new Date().toISOString().split('T')[0];
  signupForm!: FormGroup;
  currentStep = 1;
  isLoading = false;
  submitted = false;
  showPassword = false;
  errorMessage: string | null = null;

  // Duplicate email modal
  showDuplicateEmailModal = false;
  duplicateEmailAddress = '';

  // Whether tutoring role is selected
  isTutoringRole = false;

  gradeLevels: string[] = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade'];
  academies: string[] = ['Global Academy', 'Religious Academy'];

  tutoringSubjects: string[] = [
    'Quran Recitation & Tajweed',
    'Arabic Language Mastery',
    'Islamic Studies',
    'Math 1-on-1 Focus',
    'English Comprehension',
    'Science Tutoring',
    'General Studies'
  ];

  tutoringAcademies: string[] = [
    'Adult Learning & Tutoring',
    'Global Academy',
    'Religious Academy'
  ];

  tutoringGradeLevels: string[] = [
    'Adult Learner',
    'Pre-K',
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade'
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
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      role: ['parent'],
      // Parent fields
      firstName: [''],
      lastName: [''],
      countryCode: ['+1'],
      phone: [''],
      email: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],

      students: this.fb.array([this.createStudentGroup()]),

      // Tutoring-specific fields
      learnerFirstName: [''],
      learnerLastName: [''],
      learnerEmail: [''],
      subject: ['Quran Recitation & Tajweed'],
      academy: ['Adult Learning & Tutoring'],
      gradeLevel: ['Adult Learner'],

      agreeToTerms: [false, [Validators.requiredTrue]]
    });

    this.route.queryParams.subscribe(params => {
      const role = params['role'] || 'parent';
      this.signupForm.patchValue({ role });
      this.configureRole(role);
    });
  }

  private configureRole(role: string): void {
    this.isTutoringRole = role === 'tutoring';

    const parentControls = [
      this.signupForm.get('firstName'),
      this.signupForm.get('lastName'),
      this.signupForm.get('phone'),
      this.signupForm.get('email')
    ];

    const tutoringControls = [
      this.signupForm.get('learnerFirstName'),
      this.signupForm.get('learnerLastName'),
      this.signupForm.get('learnerEmail'),
      this.signupForm.get('subject'),
      this.signupForm.get('academy'),
      this.signupForm.get('gradeLevel')
    ];

    if (this.isTutoringRole) {
      // Disable parent students array and clear parent validators
      this.students.disable({ emitEvent: false });
      parentControls.forEach(control => control?.clearValidators());

      // Set tutoring validators
      this.signupForm.get('learnerFirstName')?.setValidators([Validators.required]);
      this.signupForm.get('learnerLastName')?.setValidators([Validators.required]);
      this.signupForm.get('learnerEmail')?.setValidators([Validators.required, Validators.email]);
      this.signupForm.get('subject')?.setValidators([Validators.required]);
      this.signupForm.get('academy')?.setValidators([Validators.required]);
      this.signupForm.get('gradeLevel')?.setValidators([Validators.required]);

      // Set default values if not already present
      if (!this.signupForm.get('subject')?.value) {
        this.signupForm.patchValue({ subject: 'Quran Recitation & Tajweed' }, { emitEvent: false });
      }
      if (!this.signupForm.get('academy')?.value) {
        this.signupForm.patchValue({ academy: 'Adult Learning & Tutoring' }, { emitEvent: false });
      }
      if (!this.signupForm.get('gradeLevel')?.value) {
        this.signupForm.patchValue({ gradeLevel: 'Adult Learner' }, { emitEvent: false });
      }
    } else {
      // Enable parent students array and set parent validators
      this.students.enable({ emitEvent: false });
      this.signupForm.get('firstName')?.setValidators([Validators.required]);
      this.signupForm.get('lastName')?.setValidators([Validators.required]);
      this.signupForm.get('phone')?.setValidators([Validators.required]);
      this.signupForm.get('email')?.setValidators([Validators.required, Validators.email]);

      // Clear tutoring validators
      tutoringControls.forEach(control => control?.clearValidators());
    }

    // Always keep password validator
    this.signupForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);

    parentControls.forEach(control => control?.updateValueAndValidity({ emitEvent: false }));
    tutoringControls.forEach(control => control?.updateValueAndValidity({ emitEvent: false }));
    this.signupForm.get('password')?.updateValueAndValidity({ emitEvent: false });
  }

  get students(): FormArray {
    return this.signupForm.get('students') as FormArray;
  }

  createStudentGroup(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gradeLevel: ['1st Grade', [Validators.required]],
      academy: ['Global Academy', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  addStudent(): void {
    this.students.push(this.createStudentGroup());
  }

  removeStudent(index: number): void {
    if (this.students.length > 1) {
      this.students.removeAt(index);
    }
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

    if (this.currentStep === 1) {
      const controlsToValidate = this.isTutoringRole
        ? ['learnerFirstName', 'learnerLastName', 'learnerEmail', 'password']
        : ['firstName', 'lastName', 'phone', 'email', 'password'];

      let isStep1Valid = true;
      controlsToValidate.forEach(controlName => {
        const control = this.signupForm.get(controlName);
        if (control) {
          control.markAsTouched();
          if (control.invalid) isStep1Valid = false;
        }
      });
      if (!isStep1Valid) return;
      this.submitted = false;
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      if (this.isTutoringRole) {
        const tutoringControls = ['subject', 'academy', 'gradeLevel'];
        let isValid = true;
        tutoringControls.forEach(name => {
          const ctrl = this.signupForm.get(name);
          ctrl?.markAsTouched();
          if (ctrl?.invalid) isValid = false;
        });
        if (!isValid) return;
      } else {
        this.students.controls.forEach(group => group.markAllAsTouched());
        if (this.students.invalid) return;
      }
      this.submitted = false;
      this.currentStep = 3;
    }
  }

  prevStep(): void {
    this.errorMessage = null;
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number): void {
    this.errorMessage = null;
    if (step >= 1 && step <= 3) this.currentStep = step;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    if (this.signupForm.invalid) return;

    this.isLoading = true;

    let signupData: SignupRequest;

    if (this.isTutoringRole) {
      // Tutoring payload matching POST /api/users/auth/signup specification
      signupData = {
        role: 'tutoring',
        learnerFirstName: this.signupForm.value.learnerFirstName,
        learnerLastName: this.signupForm.value.learnerLastName,
        learnerEmail: this.signupForm.value.learnerEmail,
        password: this.signupForm.value.password,
        subject: this.signupForm.value.subject,
        academy: this.signupForm.value.academy,
        gradeLevel: this.signupForm.value.gradeLevel
      };
    } else {
      // Standard parent payload
      const rawPhone = this.signupForm.value.phone ? `${this.signupForm.value.countryCode || '+1'} ${this.signupForm.value.phone}`.trim() : '';
      signupData = {
        role: this.signupForm.value.role || 'parent',
        firstName: this.signupForm.value.firstName || '',
        lastName: this.signupForm.value.lastName || '',
        phone: rawPhone,
        email: this.signupForm.value.email || '',
        password: this.signupForm.value.password || '',
        students: this.signupForm.value.students || []
      };
    }

    this.apiService.post<SignupResponse>('users/auth/signup', signupData)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.currentStep = 4;
        },
        error: (err: any) => {
          this.isLoading = false;
          const rawErr = err?.error?.message || err?.message || '';

          // Check if email is already registered
          if (
            rawErr.includes('Duplicate entry') ||
            rawErr.includes('users.email') ||
            rawErr.includes('already registered') ||
            rawErr.includes('already exists') ||
            err?.status === 409
          ) {
            this.duplicateEmailAddress = this.isTutoringRole
              ? (this.signupForm.value.learnerEmail || '')
              : (this.signupForm.value.email || '');
            this.showDuplicateEmailModal = true;
            this.errorMessage = `An account with ${this.duplicateEmailAddress} is already registered. Please sign in or use a different email.`;
            this.toastService.warning('This email address is already registered.');
          } else {
            this.errorMessage = rawErr || 'Signup failed. Please check your information and try again.';
            this.toastService.error(this.errorMessage || 'Signup failed.');
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
