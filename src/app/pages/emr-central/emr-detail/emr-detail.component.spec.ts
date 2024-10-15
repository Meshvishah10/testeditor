import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrDetailComponent } from './emr-detail.component';

describe('EmrDetailComponent', () => {
  let component: EmrDetailComponent;
  let fixture: ComponentFixture<EmrDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmrDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmrDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
