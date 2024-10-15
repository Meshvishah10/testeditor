import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTicktesComponent } from './create-ticktes.component';

describe('CreateTicktesComponent', () => {
  let component: CreateTicktesComponent;
  let fixture: ComponentFixture<CreateTicktesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateTicktesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateTicktesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
