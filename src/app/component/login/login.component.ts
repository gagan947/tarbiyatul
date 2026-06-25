import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LoginRequest, LoginResponse } from '../../core/models/login.model';
import { HeaderComponent } from "src/app/shared components/header/header.component";
import { FooterComponent } from "src/app/shared components/footer/footer.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent]
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

  // Easy getter for form controls in the template
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

          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          // Mock redirect to home page after success
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Login failed. Please check your credentials.';
        }
      });
  }
}
