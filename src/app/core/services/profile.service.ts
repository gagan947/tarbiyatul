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

  private studentsListSubject = new BehaviorSubject<any[]>([]);
  public studentsList$ = this.studentsListSubject.asObservable();

  constructor(private apiService: ApiService) { }

  fetchProfile(): Observable<any> {
    return this.apiService.get<any>('users/auth/profile').pipe(
      tap(response => {
        this.processProfileResponse(response);
      })
    );
  }

  fetchParentOverview(): Observable<any> {
    return this.apiService.get<any>('parent/overview').pipe(
      tap(response => {
        this.processProfileResponse(response);
      })
    );
  }

  private processProfileResponse(response: any): void {
    this.profileSubject.next(response);
    const students = response?.data?.students || response?.data?.children || response?.data?.linked_children || response?.students || [];
    if (students.length > 0) {
      this.setStudentsList(students);
      const current = this.selectedStudentSubject.value;
      let exists = students.some((s: any) => String(s.id) === String(current?.id));

      if (!exists) {
        const savedStudentId = localStorage.getItem('selectedStudentId');
        if (savedStudentId) {
          const savedStudent = students.find((s: any) => s.id?.toString() === savedStudentId);
          if (savedStudent) {
            this.selectedStudentSubject.next(savedStudent);
            exists = true;
          }
        }
      }

      if (!exists) {
        this.selectedStudentSubject.next(students[0]);
        if (students[0].id) {
          localStorage.setItem('selectedStudentId', students[0].id.toString());
        }
      }
    }
  }

  setStudentsList(students: any[]): void {
    if (Array.isArray(students)) {
      this.studentsListSubject.next(students);
    }
  }

  getStudentsList(): any[] {
    return this.studentsListSubject.value;
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
