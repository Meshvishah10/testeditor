import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSalesEmrComponent } from './create-sales-emr.component';

describe('CreateSalesEmrComponent', () => {
  let component: CreateSalesEmrComponent;
  let fixture: ComponentFixture<CreateSalesEmrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSalesEmrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSalesEmrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
