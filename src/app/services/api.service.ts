import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { ConstantService } from './constant.service';
import { catchError, finalize, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { CommonService } from 'src/app/services/common.service';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = AppSettingsService.apiUrl();

  constructor(
    private http: HttpClient,
    private constant: ConstantService,
    private router: Router,
    private common: CommonService,
    private loaderService: LoaderService
  ) {}

  // Static method - this should probably be an instance method, not static
  static callApi(arg0: string, arg1: undefined[], arg2: string, arg3: boolean, arg4: boolean, arg5: boolean) {
    throw new Error('Method not implemented.');
  }

  // HTTP POST request with encryption and token
  POST_API(endpoint: any, body: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      })
    };
    let encBody = {
      inputRequest: this.common.Encrypt(body)
    };
    return this.http.post(this.baseUrl + endpoint, encBody, httpOptions);
  }

  // HTTP GET request with token
  GET_API(endpoint: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      })
    };
    return this.http.get(this.baseUrl + endpoint, httpOptions);
  }

  // HTTP GET request with a request body
  GET_API_body(endpoint: any, body: any): Observable<any> {
    return this.http.get(this.baseUrl + endpoint, body);
  }

  // HTTP PUT request with encryption and token
  PUT_API(endpoint: any, body: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      })
    };
    let encBody = {
      inputRequest: this.common.Encrypt(body)
    };
    return this.http.put(this.baseUrl + endpoint, encBody, httpOptions);
  }

  // HTTP DELETE request with token
  DELETE_API(endpoint: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      })
    };
    return this.http.delete(this.baseUrl + endpoint, httpOptions);
  }

  // Upload file with token
  uploadFile(endpoint: any, files: any): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
      })
    };
    return this.http.post(this.baseUrl + endpoint, files, httpOptions);
  }

  // Logging helper method
  private logging(requestUrl: any, requestType: any): void {
    // console.log(`Request URL => ${this.baseUrl}${requestUrl}`);
    // console.log(`Request Type => ${requestType}`);
    // console.log(`Token => ${localStorage.getItem('accessToken')}`);
  }

  // Header initialization method
  private headerInit(): HttpHeaders {
    let headers: any = new HttpHeaders();
    if (window.localStorage.getItem('accessToken') != null) {
      headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
    }
    return headers;
  }

  // Show loader method
  showLoader(isShowLoading: any): void {
    if (isShowLoading) {
      // this.spinner.start()
    }
  }

  // Dismiss loader method
  dismissLoader(): void {
    // this.spinner.stop()
  }

  // Generic API call method
  callApi(
    requestUrl: any,
    requestParams: any,
    requestType: any,
    log: Boolean,
    passHeaderToken: Boolean,
  ): any {
    this.loaderService.show();

    let headers: any
    passHeaderToken ? headers = this.headerInit() : null;
    log ? this.logging(requestUrl, requestType) : null;

    // Determine the request type and call the corresponding method
    if (requestType == 'GET') {
      return this.callGETRequest(requestUrl, requestParams, headers);
    }

    if (requestType == 'POST') {
      let encBody = {
        inputRequest: this.common.Encrypt(requestParams)
      };
      return this.callPOSTRequest(requestUrl, encBody, headers);
    }

    if (requestType == 'PUT') {
      let encBody = {
        inputRequest: this.common.Encrypt(requestParams)
      };
      return this.callPUTRequest(requestUrl, encBody, headers);
    }

    if (requestType == 'PATCH') {
      let encBody = {
        inputRequest: this.common.Encrypt(requestParams)
      };
      return this.callPATCHRequest(requestUrl, encBody, headers);
    }

    if (requestType == 'DELETE') {
      return this.callDELETERequest(requestUrl, headers);
    }
  }

  // DELETE request method
  private callDELETERequest(requestUrl: any, headers: HttpHeaders): Observable<any> {
    return this.http
      .delete<any>(this.baseUrl + requestUrl, { headers })
      .pipe(
        finalize((): void => {
          this.loaderService.hide();
        }),
        map((res: any): any => {
          this.loaderService.hide();
          let resp= this.common.Decrypt(res);
          if(resp && resp?.Status == -1){
            this.router.navigateByUrl('/auth/changepassword');
          }else{
            return this.common.Decrypt(res);
          }
        }),
        catchError(this.handleError('error', []))
      );
  }

  // PUT request method
  private callPUTRequest(requestUrl: any, requestParams: any, headers: HttpHeaders): Observable<any> {
    return this.http
      .put<any>(this.baseUrl + requestUrl, requestParams, {
        headers,
      })
      .pipe(
        finalize((): void => {
          this.loaderService.hide();
        }),
        map((res: any): any => {
          this.loaderService.hide();
          let resp= this.common.Decrypt(res);
          if(resp && resp?.Status == -1){
            this.router.navigateByUrl('/auth/changepassword');
          }else{
            return this.common.Decrypt(res);
          }
        }),
        catchError(this.handleError('error', []))
      );
  }

  // PATCH request method
  private callPATCHRequest(requestUrl: any, requestParams: any, headers: HttpHeaders): Observable<any> {
    return this.http
      .patch<any>(this.baseUrl + requestUrl, requestParams, {
        headers,
      })
      .pipe(
        finalize((): void => {
          this.loaderService.hide();
        }),
        map((res: any): any => {
          this.loaderService.hide();
          let resp= this.common.Decrypt(res);
          if(resp && resp?.Status == -1){
            this.router.navigateByUrl('/auth/changepassword');
          }else{
            return this.common.Decrypt(res);
          }
        }),
        catchError(this.handleError('error', []))
      );
  }

  // POST request method
  private callPOSTRequest(requestUrl: any, requestParams: any, headers: HttpHeaders): Observable<any> {
    return this.http
      .post<any>(this.baseUrl + requestUrl, requestParams, {
        headers,
      })
      .pipe(
        finalize((): void => {
          this.loaderService.hide();
        }),
        map((res: any): any => {
          this.loaderService.hide();
          let resp= this.common.Decrypt(res);
          if(resp && resp?.Status == -1){
            this.router.navigateByUrl('/auth/changepassword');
            if(requestUrl == 'Auth'){
              localStorage.setItem('accessToken', resp.AccessToken);
            }
          }else{
            return this.common.Decrypt(res);
          }
          // console.log("Geting res", this.common.Decrypt(res) , requestUrl);
        }),
        catchError(this.handleError('error', []))
      );
  }

  // GET request method
  private callGETRequest(requestUrl: any, requestParams: any, headers: HttpHeaders): Observable<any> {
    return this.http
      .get<any>(this.baseUrl + requestUrl, { headers })
      .pipe(
        finalize((): void => {
          this.loaderService.hide();
        }),
        map((res: any): any => {
          this.loaderService.hide();
          let resp= this.common.Decrypt(res);
          if(resp && resp?.Status == -1){
            this.router.navigateByUrl('/auth/changepassword');
          }else{
            return this.common.Decrypt(res);
          }
        }),
        catchError(this.handleError('error', []))
      );
  }

  // Error handling method
  private handleError<T>(
    _operation = 'operation',
    _result?: T
  ): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      if (error.status == 401) {
        localStorage.removeItem('accessToken');
        this.router.navigate(['/login']);
      }
      else if(error.status == 402){
        localStorage.removeItem('accessToken');
        this.router.navigate(['/accessdenied']);
      }
      this.loaderService.hide();
      return throwError(error);
    };
  }

  // Custom GET request method
  customGETApi(url: any): Observable<any> {
    return this.http
      .get<any>(url)
      .pipe(
        finalize((): void => {
          this.loaderService.hide();
        }),
        map((res: any): any => {
          this.loaderService.hide();
          return this.common.Decrypt(res);
        }),
        catchError(this.handleError('error', []))
      );
  }
}
