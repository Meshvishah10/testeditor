import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesCentralComponent } from './sales-central.component';

describe('SalesCentralComponent', () => {
  let component: SalesCentralComponent;
  let fixture: ComponentFixture<SalesCentralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesCentralComponent]
    });
    fixture = TestBed.createComponent(SalesCentralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
