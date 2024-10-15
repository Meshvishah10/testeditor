import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingInvoiceComponent } from './billing-invoice.component';

describe('BillingInvoiceComponent', () => {
  let component: BillingInvoiceComponent;
  let fixture: ComponentFixture<BillingInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillingInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
