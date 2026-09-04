import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

export interface AcademicDates {
  academicYear?: string;
  firstDayOfSchoolDay?: string;
  firstDayOfSchoolDate?: string;
  firstDayOfSchoolText?: string;
  openHouseDay?: string;
  openHouseDate?: string;
  openHouseText?: string;
  registrationDeadline?: string;
  orientationDate?: string;
  updatedAt?: string;
}

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class WelcomeComponent implements OnInit {
  firstDayOfSchoolText: string = 'Monday, October 13, 2026';
  openHouseText: string = 'May 13, 2026';
  academicYear: string = '2025 - 2026';
  academicDates: AcademicDates | null = null;
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAcademicDates();
  }

  loadAcademicDates(): void {
    this.isLoading = true;
    this.apiService.get<any>('academic-dates').subscribe({
      next: (res) => {
        this.isLoading = false;
        const data = res?.data || res;
        if (data) {
          this.applyDates(data);
          try {
            localStorage.setItem('tiag_academic_dates', JSON.stringify(data));
          } catch (e) {}
        } else {
          this.useFallbackDates();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Failed to load academic dates from API, using fallback:', err);
        this.useFallbackDates();
      }
    });
  }

  private applyDates(parsed: any): void {
    if (!parsed) return;
    this.academicDates = parsed;

    // 1. First Day of School Text
    if (parsed.firstDayOfSchoolText && parsed.firstDayOfSchoolText.trim()) {
      this.firstDayOfSchoolText = parsed.firstDayOfSchoolText.trim();
    } else if (parsed.firstDayOfSchoolDay && parsed.firstDayOfSchoolDate) {
      this.firstDayOfSchoolText = `${parsed.firstDayOfSchoolDay}, ${parsed.firstDayOfSchoolDate}`;
    } else if (parsed.firstDayOfSchoolDate) {
      this.firstDayOfSchoolText = parsed.firstDayOfSchoolDate;
    }

    // 2. Open House Text
    if (parsed.openHouseText && parsed.openHouseText.trim()) {
      this.openHouseText = parsed.openHouseText.trim();
    } else if (parsed.openHouseDate) {
      this.openHouseText = parsed.openHouseDate;
    }

    // 3. Academic Year
    if (parsed.academicYear) {
      this.academicYear = parsed.academicYear;
    }
  }

  private useFallbackDates(): void {
    const savedConfig = localStorage.getItem('tiag_academic_dates');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        this.applyDates(parsed);
      } catch (e) {
        console.error('Error parsing academic dates in welcome component', e);
      }
    }
  }
}
