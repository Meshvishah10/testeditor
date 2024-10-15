import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSupplyOrderComponent } from './add-edit-supply-order.component';

describe('AddEditSupplyOrderComponent', () => {
  let component: AddEditSupplyOrderComponent;
  let fixture: ComponentFixture<AddEditSupplyOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditSupplyOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditSupplyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
