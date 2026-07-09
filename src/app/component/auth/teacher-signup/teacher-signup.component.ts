import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-teacher-signup',
  templateUrl: './teacher-signup.component.html',
  styleUrls: ['./teacher-signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class TeacherSignupComponent implements OnInit {
  signupForm!: FormGroup;
  currentStep = 3; // 1: Personal Info, 2: Professional Info, 3: Success
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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      role: ['teacher'],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
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

    const payload = {
      role: 'teacher',
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      phone: this.signupForm.value.phone,
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
          this.errorMessage = err.message || 'Failed to submit application. Please try again.';
        }
      });
  }
}
