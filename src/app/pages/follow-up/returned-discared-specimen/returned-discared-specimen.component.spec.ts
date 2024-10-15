import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnedDiscaredSpecimenComponent } from './returned-discared-specimen.component';

describe('ReturnedDiscaredSpecimenComponent', () => {
  let component: ReturnedDiscaredSpecimenComponent;
  let fixture: ComponentFixture<ReturnedDiscaredSpecimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnedDiscaredSpecimenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnedDiscaredSpecimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
