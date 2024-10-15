import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsPickupLogsComponent } from './ups-pickup-logs.component';

describe('UpsPickupLogsComponent', () => {
  let component: UpsPickupLogsComponent;
  let fixture: ComponentFixture<UpsPickupLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpsPickupLogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpsPickupLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
