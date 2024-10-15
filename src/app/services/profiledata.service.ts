import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileDataService {
  private profileData = new BehaviorSubject<any>(null);
  currentProfileData = this.profileData.asObservable();

  constructor() {}
  
  setProfileData(data: any) {
    this.profileData.next(data);
  }
}
