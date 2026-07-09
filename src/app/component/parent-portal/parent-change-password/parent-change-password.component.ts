import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-parent-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './parent-change-password.component.html',
  styleUrl: './parent-change-password.component.css'
})
export class ParentChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isLoading = false;
  submitted = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.changePasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const payload = {
      oldPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword
    };

    this.apiService.patch<any>('users/auth/change-password', payload)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Password changed successfully!';
          this.changePasswordForm.reset();
          this.submitted = false;
          setTimeout(() => {
            this.router.navigate(['/parent/my-profile']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to change password. Please try again.';
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/parent/my-profile']);
  }
}
