import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummerSchoolComponent } from './summer-school.component';

describe('SummerSchoolComponent', () => {
  let component: SummerSchoolComponent;
  let fixture: ComponentFixture<SummerSchoolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SummerSchoolComponent]
});
    fixture = TestBed.createComponent(SummerSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
