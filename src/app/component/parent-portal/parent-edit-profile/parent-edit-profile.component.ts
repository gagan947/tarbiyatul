import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ProfileService } from '../../../core/services/profile.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './parent-edit-profile.component.html',
  styleUrl: './parent-edit-profile.component.css'
})
export class ParentEditProfileComponent implements OnInit {
  editProfileForm!: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imageBaseUrl = environment.imageBaseUrl;

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
    public profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editProfileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern('^[0-9+() -]*$')]]
    });

    this.profileService.profile$.subscribe(profile => {
      if (profile && profile.data?.user) {
        const user = profile.data.user;
        this.editProfileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || ''
        });
        this.currentAvatarUrl = user.profileImage || user.avatar || 'assets/img/placeholder.jpg';
      }
    });

    if (!this.profileService.getProfileData()) {
      this.isLoading = true;
      this.profileService.fetchProfile().subscribe({
        next: () => this.isLoading = false,
        error: () => this.isLoading = false
      });
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
    const fileInput = document.getElementById('parentAvatarFileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  // File Input change listener
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result as string;
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
    const fileInput = document.getElementById('parentAvatarFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  cropAndSave(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    const imgElement = document.getElementById('parent-crop-target-img') as HTMLImageElement;

    if (ctx && imgElement) {
      ctx.clearRect(0, 0, 250, 250);

      // Center origin to apply translate and scale
      ctx.translate(125, 125);
      ctx.translate(this.translateX, this.translateY);
      ctx.scale(this.scale, this.scale);

      const dw = imgElement.naturalWidth;
      const dh = imgElement.naturalHeight;

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

    // Use FormData for multipart/form-data payload compatibility
    const formData = new FormData();
    formData.append('firstName', this.editProfileForm.get('firstName')?.value);
    formData.append('lastName', this.editProfileForm.get('lastName')?.value);
    formData.append('phone', this.editProfileForm.get('phone')?.value);

    if (this.croppedFile) {
      formData.append('profileImage', this.croppedFile);
    }

    this.apiService.patch<any>('users/auth/profile', formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully!';
          this.profileService.setProfile(response);

          setTimeout(() => {
            this.router.navigate(['/parent/my-profile']);
          }, 1500);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to update profile. Please try again.';
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/parent/my-profile']);
  }
}
