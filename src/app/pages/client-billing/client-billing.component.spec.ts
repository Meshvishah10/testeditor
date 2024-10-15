import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBillingComponent } from './client-billing.component';

describe('ClientBillingComponent', () => {
  let component: ClientBillingComponent;
  let fixture: ComponentFixture<ClientBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientBillingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
