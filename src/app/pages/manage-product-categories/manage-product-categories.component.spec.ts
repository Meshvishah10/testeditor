import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProductCategoriesComponent } from './manage-product-categories.component';

describe('ManageProductCategoriesComponent', () => {
  let component: ManageProductCategoriesComponent;
  let fixture: ComponentFixture<ManageProductCategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageProductCategoriesComponent]
    });
    fixture = TestBed.createComponent(ManageProductCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
