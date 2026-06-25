import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfPacedComponent } from './self-paced.component';

describe('SelfPacedComponent', () => {
  let component: SelfPacedComponent;
  let fixture: ComponentFixture<SelfPacedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SelfPacedComponent]
});
    fixture = TestBed.createComponent(SelfPacedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
