import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrPrintComponent } from './emr-print.component';

describe('EmrPrintComponent', () => {
  let component: EmrPrintComponent;
  let fixture: ComponentFixture<EmrPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmrPrintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmrPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
