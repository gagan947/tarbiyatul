import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./component/home/home.component').then(m => m.HomeComponent) },
  { path: 'welcome', loadComponent: () => import('./component/welcome/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'history', loadComponent: () => import('./component/history/history.component').then(m => m.HistoryComponent) },
  { path: 'mission_vission', loadComponent: () => import('./component/vision/vision.component').then(m => m.VisionComponent) },
  { path: 'founder_message', loadComponent: () => import('./component/founder-message/founder-message.component').then(m => m.FounderMessageComponent) },
  { path: 'self_paced_learning', loadComponent: () => import('./component/self-paced/self-paced.component').then(m => m.SelfPacedComponent) },
  { path: 'weekend_school', loadComponent: () => import('./component/weekend-school/weekend-school.component').then(m => m.WeekendSchoolComponent) },
  { path: 'admissionProcess', loadComponent: () => import('./component/admission-process/admission-process.component').then(m => m.AdmissionProcessComponent) },
  { path: 'fee', loadComponent: () => import('./component/fee/fee.component').then(m => m.FeeComponent) },
  { path: 'calendar', loadComponent: () => import('./component/calendar/calendar.component').then(m => m.CalendarComponent) },
  { path: 'login', loadComponent: () => import('./component/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'choose-role', loadComponent: () => import('./component/auth/choose-role/choose-role.component').then(m => m.ChooseRoleComponent) },
  { path: 'contact', loadComponent: () => import('./component/contact-us/contact-us.component').then(m => m.ContactUsComponent) },
  { path: 'tech_support', loadComponent: () => import('./component/tech-support/tech-support.component').then(m => m.TechSupportComponent) },
  { path: 'privacy_policy', loadComponent: () => import('./component/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
  { path: 'employment', loadComponent: () => import('./component/employment/employment.component').then(m => m.EmploymentComponent) },
  { path: 'faq', loadComponent: () => import('./component/faqs/faqs.component').then(m => m.FaqsComponent) },
  { path: 'eventsDetail', loadComponent: () => import('./component/events/events.component').then(m => m.EventsComponent) },
  { path: 'academicProgram', loadComponent: () => import('./component/academic-program/academic-program.component').then(m => m.AcademicProgramComponent) },
  { path: 'forgotpassword', loadComponent: () => import('./component/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'signup', loadComponent: () => import('./component/auth/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'announcement', loadComponent: () => import('./component/announcement/announcement.component').then(m => m.AnnouncementComponent) },
  { path: 'student_handbook', loadComponent: () => import('./component/student-handbook/student-handbook.component').then(m => m.StudentHandbookComponent) },
  { path: 'summerschool', loadComponent: () => import('./component/summer-school/summer-school.component').then(m => m.SummerSchoolComponent) },
  { path: 'curriculum', loadComponent: () => import('./component/curriculum/curriculum.component').then(m => m.CurriculumComponent) },
  {
    path: 'student',
    loadComponent: () => import('./component/student-portel/std-portal/std-portal.component').then(m => m.StdPortalComponent),
    children: [
      { path: '', redirectTo: 'std-dashboard', pathMatch: 'full' },
      { path: 'std-dashboard', loadComponent: () => import('./component/student-portel/std-dashboard/std-dashboard.component').then(m => m.StdDashboardComponent) },
      { path: 'my-books', loadComponent: () => import('./component/student-portel/std-my-books/std-my-books.component').then(m => m.StdMyBooksComponent) },
      { path: 'assignments', loadComponent: () => import('./component/student-portel/std-assignments/std-assignments.component').then(m => m.StdAssignmentsComponent) },
      { path: 'assignments/:id', loadComponent: () => import('./component/student-portel/std-assignment-details/std-assignment-details.component').then(m => m.StdAssignmentDetailsComponent) },
      { path: 'message-teacher', loadComponent: () => import('./component/student-portel/std-messages/std-messages.component').then(m => m.StdMessagesComponent) },
      { path: 'resources', loadComponent: () => import('./component/student-portel/std-resources/std-resources.component').then(m => m.StdResourcesComponent) },
      { path: 'change-password', loadComponent: () => import('./component/student-portel/std-change-password/std-change-password.component').then(m => m.StdChangePasswordComponent) },
      { path: 'edit-profile', loadComponent: () => import('./component/student-portel/std-edit-profile/std-edit-profile.component').then(m => m.StdEditProfileComponent) },
      { path: 'my-profile', loadComponent: () => import('./component/student-portel/std-my-profile/std-my-profile.component').then(m => m.StdMyProfileComponent) }
    ]
  },
  {
    path: 'parent',
    loadComponent: () => import('./component/parent-portal/parent-portal/parent-portal.component').then(m => m.ParentPortalComponent),
    children: [
      { path: '', redirectTo: 'my-profile', pathMatch: 'full' },
      { path: 'my-profile', loadComponent: () => import('./component/parent-portal/parent-my-profile/parent-my-profile.component').then(m => m.ParentMyProfileComponent) },
      { path: 'dashboard', loadComponent: () => import('./component/parent-portal/parent-dashboard/parent-dashboard.component').then(m => m.ParentDashboardComponent) },
      { path: 'assignments', loadComponent: () => import('./component/parent-portal/parent-assignments/parent-assignments.component').then(m => m.ParentAssignmentsComponent) },
      { path: 'assignments/:id', loadComponent: () => import('./component/parent-portal/parent-assignment-details/parent-assignment-details.component').then(m => m.ParentAssignmentDetailsComponent) },
      { path: 'payments', loadComponent: () => import('./component/parent-portal/parent-payments/parent-payments.component').then(m => m.ParentPaymentsComponent) },
      { path: 'handbook', loadComponent: () => import('./component/parent-portal/parent-handbook/parent-handbook.component').then(m => m.ParentHandbookComponent) },
      { path: 'edit-profile', loadComponent: () => import('./component/parent-portal/parent-edit-profile/parent-edit-profile.component').then(m => m.ParentEditProfileComponent) },
      { path: 'change-password', loadComponent: () => import('./component/parent-portal/parent-change-password/parent-change-password.component').then(m => m.ParentChangePasswordComponent) },
      { path: 'calendar', loadComponent: () => import('./component/parent-portal/parent-calendar/parent-calendar.component').then(m => m.ParentCalendarComponent) },
      { path: 'message-teacher', loadComponent: () => import('./component/parent-portal/parent-messages/parent-messages.component').then(m => m.ParentMessagesComponent) }
    ]
  },
  {
    path: 'teacher',
    loadComponent: () => import('./component/teacher-portal/teacher-portal/teacher-portal.component').then(m => m.TeacherPortalComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./component/teacher-portal/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent) },
      { path: 'assignments', loadComponent: () => import('./component/teacher-portal/teacher-assignments/teacher-assignments.component').then(m => m.TeacherAssignmentsComponent) },
      { path: 'assignments/:id', loadComponent: () => import('./component/teacher-portal/teacher-assignment-details/teacher-assignment-details.component').then(m => m.TeacherAssignmentDetailsComponent) },
      { path: 'students', loadComponent: () => import('./component/teacher-portal/teacher-students/teacher-students.component').then(m => m.TeacherStudentsComponent) },
      { path: 'students/:id', loadComponent: () => import('./component/teacher-portal/teacher-student-details/teacher-student-details.component').then(m => m.TeacherStudentDetailsComponent) },
      { path: 'message-teacher', loadComponent: () => import('./component/teacher-portal/teacher-messages/teacher-messages.component').then(m => m.TeacherMessagesComponent) }
    ]
  }
];
