import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccessionComponent } from './create-accession.component';

describe('CreateAccessionComponent', () => {
  let component: CreateAccessionComponent;
  let fixture: ComponentFixture<CreateAccessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAccessionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateAccessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
