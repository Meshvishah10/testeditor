import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Covid19ReqdetailComponent } from './covid19-reqdetail.component';

describe('Covid19ReqdetailComponent', () => {
  let component: Covid19ReqdetailComponent;
  let fixture: ComponentFixture<Covid19ReqdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Covid19ReqdetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Covid19ReqdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
