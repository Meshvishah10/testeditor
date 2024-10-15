import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberPhysicianComponent } from './member-physician.component';

describe('MemberPhysicianComponent', () => {
  let component: MemberPhysicianComponent;
  let fixture: ComponentFixture<MemberPhysicianComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberPhysicianComponent]
    });
    fixture = TestBed.createComponent(MemberPhysicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
