import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeInvoiceComponent } from './charge-invoice.component';

describe('ChargeInvoiceComponent', () => {
  let component: ChargeInvoiceComponent;
  let fixture: ComponentFixture<ChargeInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargeInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChargeInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
