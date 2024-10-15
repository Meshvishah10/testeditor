import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringOrderComponent } from './recurring-order.component';

describe('RecurringOrderComponent', () => {
  let component: RecurringOrderComponent;
  let fixture: ComponentFixture<RecurringOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecurringOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
