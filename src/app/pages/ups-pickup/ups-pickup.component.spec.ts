import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsPickupComponent } from './ups-pickup.component';

describe('UpsPickupComponent', () => {
  let component: UpsPickupComponent;
  let fixture: ComponentFixture<UpsPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpsPickupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpsPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
