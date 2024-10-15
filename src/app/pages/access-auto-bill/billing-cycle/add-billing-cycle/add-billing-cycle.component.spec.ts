import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBillingCycleComponent } from './add-billing-cycle.component';

describe('AddBillingCycleComponent', () => {
  let component: AddBillingCycleComponent;
  let fixture: ComponentFixture<AddBillingCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBillingCycleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddBillingCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
