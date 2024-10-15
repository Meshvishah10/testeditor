import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChargeInvoiceComponent } from './add-charge-invoice.component';

describe('AddChargeInvoiceComponent', () => {
  let component: AddChargeInvoiceComponent;
  let fixture: ComponentFixture<AddChargeInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChargeInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddChargeInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
