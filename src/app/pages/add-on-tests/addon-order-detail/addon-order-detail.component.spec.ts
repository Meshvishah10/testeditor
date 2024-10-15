import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonOrderDetailComponent } from './addon-order-detail.component';

describe('AddonOrderDetailComponent', () => {
  let component: AddonOrderDetailComponent;
  let fixture: ComponentFixture<AddonOrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddonOrderDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddonOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
