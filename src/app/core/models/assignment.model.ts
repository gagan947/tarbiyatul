export interface CreateAssignmentPayload {
  title: string;
  description: string;
  grade_level: string;
  subject: string;
  due_date: string;
  total_points: number | string;
  book_title?: string;
  required_reading?: string;
  reading_instructions?: string;
  enable_islamic_alert: boolean | string;
  islamic_alert_description?: string;
  target_grade?: string;
  attachment?: File | null;
}

export interface UpdateAssignmentStatusPayload {
  status: string;
}

export interface Assignment {
  id?: string | number;
  _id?: string | number;
  title: string;
  description: string;
  grade_level: string;
  subject: string;
  due_date: string;
  total_points: number;
  book_title?: string;
  required_reading?: string;
  reading_instructions?: string;
  enable_islamic_alert?: boolean | number;
  islamic_alert_description?: string;
  target_grade?: string;
  attachmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentResponse {
  success?: boolean;
  message?: string;
  data?: Assignment | any;
}

export interface TeacherAssignmentQueryParams {
  search?: string;
  grade_level?: string;
  page?: number;
  limit?: number;
}

export interface StudentSubmission {
  id?: number;
  assignment_id?: number;
  student_id?: number;
  submission_text?: string | null;
  attachment_url?: string | null;
  submitted_at?: string | null;
  status?: string;
  marks_obtained?: number | null;
  grade?: string | null;
  feedback?: string | null;
  graded_at?: string | null;
  graded_by?: number | null;
}

export interface AssignmentListItem {
  id?: number | string;
  _id?: number | string;
  assignment_id?: number | string;
  teacher_id?: number | string;
  title?: string;
  description?: string;
  grade_level?: string;
  subject?: string;
  due_date?: string;
  dueDate?: string;
  total_points?: number;
  totalPoints?: number;
  attachment?: string | null;
  attachment_url?: string | null;
  attachmentUrl?: string | null;
  assignment_attachment?: string | null;
  book_title?: string | null;
  bookTitle?: string | null;
  required_reading?: string | null;
  requiredReading?: string | null;
  reading_instructions?: string | null;
  readingInstructions?: string | null;
  enable_islamic_alert?: number | boolean;
  islamic_alert_description?: string | null;
  book_cover_url?: string | null;
  bookCover?: string | null;
  target_grade?: string | null;
  grade?: string;
  created_at?: string;
  assignment_created_at?: string;
  updated_at?: string;
  total_submissions?: number;
  graded_submissions?: string | number;
  submission_status?: string;
  status?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  my_submission?: StudentSubmission | null;
}

export interface AssignmentListPagination {
  total_items?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  total?: number;
  totalPages?: number;
}

export interface TeacherAssignmentListResponse {
  success?: boolean;
  message?: string;
  data?: AssignmentListItem[] | {
    assignments?: AssignmentListItem[];
    total?: number;
    total_items?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    total_pages?: number;
  };
  assignments?: AssignmentListItem[];
  total?: number;
  total_items?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  total_pages?: number;
  pagination?: AssignmentListPagination;
}

export interface AssignmentDetailResponse {
  success?: boolean;
  message?: string;
  data?: AssignmentListItem;
}

export interface StudentAssignmentItem {
  assignment_id?: number | string;
  id?: number | string;
  title?: string;
  description?: string;
  grade_level?: string;
  subject?: string;
  due_date?: string;
  dueDate?: string;
  total_points?: number;
  assignment_attachment?: string | null;
  attachment?: string | null;
  attachment_url?: string | null;
  book_title?: string | null;
  bookTitle?: string | null;
  required_reading?: string | null;
  requiredReading?: string | null;
  reading_instructions?: string | null;
  readingInstructions?: string | null;
  enable_islamic_alert?: number | boolean;
  islamic_alert_description?: string | null;
  book_cover_url?: string | null;
  bookCover?: string | null;
  target_grade?: string | null;
  assignment_created_at?: string;
  created_at?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  submission_status?: string;
  status?: string;
  submission_text?: string | null;
  student_attachment?: string | null;
  submitted_at?: string | null;
  marks_obtained?: number | null;
  grade?: string | null;
  feedback?: string | null;
  graded_at?: string | null;
  my_submission?: StudentSubmission | null;
}

export interface StudentAssignmentData {
  student_id?: number;
  student_name?: string;
  grade_level?: string;
  assignments: StudentAssignmentItem[];
}

export interface StudentAssignmentListResponse {
  success?: boolean;
  message?: string;
  data?: StudentAssignmentData | StudentAssignmentItem[];
}
