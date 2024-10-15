import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormWebMasterComponent } from './product-form-web-master.component';

describe('ProductFormWebMasterComponent', () => {
  let component: ProductFormWebMasterComponent;
  let fixture: ComponentFixture<ProductFormWebMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormWebMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductFormWebMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
