import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ProfileService } from '../../../core/services/profile.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-std-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './std-edit-profile.component.html',
  styleUrl: './std-edit-profile.component.css'
})
export class StdEditProfileComponent implements OnInit {
  maxDate: string = new Date().toISOString().split('T')[0];
  editProfileForm!: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imageBaseUrl = environment.imageBaseUrl
  // Grade options for selection
  gradeOptions = [
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
  ];

  // Image Cropping Properties
  showCropModal = false;
  imageSrc: string | null = null;
  croppedImagePreview: string | null = null;
  croppedFile: File | null = null;

  // Interactive crop manipulation state
  isDragging = false;
  startX = 0;
  startY = 0;
  translateX = 0;
  translateY = 0;
  scale = 1;

  currentAvatarUrl = 'assets/img/placeholder.jpg';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.editProfileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gradeLevel: ['', [Validators.required]]
    });

    // Populate profile details
    this.profileService.profile$.subscribe(profile => {
      if (profile) {
        const student = profile.data?.student || profile.data || profile;
        if (student) {
          this.editProfileForm.patchValue({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            dob: student.dob ? student.dob.split('T')[0] : '',
            gradeLevel: student.gradeLevel || student.grade || ''
          });
          this.currentAvatarUrl = student.profileImage || 'assets/img/placeholder.jpg';
        }
      }
    });

    // Ensure we trigger profile load if it is not already present
    if (!this.profileService.getProfileData()) {
      this.profileService.fetchProfile().subscribe();
    }
  }

  get f() {
    return this.editProfileForm.controls;
  }

  getAvatarUrl(profileImage: string | null | undefined): string {
    if (!profileImage) {
      return 'assets/img/placeholder.jpg';
    }
    const normalizedAvatar = profileImage.replace(/\\/g, '/');
    if (
      normalizedAvatar.startsWith('http://') ||
      normalizedAvatar.startsWith('https://') ||
      normalizedAvatar.startsWith('data:') ||
      normalizedAvatar.startsWith('blob:') ||
      normalizedAvatar.startsWith('assets/')
    ) {
      return normalizedAvatar;
    }
    const base = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : `${this.imageBaseUrl}/`;
    const path = normalizedAvatar.startsWith('/') ? normalizedAvatar.substring(1) : normalizedAvatar;
    return `${base}${path}`;
  }

  // Trigger file selection input
  triggerFileInput(): void {
    const fileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
    fileInput.click();
  }

  // File Input change listener
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result as string;
        // Reset crop properties
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.showCropModal = true;
      };
      reader.readAsDataURL(file);
    }
  }

  // Crop Drag Events
  onDragStart(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isDragging = true;
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.startX = clientX - this.translateX;
    this.startY = clientY - this.translateY;
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.translateX = clientX - this.startX;
    this.translateY = clientY - this.startY;
  }

  onDragEnd(): void {
    this.isDragging = false;
  }

  cancelCrop(): void {
    this.showCropModal = false;
    this.imageSrc = null;
    // Reset file input
    const fileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  cropAndSave(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    const imgElement = document.getElementById('crop-target-img') as HTMLImageElement;

    if (ctx && imgElement) {
      ctx.clearRect(0, 0, 250, 250);

      // Center origin to apply translate and scale
      ctx.translate(125, 125);
      ctx.translate(this.translateX, this.translateY);
      ctx.scale(this.scale, this.scale);

      const dw = imgElement.naturalWidth;
      const dh = imgElement.naturalHeight;

      // Fit image size inside 250x250 crop boundary
      const ratio = Math.min(250 / dw, 250 / dh);
      const fitWidth = dw * ratio;
      const fitHeight = dh * ratio;

      ctx.drawImage(imgElement, -fitWidth / 2, -fitHeight / 2, fitWidth, fitHeight);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      this.croppedFile = this.dataURLtoFile(dataUrl, 'avatar.jpg');
      this.croppedImagePreview = dataUrl;
      this.currentAvatarUrl = dataUrl;
      this.showCropModal = false;
    } else {
      this.showCropModal = false;
    }
  }

  dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.editProfileForm.invalid) {
      return;
    }

    this.isLoading = true;

    // Use FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('firstName', this.editProfileForm.get('firstName')?.value);
    formData.append('lastName', this.editProfileForm.get('lastName')?.value);
    formData.append('dob', this.editProfileForm.get('dob')?.value);
    formData.append('gradeLevel', this.editProfileForm.get('gradeLevel')?.value);

    if (this.croppedFile) {
      formData.append('profileImage', this.croppedFile);
    }

    this.apiService.patch<any>('users/auth/profile', formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully! Redirecting...';

          // Instantly update local profile state so other templates re-render without page reload
          this.profileService.setProfile(response);

          setTimeout(() => {
            this.router.navigate(['/student/my-profile']);
          }, 1500);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to update profile. Please try again.';
        }
      });
  }
}
