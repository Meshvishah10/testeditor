import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInfoDetailsComponent } from './patient-info-details.component';

describe('PatientInfoDetailsComponent', () => {
  let component: PatientInfoDetailsComponent;
  let fixture: ComponentFixture<PatientInfoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientInfoDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientInfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
