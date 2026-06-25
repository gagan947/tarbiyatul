import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentHandbookComponent } from './student-handbook.component';

describe('StudentHandbookComponent', () => {
  let component: StudentHandbookComponent;
  let fixture: ComponentFixture<StudentHandbookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [StudentHandbookComponent]
});
    fixture = TestBed.createComponent(StudentHandbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
