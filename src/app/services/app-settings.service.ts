import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, LOCALE_ID } from '@angular/core';
import { AppSettings } from '../models/app_settings.model';

@Injectable({
  providedIn: 'root',
})

/**
 * @name: AppSettingsService
 * @description: Service will read application settings from app_settings.json file
 *  This will load application settings to AppSettingsService
 *  This will provide methods to get apiUrl, cdnPath and siteKey
 */
export class AppSettingsService {
  static settings:AppSettings;
  fileName = '/app_settings.json';

  /**
   * @description: Constructor will inject dependant services
   * @param http HttpClient service will be used for communicating with api
   */
  constructor(public http: HttpClient) {}

/**
 * @description: this will return apiurl
 */
static pubkey(): string {
      if (AppSettingsService.settings) {
      return AppSettingsService.settings.pubkey
    }
    return '';
  }

  static ivarray(): string {
    if (AppSettingsService.settings) {
    return AppSettingsService.settings.ivarray
  }
  return '';
}

  static apiUrl(): string {
    if (AppSettingsService.settings) {
    return AppSettingsService.settings.apiUrl
  }
  return '';
}

static CountryId(): Number {
  if (AppSettingsService.settings) {
  return AppSettingsService.settings.USACountryId
}
return 0;
}

static AppId(): string {
  if(AppSettingsService.settings){
    return AppSettingsService.settings.appId
  }
  return '';
}

static appRegion(): string {
  if(AppSettingsService.settings){
    return AppSettingsService.settings.appRegion
  }
  return '';
}


static authKey(): string {
  if(AppSettingsService.settings){
    return AppSettingsService.settings.authKey
  }
  return '';
}

static widgetId(): string {
  if(AppSettingsService.settings){
    return AppSettingsService.settings.widgetId
  }
  return '';
}

  /**
   * @description: This function will load the application setting
   */
  load() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.get(this.fileName, { headers })
      .toPromise()
      .then((response: any) => {
        AppSettingsService.settings = response;
      })
      .catch((error: any) => {
        throw new Error('Could not load file ' + this.fileName + ': ' + JSON.stringify(error));
      });
  }
}
