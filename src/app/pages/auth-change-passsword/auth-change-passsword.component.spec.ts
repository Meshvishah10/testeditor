import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthChangePassswordComponent } from './auth-change-passsword.component';

describe('AuthChangePassswordComponent', () => {
  let component: AuthChangePassswordComponent;
  let fixture: ComponentFixture<AuthChangePassswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthChangePassswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthChangePassswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
