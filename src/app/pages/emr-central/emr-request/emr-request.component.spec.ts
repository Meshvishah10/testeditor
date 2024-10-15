import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrRequestComponent } from './emr-request.component';

describe('EmrRequestComponent', () => {
  let component: EmrRequestComponent;
  let fixture: ComponentFixture<EmrRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmrRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmrRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
