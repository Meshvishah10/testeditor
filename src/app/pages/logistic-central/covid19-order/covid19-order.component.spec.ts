import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Covid19OrderComponent } from './covid19-order.component';

describe('Covid19OrderComponent', () => {
  let component: Covid19OrderComponent;
  let fixture: ComponentFixture<Covid19OrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Covid19OrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Covid19OrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
