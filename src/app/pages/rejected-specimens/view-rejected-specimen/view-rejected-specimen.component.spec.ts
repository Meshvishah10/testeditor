import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRejectedSpecimenComponent } from './view-rejected-specimen.component';

describe('ViewRejectedSpecimenComponent', () => {
  let component: ViewRejectedSpecimenComponent;
  let fixture: ComponentFixture<ViewRejectedSpecimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRejectedSpecimenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRejectedSpecimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
