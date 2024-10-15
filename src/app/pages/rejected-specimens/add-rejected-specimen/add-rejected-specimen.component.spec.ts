import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRejectedSpecimenComponent } from './add-rejected-specimen.component';

describe('AddRejectedSpecimenComponent', () => {
  let component: AddRejectedSpecimenComponent;
  let fixture: ComponentFixture<AddRejectedSpecimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRejectedSpecimenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRejectedSpecimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
