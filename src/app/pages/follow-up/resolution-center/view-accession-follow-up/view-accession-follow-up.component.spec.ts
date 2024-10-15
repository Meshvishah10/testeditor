import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccessionFollowUpComponent } from './view-accession-follow-up.component';

describe('ViewAccessionFollowUpComponent', () => {
  let component: ViewAccessionFollowUpComponent;
  let fixture: ComponentFixture<ViewAccessionFollowUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAccessionFollowUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAccessionFollowUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
