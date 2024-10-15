import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedSpecimensComponent } from './rejected-specimens.component';

describe('RejectedSpecimensComponent', () => {
  let component: RejectedSpecimensComponent;
  let fixture: ComponentFixture<RejectedSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedSpecimensComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectedSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
