import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProfileService } from '../../../core/services/profile.service';
import { CreateAssignmentPayload, AssignmentListItem } from '../../../core/models/assignment.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-teacher-create-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './teacher-create-assignment.component.html',
  styleUrl: './teacher-create-assignment.component.css'
})
export class TeacherCreateAssignmentComponent implements OnInit {
  assignmentForm!: FormGroup;
  isLoading = false;
  submitted = false;
  isEditMode = false;
  isDragging = false;
  assignmentId: string | number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  modalPreviewUrl: string | null = null;
  existingAttachmentUrl: string | null = null;
  existingAttachmentName: string | null = null;
  imageBaseUrl = environment.imageBaseUrl;
  teacherGrade: string = '';

  gradeOptions: string[] = [
    'Pre-K',
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    'Adult Learner / Tutoring'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private apiService: ApiService,
    private toastService: ToastService,
    private location: Location,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.profileService.profile$.subscribe(profile => {
      if (profile && profile.data) {
        const teachingGrade = profile.data.teacherProfile?.teachingGrade ||
                              profile.data.teachingGrade ||
                              profile.data.user?.teacherProfile?.teachingGrade || '';
        if (teachingGrade) {
          this.teacherGrade = teachingGrade;
          if (!this.gradeOptions.includes(teachingGrade)) {
            this.gradeOptions.unshift(teachingGrade);
          }
          if (!this.isEditMode || !this.assignmentForm.get('target_grade')?.value) {
            this.assignmentForm.patchValue({
              grade_level: teachingGrade,
              target_grade: teachingGrade
            });
          }
        }
      }
    });

    if (!this.profileService.getProfileData()) {
      this.profileService.fetchProfile().subscribe();
    }

    // Fallback in case teachingGrade is provided from teacher/dashboard stats
    this.apiService.get<any>('teacher/dashboard').subscribe({
      next: (res) => {
        const stats = res?.data?.stats || res?.data || res;
        const grade = stats?.teaching_grade || stats?.teachingGrade;
        if (grade && !this.teacherGrade) {
          this.teacherGrade = grade;
          if (!this.isEditMode || !this.assignmentForm.get('target_grade')?.value) {
            this.assignmentForm.patchValue({
              grade_level: grade,
              target_grade: grade
            });
          }
        }
      },
      error: () => {}
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.assignmentId = idParam;
      this.loadAssignmentDetails(this.assignmentId);
    }
  }

  private initForm(): void {
    this.assignmentForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      book_title: [''],
      required_reading: [''],
      subject: ['', [Validators.required]],
      grade_level: ['', [Validators.required]],
      target_grade: [''],
      due_date: ['', [Validators.required]],
      total_points: ['', [Validators.required, Validators.min(1)]],
      reading_instructions: [''],
      enable_islamic_alert: [true],
      islamic_alert_description: ['']
    });

    // Setup conditional validation for islamic_alert_description
    this.updateIslamicAlertValidation(this.assignmentForm.get('enable_islamic_alert')?.value);

    this.assignmentForm.get('enable_islamic_alert')?.valueChanges.subscribe((enabled: boolean) => {
      this.updateIslamicAlertValidation(enabled);
    });

    // Keep grade_level and target_grade synchronized when either changes
    this.assignmentForm.get('target_grade')?.valueChanges.subscribe((val: string) => {
      if (val && !this.assignmentForm.get('grade_level')?.value) {
        this.assignmentForm.get('grade_level')?.setValue(val, { emitEvent: false });
      }
    });

