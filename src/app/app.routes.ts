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
  { path: 'student', loadComponent: () => import('./component/student-portel/std-portal/std-portal.component').then(m => m.StdPortalComponent) },
  {
    path: 'student',
    children: [
      { path: 'std-dashboard', loadComponent: () => import('./component/student-portel/std-dashboard/std-dashboard.component').then(m => m.StdDashboardComponent) }
    ]
  }
];
