import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEmrRequestComponent } from './new-emr-request.component';

describe('NewEmrRequestComponent', () => {
  let component: NewEmrRequestComponent;
  let fixture: ComponentFixture<NewEmrRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEmrRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewEmrRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
