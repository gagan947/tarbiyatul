import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAssignmentSubmissionsComponent } from './teacher-assignment-submissions.component';

describe('TeacherAssignmentSubmissionsComponent', () => {
  let component: TeacherAssignmentSubmissionsComponent;
  let fixture: ComponentFixture<TeacherAssignmentSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAssignmentSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherAssignmentSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
