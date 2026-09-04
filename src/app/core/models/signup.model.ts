export interface StudentSignupInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gradeLevel: string;
  academy: string;
  email: string;
}

export interface ParentSignupRequest {
  role: 'parent' | string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  students: StudentSignupInfo[];
}

export interface TutoringSignupRequest {
  role: 'tutoring';
  learnerFirstName: string;
  learnerLastName: string;
  learnerEmail: string;
  password: string;
  subject: string;
  academy: string;
  gradeLevel: string;
}

export type SignupRequest = ParentSignupRequest | TutoringSignupRequest | any;

export interface SignupResponse {
  message?: string;
  success?: boolean;
  user?: any;
  data?: any;
}

