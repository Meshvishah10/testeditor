import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDuplicateTestComponent } from './delete-duplicate-test.component';

describe('DeleteDuplicateTestComponent', () => {
  let component: DeleteDuplicateTestComponent;
  let fixture: ComponentFixture<DeleteDuplicateTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteDuplicateTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteDuplicateTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
