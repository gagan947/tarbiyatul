import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  CreateAssignmentPayload,
  UpdateAssignmentStatusPayload,
  AssignmentResponse,
  TeacherAssignmentQueryParams,
  TeacherAssignmentListResponse,
  AssignmentDetailResponse,
  StudentAssignmentListResponse
} from '../models/assignment.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  constructor(private apiService: ApiService) { }

  /**
   * Fetches assignments created by/assigned to the teacher with optional query parameters.
   * @param queryParams Filter, search, and pagination parameters
   */
  getTeacherAssignments(queryParams?: TeacherAssignmentQueryParams): Observable<TeacherAssignmentListResponse> {
    let params = new HttpParams();

    if (queryParams) {
      if (queryParams.search && queryParams.search.trim()) {
        params = params.set('search', queryParams.search.trim());
      }
      if (queryParams.grade_level && queryParams.grade_level.trim()) {
        params = params.set('grade_level', queryParams.grade_level.trim());
      }
      if (queryParams.page !== undefined && queryParams.page !== null && queryParams.page > 0) {
        params = params.set('page', String(queryParams.page));
      }
      if (queryParams.limit !== undefined && queryParams.limit !== null && queryParams.limit > 0) {
        params = params.set('limit', String(queryParams.limit));
      }
    }

    return this.apiService.get<TeacherAssignmentListResponse>('assignments/teacher', { params });
  }

  /**
   * Fetches assignments dedicated for Tutoring / Adult learners (GET /api/assignments/tutoring)
   */
  getTutoringAssignments(): Observable<any> {
    return this.apiService.get<any>('assignments/tutoring');
  }

  /**
   * Fetches assignments assigned to the current student with optional status query filter.
   * @param status Optional status filter (e.g. 'in progress', 'completed', 'overdue')
   */
  getStudentAssignments(status?: string): Observable<StudentAssignmentListResponse> {
    let params = new HttpParams();
    if (status && status.trim() && status.toLowerCase() !== 'all') {
      let formattedStatus = status.trim().toLowerCase();
      if (formattedStatus === 'pending') {
        formattedStatus = 'in progress';
      }
      params = params.set('status', formattedStatus);
    }
    return this.apiService.get<StudentAssignmentListResponse>('assignments/student', { params });
  }

  /**
   * Fetches assignments for parent portal by student ID and optional status filter.
   * @param studentId Selected student ID
   * @param status Optional status filter ('overdue', 'in progress', 'completed', etc.)
   */
  getParentAssignments(studentId: number | string, status?: string): Observable<any> {
    let params = new HttpParams().set('studentId', String(studentId));

    if (status && status.trim() && status.toLowerCase() !== 'all') {
      let formattedStatus = status.trim().toLowerCase();
      // if (formattedStatus === 'not started' || formattedStatus === 'pending') {
      //   formattedStatus = 'in progress';
      // }
      params = params.set('status', formattedStatus);
    }

    return this.apiService.get<any>('assignments/parent', { params });
  }

  /**
   * Fetches full details of a specific assignment by ID.
   * @param id Assignment ID
   */
  getAssignmentById(id: string | number): Observable<AssignmentDetailResponse> {
    return this.apiService.get<AssignmentDetailResponse>(`assignments/${id}`);
  }

  /**
   * Updates student assignment status (PATCH /api/assignments/:id/status).
   * @param id Assignment ID
   * @param payload Status payload { status: 'continue reading' | 'mark as completed' }
   */
  updateAssignmentStatus(id: string | number, payload: UpdateAssignmentStatusPayload): Observable<AssignmentResponse> {
    return this.apiService.patch<AssignmentResponse>(`assignments/${id}/status`, payload);
  }

  /**
   * Submits a student assignment (POST /api/student/assignments/:id/submit).
   * @param id Assignment ID
   * @param payload { studentNotes, attachmentUrl }
   */
  submitStudentAssignment(id: string | number, payload: { studentNotes?: string; attachmentUrl?: string }): Observable<any> {
    return this.apiService.post<any>(`student/assignments/${id}/submit`, payload);
  }

  /**
   * Grades a student submission (PATCH /api/teacher/submissions/:id/grade).
   * @param submissionId Submission ID
   * @param payload { score, feedback }
   */
  gradeStudentSubmission(submissionId: string | number, payload: { score: string; feedback?: string }): Observable<any> {
    return this.apiService.patch<any>(`teacher/submissions/${submissionId}/grade`, payload);
  }

  /**
   * Fetches all student submissions for an assignment (GET /api/assignments/:id/submissions).
   * @param assignmentId Assignment ID
   */
  getAssignmentSubmissions(assignmentId: string | number): Observable<any> {
    return this.apiService.get<any>(`assignments/${assignmentId}/submissions`);
  }

  /**
   * Fetches single student assignment details (GET /api/assignments/:id?student_id=:studentId).
   * @param assignmentId Assignment ID
   * @param studentId Student ID
   */
  getStudentAssignmentDetail(assignmentId: string | number, studentId: string | number): Observable<any> {
    return this.apiService.get<any>(`assignments/${assignmentId}?student_id=${studentId}`);
  }

  /**
   * Saves grade and feedback for a student assignment (POST /api/assignments/:id/grade).
   * @param assignmentId Assignment ID
   * @param payload { student_id, marks_obtained, grade, feedback }
   */
  gradeAssignment(assignmentId: string | number, payload: { student_id: string | number; marks_obtained: number; grade?: string; feedback?: string }): Observable<any> {
    return this.apiService.post<any>(`assignments/${assignmentId}/grade`, payload);
  }

  /**
   * Creates a new assignment (POST /api/teacher/assignments or /api/assignments).
   * @param payload Assignment data fields
   * @param attachment Optional file attachment
   */
  createAssignment(payload: CreateAssignmentPayload, attachment?: File | null): Observable<AssignmentResponse> {
    const formData = this.buildAssignmentFormData(payload, attachment);
    return this.apiService.post<AssignmentResponse>('assignments', formData).pipe();
  }

  /**
   * Updates an existing assignment using FormData (multipart/form-data).
   * @param id Assignment ID
   * @param payload Assignment data fields
   * @param attachment Optional new file attachment
   */
  updateAssignment(id: string | number, payload: CreateAssignmentPayload, attachment?: File | null): Observable<AssignmentResponse> {
    const formData = this.buildAssignmentFormData(payload, attachment);
    return this.apiService.put<AssignmentResponse>(`assignments/${id}`, formData);
  }

  /**
   * Helper to construct FormData for create and update operations.
   */
  private buildAssignmentFormData(payload: CreateAssignmentPayload, attachment?: File | null): FormData {
    const formData = new FormData();

    formData.append('title', payload.title || '');
    formData.append('description', payload.description || '');
    formData.append('grade_level', payload.grade_level || '');
    formData.append('subject', payload.subject || '');
    formData.append('due_date', payload.due_date || '');
    formData.append('total_points', payload.total_points !== undefined && payload.total_points !== null ? String(payload.total_points) : '');

    if (payload.book_title !== undefined && payload.book_title !== null) {
      formData.append('book_title', payload.book_title);
    }
    if (payload.required_reading !== undefined && payload.required_reading !== null) {
      formData.append('required_reading', payload.required_reading);
    }
    if (payload.reading_instructions !== undefined && payload.reading_instructions !== null) {
      formData.append('reading_instructions', payload.reading_instructions);
    }

    // Ensure enable_islamic_alert is sent as 'true' or 'false' string inside FormData
    const isIslamicAlertEnabled = payload.enable_islamic_alert === true || payload.enable_islamic_alert === 'true';
    formData.append('enable_islamic_alert', isIslamicAlertEnabled ? 'true' : 'false');

    if (payload.islamic_alert_description !== undefined && payload.islamic_alert_description !== null) {
      formData.append('islamic_alert_description', payload.islamic_alert_description);
    }

    if (payload.target_grade !== undefined && payload.target_grade !== null) {
      formData.append('target_grade', payload.target_grade);
    }

    // Only append attachment if a new file is provided
    const fileToUpload = attachment || payload.attachment;
    if (fileToUpload) {
      formData.append('attachment', fileToUpload);
    }

    return formData;
  }
}
