export interface StudentSignupInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gradeLevel: string;
}

export interface SignupRequest {
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  students: StudentSignupInfo[];
}

export interface SignupResponse {
  message?: string;
  success?: boolean;
  user?: any;
}
