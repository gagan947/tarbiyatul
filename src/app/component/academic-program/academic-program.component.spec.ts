import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicProgramComponent } from './academic-program.component';

describe('AcademicProgramComponent', () => {
  let component: AcademicProgramComponent;
  let fixture: ComponentFixture<AcademicProgramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [AcademicProgramComponent]
});
    fixture = TestBed.createComponent(AcademicProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
