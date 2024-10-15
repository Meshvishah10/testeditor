import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAddOnComponent } from './create-add-on.component';

describe('CreateAddOnComponent', () => {
  let component: CreateAddOnComponent;
  let fixture: ComponentFixture<CreateAddOnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAddOnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateAddOnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
