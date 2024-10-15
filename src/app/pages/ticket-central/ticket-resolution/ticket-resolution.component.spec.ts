import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketResolutionComponent } from './ticket-resolution.component';

describe('TicketResolutionComponent', () => {
  let component: TicketResolutionComponent;
  let fixture: ComponentFixture<TicketResolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicketResolutionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TicketResolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
