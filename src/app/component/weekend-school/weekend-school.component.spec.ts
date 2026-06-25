import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekendSchoolComponent } from './weekend-school.component';

describe('WeekendSchoolComponent', () => {
  let component: WeekendSchoolComponent;
  let fixture: ComponentFixture<WeekendSchoolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [WeekendSchoolComponent]
});
    fixture = TestBed.createComponent(WeekendSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
