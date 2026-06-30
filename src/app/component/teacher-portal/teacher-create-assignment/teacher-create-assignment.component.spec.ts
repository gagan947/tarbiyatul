import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCreateAssignmentComponent } from './teacher-create-assignment.component';

describe('TeacherCreateAssignmentComponent', () => {
  let component: TeacherCreateAssignmentComponent;
  let fixture: ComponentFixture<TeacherCreateAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherCreateAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherCreateAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
