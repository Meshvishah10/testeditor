import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailPasswordComponent } from './email-password.component';

describe('EmailPasswordComponent', () => {
  let component: EmailPasswordComponent;
  let fixture: ComponentFixture<EmailPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailPasswordComponent]
    });
    fixture = TestBed.createComponent(EmailPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
