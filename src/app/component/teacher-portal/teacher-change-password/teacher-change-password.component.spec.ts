import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherChangePasswordComponent } from './teacher-change-password.component';

describe('TeacherChangePasswordComponent', () => {
  let component: TeacherChangePasswordComponent;
  let fixture: ComponentFixture<TeacherChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherChangePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
