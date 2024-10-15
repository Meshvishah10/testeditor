import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalCorrespondenceComponent } from './additional-correspondence.component';

describe('AdditionalCorrespondenceComponent', () => {
  let component: AdditionalCorrespondenceComponent;
  let fixture: ComponentFixture<AdditionalCorrespondenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalCorrespondenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdditionalCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
