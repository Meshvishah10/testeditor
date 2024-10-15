import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpaccesserrorComponent } from './ipaccesserror.component';

describe('IpaccesserrorComponent', () => {
  let component: IpaccesserrorComponent;
  let fixture: ComponentFixture<IpaccesserrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpaccesserrorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IpaccesserrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
