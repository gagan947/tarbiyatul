import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const studentPasswordGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isPasswordGenerated = localStorage.getItem('isPasswordGenerated');

  // If not logged in or not a student, allow navigation (standard auth guard can handle general login checks)
  if (!token || role !== 'student') {
    return true;
  }

  // If password is not generated (i.e. isPasswordGenerated is explicitly 'false'), redirect to create-password
  if (isPasswordGenerated === 'false') {
    router.navigate(['/create-password']);
    return false;
  }

  return true;
};

export const createPasswordGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isPasswordGenerated = localStorage.getItem('isPasswordGenerated');

  // Must be logged in as student to access create-password
  if (!token || role !== 'student') {
    router.navigate(['/login']);
    return false;
  }

  // If password is already created, redirect to student dashboard
  if (isPasswordGenerated !== 'false') {
    router.navigate(['/student']);
    return false;
  }

  return true;
};
