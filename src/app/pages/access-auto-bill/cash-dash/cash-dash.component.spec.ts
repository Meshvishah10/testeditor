import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDashComponent } from './cash-dash.component';

describe('CashDashComponent', () => {
  let component: CashDashComponent;
  let fixture: ComponentFixture<CashDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashDashComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CashDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