    this.assignmentForm.get('grade_level')?.valueChanges.subscribe((val: string) => {
      if (val && !this.assignmentForm.get('target_grade')?.value) {
        this.assignmentForm.get('target_grade')?.setValue(val, { emitEvent: false });
      }
    });
  }

  get f() {
    return this.assignmentForm.controls;
  }

  private loadAssignmentDetails(id: string | number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.assignmentService.getAssignmentById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        const data = res.data || (res as unknown as AssignmentListItem);
        if (data) {
          let formattedDate = '';
          const rawDate = data.due_date || data.dueDate;
          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split('T')[0];
              }
            } catch (e) {
              console.warn('Error formatting due_date for edit input:', e);
            }
          }

          const isAlertEnabled = data.enable_islamic_alert === 1 || data.enable_islamic_alert === true;
          const gradeVal = data.grade_level || data.target_grade || data.grade || '';

          this.assignmentForm.patchValue({
            title: data.title || '',
            description: data.description || '',
            book_title: data.book_title || data.bookTitle || '',
            required_reading: data.required_reading || data.requiredReading || '',
            subject: data.subject || '',
            grade_level: gradeVal,
            target_grade: gradeVal,
            due_date: formattedDate,
            total_points: data.total_points ?? data.totalPoints ?? '',
            reading_instructions: data.reading_instructions || data.readingInstructions || '',
            enable_islamic_alert: isAlertEnabled,
            islamic_alert_description: data.islamic_alert_description || ''
          });

          this.updateIslamicAlertValidation(isAlertEnabled);

          const existingFile = data.attachment_url || data.attachmentUrl || data.attachment || data.book_cover_url || data.bookCover || null;
          if (existingFile) {
            this.existingAttachmentUrl = existingFile;
            this.existingAttachmentName = this.extractFileName(existingFile);
          }
        }
      },
      error: (err: Error) => {
        this.isLoading = false;
        const msg = err.message || 'Failed to load assignment details for editing.';
        this.errorMessage = msg;
        this.toastService.error(msg);
      }
    });
  }

  private extractFileName(urlStr: string): string {
    if (!urlStr) return 'Attachment';
    const parts = urlStr.split('/');
    return parts[parts.length - 1] || 'Attachment';
  }

  private updateIslamicAlertValidation(isEnabled: boolean): void {
    const alertDescControl = this.assignmentForm.get('islamic_alert_description');
    if (!alertDescControl) return;

    if (isEnabled) {
      alertDescControl.setValidators([Validators.required]);
    } else {
      alertDescControl.clearValidators();
    }
    alertDescControl.updateValueAndValidity();
  }

  onGradeSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.assignmentForm.patchValue({
      grade_level: value,
      target_grade: value
    });
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('assignmentFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.filePreviewUrl = null;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreviewUrl = null;
    const fileInput = document.getElementById('assignmentFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removeExistingFile(): void {
    this.existingAttachmentUrl = null;
    this.existingAttachmentName = null;
    this.filePreviewUrl = null;
  }

  isImageFile(fileUrlOrName: string | null): boolean {
    if (!fileUrlOrName) return false;
    const lower = fileUrlOrName.toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.gif') || lower.startsWith('data:image/');
  }

  getExistingFileUrl(imgPath: string | null): string {
    if (!imgPath) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:') || imgPath.startsWith('assets/')) {
      return imgPath;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const path = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
    return `${base}${path}`;
  }

  openPreviewModal(url: string | null): void {
    if (!url) return;
    this.modalPreviewUrl = url;
    const btn = document.getElementById('openPreviewModalTriggerBtn');
    if (btn) btn.click();
  }

  private formatIsoDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      console.warn('Error formatting date to ISO:', e);
    }
    return dateString;
  }

  onSubmit(): void {
    if (this.teacherGrade && (!this.assignmentForm.get('target_grade')?.value || !this.assignmentForm.get('grade_level')?.value)) {
      this.assignmentForm.patchValue({
        grade_level: this.teacherGrade,
        target_grade: this.teacherGrade
      });
    }

    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.assignmentForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;

    const formValues = this.assignmentForm.getRawValue();
    const isoDueDate = this.formatIsoDate(formValues.due_date);
    const effectiveGrade = formValues.target_grade || formValues.grade_level || this.teacherGrade;

    const payload: CreateAssignmentPayload = {
      title: formValues.title,
      description: formValues.description,
      grade_level: effectiveGrade,
      subject: formValues.subject,
      due_date: isoDueDate,
      total_points: formValues.total_points,
      book_title: formValues.book_title || '',
      required_reading: formValues.required_reading || '',
      reading_instructions: formValues.reading_instructions || '',
      enable_islamic_alert: !!formValues.enable_islamic_alert,
      islamic_alert_description: formValues.enable_islamic_alert ? formValues.islamic_alert_description : '',
      target_grade: effectiveGrade
    };

    const saveObservable = (this.isEditMode && this.assignmentId)
      ? this.assignmentService.updateAssignment(this.assignmentId, payload, this.selectedFile)
      : this.assignmentService.createAssignment(payload, this.selectedFile);

    saveObservable.subscribe({
      next: (res) => {
        this.isLoading = false;
        const defaultMsg = this.isEditMode ? 'Assignment updated successfully!' : 'Assignment created successfully!';
        const msg = res.message || defaultMsg;
        this.successMessage = msg;
        this.toastService.success(msg);

        // Reset form state & selected file if create
        if (!this.isEditMode) {
          this.submitted = false;
          this.assignmentForm.reset({
            enable_islamic_alert: true,
            grade_level: this.teacherGrade,
            target_grade: this.teacherGrade
          });
          this.removeFile();
        }

        // Navigate back after successful save
        setTimeout(() => {
          if (this.isEditMode && this.assignmentId) {
            this.router.navigate(['/teacher/assignments', this.assignmentId]);
          } else {
            this.goBack();
          }
        }, 1200);
      },
      error: (err: Error) => {
        this.isLoading = false;
        const defaultErrMsg = this.isEditMode ? 'Failed to update assignment. Please try again.' : 'Failed to create assignment. Please try again.';
        const msg = err.message || defaultErrMsg;
        this.errorMessage = msg;
        this.toastService.error(msg);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
