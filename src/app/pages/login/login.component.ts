import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Login } from 'src/app/models/general.model';
import { LoginResp } from 'src/app/models/Login.model';
import { ProfileDataService } from 'src/app/services/profiledata.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  // Declare common variables
  loginfrm: any = FormGroup;
  isSubmitted: any = false;
  loginresp: any;
  returnUrl: any;

  visible :any = 'fa fa-eye';

  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    private http: HttpClient,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private dataservice : ProfileDataService
  ) {}

  ngOnInit(): void {
    // Get returnUrl from query parameters or set it to '/'
    this.returnUrl =
      this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    this.isSubmitted = false;

    // Create login form with form controls and validators
    this.loginfrm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: '',
    });

    // If 'remember' cookie is set to 'true', pre-fill the form fields
    if (this.cookieService.get('remember') == 'true') {
      this.loginfrm.reset({
        username: this.common.Decrypt(this.cookieService.get('username')),
        password: this.common.Decrypt(this.cookieService.get('password')),
        remember: this.cookieService.get('remember'),
      });
    }
  }

  // Getters for easy access to form controls
  get f() {
    return this.loginfrm.controls;
  }

  // Submit login form
  onSubmit() {
    this.isSubmitted = true;
    if (this.loginfrm.invalid) {
      return;
    } else {
      // Create the request body for the login API call
      let body: Login = {
        UserName: this.loginfrm.value.username,
        Password: this.loginfrm.value.password,
      };

      // Call the login API
      this.api.callApi(
        this.constant.Login,
        body,
        'POST',
        false,
        false
      ).subscribe(
        (res: any) => {
          var resp: LoginResp = res;
          // Check if login was successful
          if (resp && resp?.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            // Store user information in local storage
            localStorage.setItem('accessToken', resp.AccessToken);
            localStorage.setItem(
              'username',
              this.common.Encrypt(resp.UserName)
            );
            localStorage.setItem('profileImage', this.common.Encrypt(resp.LogoURL));
            localStorage.setItem('fullname', this.common.Encrypt(resp.FullName));
            localStorage.setItem('email', this.common.Encrypt(resp.Email));
            localStorage.setItem('userid', resp.UserId);
            this.dataservice.setProfileData(resp);
            // Remember user credentials using cookies if 'remember' is checked
            if (
              this.loginfrm.value.remember == true ||
              this.loginfrm.value.remember == 'true'
            ) {
              this.cookieService.set(
                'username',
                this.common.Encrypt(this.loginfrm.value.username),
                90
              );
              this.cookieService.set(
                'password',
                this.common.Encrypt(this.loginfrm.value.password),
                90
              );
              this.cookieService.set('remember', 'true', 90);

          } else {
            // Display error message if login was unsuccessful
            // this.toastr.error(res, 'Access Med Lab');
          }
               // call Get Menu List Permission Function
               this.api.callApi(
                this.constant.GetMenuList,
                [],
                "GET",
                true,
                true 
              ).subscribe((res:any)=>{
              localStorage.setItem('permission',this.common.Encrypt(res));
              // console.log("Getting resp", res);
              // Redirect to the specified returnUrl or default to '/lab/dashboard'
              if (this.returnUrl != '/' && this.returnUrl != '') {
                this.router.navigate([this.returnUrl]);
              } else {
                this.router.navigate(['/lab/dashboard']);
              }
              })
            } else {
              // Clear cookies if 'remember' is not checked
              this.cookieService.set('username', '', 90);
              this.cookieService.set('password', '', 90);
              this.cookieService.set('remember', '', 90);
            }
        },
        (err: any) => {
          // Display error message for API call failures
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }
  }

  changeicon(){
    this.visible = this.visible == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
 }
}
