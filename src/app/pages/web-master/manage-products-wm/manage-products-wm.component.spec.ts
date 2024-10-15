import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProductsWmComponent } from './manage-products-wm.component';

describe('ManageProductsWmComponent', () => {
  let component: ManageProductsWmComponent;
  let fixture: ComponentFixture<ManageProductsWmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageProductsWmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageProductsWmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
