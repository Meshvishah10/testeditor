import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSupplyOrderComponent } from './detail-supply-order.component';

describe('DetailSupplyOrderComponent', () => {
  let component: DetailSupplyOrderComponent;
  let fixture: ComponentFixture<DetailSupplyOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSupplyOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailSupplyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
