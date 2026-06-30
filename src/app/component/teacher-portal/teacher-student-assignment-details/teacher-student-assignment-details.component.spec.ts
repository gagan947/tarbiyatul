import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherStudentAssignmentDetailsComponent } from './teacher-student-assignment-details.component';

describe('TeacherStudentAssignmentDetailsComponent', () => {
  let component: TeacherStudentAssignmentDetailsComponent;
  let fixture: ComponentFixture<TeacherStudentAssignmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherStudentAssignmentDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherStudentAssignmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
