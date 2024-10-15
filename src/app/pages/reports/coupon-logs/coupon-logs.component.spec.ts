import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponLogsComponent } from './coupon-logs.component';

describe('CouponLogsComponent', () => {
  let component: CouponLogsComponent;
  let fixture: ComponentFixture<CouponLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponLogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CouponLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
