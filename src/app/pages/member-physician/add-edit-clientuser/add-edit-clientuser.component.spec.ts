import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditClientuserComponent } from './add-edit-clientuser.component';

describe('AddEditClientuserComponent', () => {
  let component: AddEditClientuserComponent;
  let fixture: ComponentFixture<AddEditClientuserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditClientuserComponent]
    });
    fixture = TestBed.createComponent(AddEditClientuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
