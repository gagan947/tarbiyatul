import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutoringDashboardComponent } from './tutoring-dashboard.component';

describe('TutoringDashboardComponent', () => {
  let component: TutoringDashboardComponent;
  let fixture: ComponentFixture<TutoringDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutoringDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutoringDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
