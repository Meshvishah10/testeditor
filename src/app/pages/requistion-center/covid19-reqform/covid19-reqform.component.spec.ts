import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Covid19ReqformComponent } from './covid19-reqform.component';

describe('Covid19ReqformComponent', () => {
  let component: Covid19ReqformComponent;
  let fixture: ComponentFixture<Covid19ReqformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Covid19ReqformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Covid19ReqformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
