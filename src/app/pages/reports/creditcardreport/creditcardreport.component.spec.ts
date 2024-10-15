import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditcardreportComponent } from './creditcardreport.component';

describe('CreditcardreportComponent', () => {
  let component: CreditcardreportComponent;
  let fixture: ComponentFixture<CreditcardreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditcardreportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditcardreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
