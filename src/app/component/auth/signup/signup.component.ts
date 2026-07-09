import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SignupRequest, SignupResponse } from '../../../core/models/signup.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  currentStep = 1; // 1: Parent Info, 2: Student Info, 3: Review, 4: Success
  isLoading = false;
  submitted = false;
  showPassword = false;
  errorMessage: string | null = null;

  // Grade levels dropdown options
  gradeLevels: string[] = [
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      role: ['parent'],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      students: this.fb.array([this.createStudentGroup()]),

      // Terms checkbox
      agreeToTerms: [false, [Validators.requiredTrue]]
    });

    // Check query parameters to set initial role selection
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.signupForm.patchValue({ role: params['role'] });
      }
    });
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
      const parentControls = ['firstName', 'lastName', 'phone', 'email', 'password'];
      let isStep1Valid = true;
      parentControls.forEach(controlName => {
        const control = this.signupForm.get(controlName);
        if (control) {
          control.markAsTouched();
          if (control.invalid) {
            isStep1Valid = false;
          }
        }
      });
      if (!isStep1Valid) return;
      this.submitted = false;
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      this.students.controls.forEach(group => {
        group.markAllAsTouched();
      });
      if (this.students.invalid) return;
      this.submitted = false;
      this.currentStep = 3;
    }
  }

  prevStep(): void {
    this.errorMessage = null;
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    this.errorMessage = null;
    if (step >= 1 && step <= 3) {
      this.currentStep = step;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    debugger
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;

    const signupData: SignupRequest = {
      role: this.signupForm.value.role || 'parent',
      firstName: this.signupForm.value.firstName || '',
      lastName: this.signupForm.value.lastName || '',
      phone: this.signupForm.value.phone || '',
      email: this.signupForm.value.email || '',
      password: this.signupForm.value.password || '',
      students: this.signupForm.value.students || []
    };

    this.apiService.post<SignupResponse>('users/auth/signup', signupData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.currentStep = 4; // Advance to success step
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Signup failed. Please try again.';
        }
      });
  }
}
