import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSocialMediaComponent } from './manage-social-media.component';

describe('ManageSocialMediaComponent', () => {
  let component: ManageSocialMediaComponent;
  let fixture: ComponentFixture<ManageSocialMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSocialMediaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageSocialMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
