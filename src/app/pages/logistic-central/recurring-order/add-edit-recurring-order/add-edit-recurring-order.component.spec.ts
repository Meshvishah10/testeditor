import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRecurringOrderComponent } from './add-edit-recurring-order.component';

describe('AddEditRecurringOrderComponent', () => {
  let component: AddEditRecurringOrderComponent;
  let fixture: ComponentFixture<AddEditRecurringOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditRecurringOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditRecurringOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
