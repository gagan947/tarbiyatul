import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreatePasswordComponent implements OnInit {
  createPasswordForm!: FormGroup;
  isLoading = false;
  showNewPassword = false;
  showConfirmPassword = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get f() {
    return this.createPasswordForm.controls;
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.createPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const password = this.createPasswordForm.value.password;

    // Call API to change the password
    this.apiService.patch<any>('users/auth/students/create-password', { password })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Password created successfully! Redirecting to dashboard...';

          // Update auth state in localStorage
          localStorage.setItem('isPasswordGenerated', 'true');

          // Save new token if returned
          const token = response?.data?.token || response?.token;
          if (token) {
            localStorage.setItem('token', token);
          }

          this.router.navigate(['/student']);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to create password. Please try again.';
        }
      });
  }
}
