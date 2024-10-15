import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNpiRequestComponent } from './view-npi-request.component';

describe('ViewNpiRequestComponent', () => {
  let component: ViewNpiRequestComponent;
  let fixture: ComponentFixture<ViewNpiRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewNpiRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewNpiRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
