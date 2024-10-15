import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolutionCenterComponent } from './resolution-center.component';

describe('ResolutionCenterComponent', () => {
  let component: ResolutionCenterComponent;
  let fixture: ComponentFixture<ResolutionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolutionCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResolutionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
