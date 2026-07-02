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
  currentStep = 1; // 1: Personal Info, 2: Professional Info, 3: Success
  isLoading = false;
  submitted = false;
  showPassword = false;
  errorMessage: string | null = null;

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
      experience: ['', [Validators.required]],
      applyingGrade: ['', [Validators.required]]
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  nextStep(): void {
    this.currentStep = 2;
    return
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
    this.router.navigate(['/teacher']);
    return
    this.submitted = true;
    this.errorMessage = null;

    // Validate fields for Step 2
    const professionalFields = ['qualification', 'experience', 'applyingGrade'];
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

    // Set step to 3 (Success Screen)
    this.currentStep = 3;
  }
}
