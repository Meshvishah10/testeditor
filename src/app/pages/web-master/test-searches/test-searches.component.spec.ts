import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSearchesComponent } from './test-searches.component';

describe('TestSearchesComponent', () => {
  let component: TestSearchesComponent;
  let fixture: ComponentFixture<TestSearchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSearchesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestSearchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
