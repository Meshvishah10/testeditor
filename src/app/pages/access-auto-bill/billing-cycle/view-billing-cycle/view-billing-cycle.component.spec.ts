import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBillingCycleComponent } from './view-billing-cycle.component';

describe('ViewBillingCycleComponent', () => {
  let component: ViewBillingCycleComponent;
  let fixture: ComponentFixture<ViewBillingCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBillingCycleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewBillingCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
