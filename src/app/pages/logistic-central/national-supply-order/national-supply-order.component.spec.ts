import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalSupplyOrderComponent } from './national-supply-order.component';

describe('NationalSupplyOrderComponent', () => {
  let component: NationalSupplyOrderComponent;
  let fixture: ComponentFixture<NationalSupplyOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalSupplyOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NationalSupplyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
