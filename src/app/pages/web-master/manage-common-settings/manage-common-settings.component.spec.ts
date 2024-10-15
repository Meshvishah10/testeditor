import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCommonSettingsComponent } from './manage-common-settings.component';

describe('ManageCommonSettingsComponent', () => {
  let component: ManageCommonSettingsComponent;
  let fixture: ComponentFixture<ManageCommonSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCommonSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageCommonSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
