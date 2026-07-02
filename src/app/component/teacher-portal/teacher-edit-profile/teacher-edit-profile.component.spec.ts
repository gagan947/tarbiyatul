import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherEditProfileComponent } from './teacher-edit-profile.component';

describe('TeacherEditProfileComponent', () => {
  let component: TeacherEditProfileComponent;
  let fixture: ComponentFixture<TeacherEditProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherEditProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherEditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
