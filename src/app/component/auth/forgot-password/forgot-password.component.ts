import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.apiService.post<{ success?: boolean; message?: string }>('users/auth/forgot-password', {
      email: this.forgotPasswordForm.value.email
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'A password reset link has been sent to your email.';
        
        // Redirect back to login page after some delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'An error occurred. Please try again.';
      }
    });
  }
}
