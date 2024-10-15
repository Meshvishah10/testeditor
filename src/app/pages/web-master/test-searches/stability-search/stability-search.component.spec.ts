import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StabilitySearchComponent } from './stability-search.component';

describe('StabilitySearchComponent', () => {
  let component: StabilitySearchComponent;
  let fixture: ComponentFixture<StabilitySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StabilitySearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StabilitySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
