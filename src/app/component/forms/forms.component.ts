import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { environment } from 'src/environments/environment';

export interface FormDocument {
  id: string;
  numericId?: number;
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  previewUrl?: string;
  fileName: string;
  fileSize: string;
  updatedAt?: string;
  lastUpdated?: string;
  status?: string;
  active?: boolean;
  isActive?: boolean;
}

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent implements OnInit, OnDestroy {
  forms: FormDocument[] = [];
  searchQuery = '';
  selectedCategory = 'All';
  isLoading = false;

  categories = ['All', 'Admission', 'Fee & Financial', 'Health & Dental'];

  showPreviewModal = false;
  previewForm: FormDocument | null = null;
  safePreviewUrl: SafeResourceUrl | null = null;
  isPreviewLoading = false;
  previewError = false;
  private currentBlobUrl: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadForms();
  }

  getFileUrl(url?: string): string {
    if (!url) return '';
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('blob:') ||
      url.startsWith('data:')
    ) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const base = environment.imageBaseUrl.endsWith('/')
      ? environment.imageBaseUrl
      : `${environment.imageBaseUrl}/`;
    return `${base}${cleanUrl}`;
  }

  loadForms(): void {
    this.isLoading = true;
    this.apiService.get<any>('forms').subscribe({
      next: (res) => {
        this.isLoading = false;
        const rawList = res?.data || res;
        if (Array.isArray(rawList) && rawList.length > 0) {
          this.forms = rawList
            .filter((f: FormDocument) => f.active !== false && f.status !== 'Inactive' && f.isActive !== false)
            .map((f: FormDocument) => ({
              ...f,
              fileUrl: this.getFileUrl(f.fileUrl),
              previewUrl: this.getFileUrl(f.previewUrl || f.fileUrl)
            }));
          this.updateCategories();
          try {
            localStorage.setItem('tiag_forms_cache', JSON.stringify(this.forms));
          } catch (e) {}
          return;
        }
        this.tryAdminEndpoint();
      },
      error: (err) => {
        console.warn('GET /api/forms failed, trying admin/forms fallback:', err);
        this.tryAdminEndpoint();
      }
    });
  }

  private tryAdminEndpoint(): void {
    this.apiService.get<any>('admin/forms').subscribe({
      next: (res) => {
        this.isLoading = false;
        const rawList = res?.data || res;
        if (Array.isArray(rawList) && rawList.length > 0) {
          this.forms = rawList
            .filter((f: FormDocument) => f.active !== false && f.status !== 'Inactive' && f.isActive !== false)
            .map((f: FormDocument) => ({
              ...f,
              fileUrl: this.getFileUrl(f.fileUrl),
              previewUrl: this.getFileUrl(f.previewUrl || f.fileUrl)
            }));
          this.updateCategories();
          try {
            localStorage.setItem('tiag_forms_cache', JSON.stringify(this.forms));
          } catch (e) {}
          return;
        }
        this.useFallbackForms();
      },
      error: () => {
        this.isLoading = false;
        this.useFallbackForms();
      }
    });
  }

  private updateCategories(): void {
    const defaultCats = ['All', 'Admission', 'Fee & Financial', 'Health & Dental'];
    const dynamicCats = this.forms.map(f => f.category).filter(Boolean);
    const set = new Set([...defaultCats, ...dynamicCats]);
    this.categories = Array.from(set);
  }

  private useFallbackForms(): void {
    this.isLoading = false;
    // Check cached data from API
    const cached = localStorage.getItem('tiag_forms_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.forms = parsed.filter((f: FormDocument) => f.active !== false);
          this.updateCategories();
          return;
        }
      } catch (e) {}
    }

    // Check admin portal's localStorage key (works when both run on same domain/port)
    const saved = localStorage.getItem('tiag_forms_repository');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.forms = parsed.filter((f: FormDocument) => f.active !== false);
          this.updateCategories();
          return;
        }
      } catch (e) {
        console.error('Error reading forms repository', e);
      }
    }

    // Default Fallback Forms if storage empty
    this.forms = [
      {
        id: 'form_adm_01',
        title: 'New Student Admission Form',
        category: 'Admission',
        description: 'Official student registration and enrollment application form.',
        fileUrl: 'assets/forms/admission-form.pdf',
        fileName: 'admission-form.pdf',
        fileSize: '1.2 MB',
        updatedAt: 'Aug 2025',
        active: true
      },
      {
        id: 'form_fee_02',
        title: 'Tuition & Fee Agreement Form',
        category: 'Fee & Financial',
        description: 'Tuition terms, payment schedule, and fee commitment agreement.',
        fileUrl: 'assets/forms/fee-agreement.pdf',
        fileName: 'fee-agreement.pdf',
        fileSize: '850 KB',
        updatedAt: 'Aug 2025',
        active: true
      },
      {
        id: 'form_hlth_03',
        title: 'Child Health Report Form',
        category: 'Health & Dental',
        description: 'Physical examination record, medical history, and immunization report.',
        fileUrl: 'assets/forms/child-health-report.pdf',
        fileName: 'child-health-report.pdf',
        fileSize: '920 KB',
        updatedAt: 'Aug 2025',
        active: true
      },
      {
        id: 'form_dnt_04',
        title: 'Child Dental Report Form',
        category: 'Health & Dental',
        description: 'Annual dental screening report completed by licensed dentist.',
        fileUrl: 'assets/forms/child-dental-report.pdf',
        fileName: 'child-dental-report.pdf',
        fileSize: '640 KB',
        updatedAt: 'Aug 2025',
        active: true
      }
    ];
    this.updateCategories();
  }

  get filteredForms(): FormDocument[] {
    return this.forms.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            f.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            (f.fileName && f.fileName.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchesCategory = this.selectedCategory === 'All' || f.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  openPreview(form: FormDocument): void {
    this.previewForm = form;
    this.showPreviewModal = true;
    this.safePreviewUrl = null;
    this.previewError = false;

    // Revoke previous blob URL to prevent memory leaks
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    const previewTarget = form.previewUrl || form.fileUrl;
    if (!previewTarget) {
      this.previewError = true;
      this.cdr.markForCheck();
      return;
    }

    // If it's already a blob or data url, bypass directly
    if (previewTarget.startsWith('blob:') || previewTarget.startsWith('data:')) {
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewTarget);
      this.cdr.markForCheck();
      return;
    }

    this.isPreviewLoading = true;
    this.cdr.markForCheck();

    fetch(previewTarget)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(pdfBlob);
        this.currentBlobUrl = objectUrl;
        this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.isPreviewLoading = false;
        this.cdr.markForCheck();
      })
      .catch(err => {
        console.warn('Could not fetch PDF as blob for preview:', err);
        this.isPreviewLoading = false;
        this.previewError = true;
        this.cdr.markForCheck();
      });
  }

  closePreview(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.showPreviewModal = false;
    this.previewForm = null;
    this.safePreviewUrl = null;
    this.isPreviewLoading = false;
    this.previewError = false;
    this.cdr.markForCheck();
  }

  openInNewTab(url?: string): void {
    const target = url || this.previewForm?.fileUrl || this.previewForm?.previewUrl;
    if (target) {
      window.open(target, '_blank');
    }
  }

  downloadForm(form: FormDocument | null, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!form) return;

    const targetUrl = form.fileUrl || form.previewUrl;
    const fileName = form.fileName || `${form.title || 'document'}.pdf`;

    if (!targetUrl) return;

    // Try fetching as blob so the download attribute with custom filename is respected
    fetch(targetUrl)
      .then(res => {
        if (!res.ok) throw new Error('Download request failed');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.warn('Blob download failed, opening directly:', err);
        window.open(targetUrl, '_blank');
      });
  }

  ngOnDestroy(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Admission': return 'fa-file-signature text-warning';
      case 'Fee & Financial': return 'fa-file-invoice-dollar text-info';
      case 'Health & Dental': return 'fa-file-medical text-success';
      default: return 'fa-file-pdf text-primary';
    }
  }
}
