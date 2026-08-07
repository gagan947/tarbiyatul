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
  data?: Assignment;
}

export interface TeacherAssignmentQueryParams {
  search?: string;
  grade_level?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentListItem {
  id: number | string;
  _id?: number | string;
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
  updated_at?: string;
  total_submissions?: number;
  graded_submissions?: string | number;
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
