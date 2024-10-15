import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnTestsComponent } from './add-on-tests.component';

describe('AddOnTestsComponent', () => {
  let component: AddOnTestsComponent;
  let fixture: ComponentFixture<AddOnTestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOnTestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddOnTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
