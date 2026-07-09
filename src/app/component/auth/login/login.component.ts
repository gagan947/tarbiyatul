import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { LoginRequest, LoginResponse } from '../../../core/models/login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const loginData: LoginRequest = this.loginForm.value;

    this.apiService.post<LoginResponse>('users/auth/login', loginData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Login successful! Redirecting...';

          const token = response.data?.token || response.token;
          const role = response.data?.role || response.user?.role;
          const isPasswordGenerated = response.data?.isPasswordGenerated;

          if (token) {
            localStorage.setItem('token', token);
          }
          if (role) {
            localStorage.setItem('role', role);
          }
          if (role === 'student') {
            localStorage.setItem('isPasswordGenerated', String(isPasswordGenerated ?? true));
          }

          // Redirect based on user role
          if (role === 'parent') {
            this.router.navigate(['/parent']);
          } else if (role === 'teacher') {
            this.router.navigate(['/teacher']);
          } else if (role === 'student') {
            if (isPasswordGenerated === false) {
              this.router.navigate(['/create-password']);
            } else {
              this.router.navigate(['/student']);
            }
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Login failed. Please check your credentials.';
        }
      });
  }
}
