import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewdatastageComponent } from './viewdatastage.component';

describe('ViewdatastageComponent', () => {
  let component: ViewdatastageComponent;
  let fixture: ComponentFixture<ViewdatastageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewdatastageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewdatastageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
