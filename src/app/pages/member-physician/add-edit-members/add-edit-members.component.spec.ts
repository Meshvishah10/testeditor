import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditMembersComponent } from './add-edit-members.component';

describe('AddEditMembersComponent', () => {
  let component: AddEditMembersComponent;
  let fixture: ComponentFixture<AddEditMembersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditMembersComponent]
    });
    fixture = TestBed.createComponent(AddEditMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
