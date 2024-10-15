import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDuplicateTestComponent } from './view-duplicate-test.component';

describe('ViewDuplicateTestComponent', () => {
  let component: ViewDuplicateTestComponent;
  let fixture: ComponentFixture<ViewDuplicateTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDuplicateTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDuplicateTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
