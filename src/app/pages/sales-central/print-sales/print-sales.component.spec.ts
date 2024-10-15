import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintSalesComponent } from './print-sales.component';

describe('PrintSalesComponent', () => {
  let component: PrintSalesComponent;
  let fixture: ComponentFixture<PrintSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrintSalesComponent]
    });
    fixture = TestBed.createComponent(PrintSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
