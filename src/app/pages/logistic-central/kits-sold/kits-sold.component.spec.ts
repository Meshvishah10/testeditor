import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitsSoldComponent } from './kits-sold.component';

describe('KitsSoldComponent', () => {
  let component: KitsSoldComponent;
  let fixture: ComponentFixture<KitsSoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitsSoldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KitsSoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
