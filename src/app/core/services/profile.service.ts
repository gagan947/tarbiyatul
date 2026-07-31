import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileSubject = new BehaviorSubject<any>(null);
  public profile$ = this.profileSubject.asObservable();

  private selectedStudentSubject = new BehaviorSubject<any>(null);
  public selectedStudent$ = this.selectedStudentSubject.asObservable();

  constructor(private apiService: ApiService) { }

  fetchProfile(): Observable<any> {
    return this.apiService.get<any>('users/auth/profile').pipe(
      tap(response => {
        this.profileSubject.next(response);
        const students = response?.data?.students || [];
        if (students.length > 0) {
          // Keep current selection if valid, otherwise check localStorage, otherwise default to first student
          const current = this.selectedStudentSubject.value;
          let exists = students.some((s: any) => s.id === current?.id);
          
          if (!exists) {
            const savedStudentId = localStorage.getItem('selectedStudentId');
            if (savedStudentId) {
              const savedStudent = students.find((s: any) => s.id.toString() === savedStudentId);
              if (savedStudent) {
                this.selectedStudentSubject.next(savedStudent);
                exists = true;
              }
            }
          }

          if (!exists) {
            this.selectedStudentSubject.next(students[0]);
            localStorage.setItem('selectedStudentId', students[0].id.toString());
          }
        }
      })
    );
  }

  getProfileData(): any {
    return this.profileSubject.value;
  }

  getSelectedStudent(): any {
    return this.selectedStudentSubject.value;
  }

  selectStudent(student: any): void {
    this.selectedStudentSubject.next(student);
    if (student && student.id) {
      localStorage.setItem('selectedStudentId', student.id.toString());
    } else {
      localStorage.removeItem('selectedStudentId');
    }
  }

  setProfile(profile: any): void {
    this.profileSubject.next(profile);
  }

  clearProfile(): void {
    this.profileSubject.next(null);
    this.selectedStudentSubject.next(null);
    localStorage.removeItem('selectedStudentId');
  }
}
