import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSpecimenComponent } from './view-specimen.component';

describe('ViewSpecimenComponent', () => {
  let component: ViewSpecimenComponent;
  let fixture: ComponentFixture<ViewSpecimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSpecimenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSpecimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
