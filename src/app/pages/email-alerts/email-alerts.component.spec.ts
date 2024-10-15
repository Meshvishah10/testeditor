import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailAlertsComponent } from './email-alerts.component';

describe('EmailAlertsComponent', () => {
  let component: EmailAlertsComponent;
  let fixture: ComponentFixture<EmailAlertsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailAlertsComponent]
    });
    fixture = TestBed.createComponent(EmailAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
