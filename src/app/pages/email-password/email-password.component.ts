// Import necessary Angular modules and services
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { codeValidate, resetPassword } from 'src/app/models/general.model';

// Angular Component decorator
@Component({
  selector: 'app-email-password',
  templateUrl: './email-password.component.html',
  styleUrls: ['./email-password.component.scss']
})
export class EmailPasswordComponent {

  // Declare Common Variables
  forgotPassfrm: any = FormGroup;
  isSubmitted: any = false;
  apiresp: any;
  code: any;
  emailid: any = '';
  hasError: any = '';
  visible :any = 'fa fa-eye';
  visible1 :any = 'fa fa-eye';

  // Constructor to inject services and dependencies
  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    private http: HttpClient,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService
  ) { }

  // Angular OnInit lifecycle hook
  ngOnInit(): void {
    this.isSubmitted = false;

    // Get the 'code' parameter from the route
    this.code = this.activatedRoute.snapshot.params['code'];

    // Regular expression for password validation
    const passregex = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$";

    // Create the form group with password and confirm password controls
    this.forgotPassfrm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern(passregex)]],
      cnfirmPass: ['', [Validators.required, Validators.pattern(passregex), confirmPasswordValidator]]
    }, { validator: this.passwordMatchValidator });

    // Set model to code Validate in Request
    let body: codeValidate = {
      Code: this.code
    };

    // Check if the code is valid or not
    this.api.callApi(
      this.constant.ResetCodeVerify + '?inputRequest=' + encodeURIComponent(this.common.Encrypt(body)),
      [],
      "GET",
      false,
      false
    ).subscribe((res: any) => {
      // console.log("Getting resp", res);
      this.emailid = res.Response;
      this.hasError = '';
    }, (err: any) => {
      this.hasError = err.error.errors[0].message;
      // console.log(err.error.errors[0].message);
    });
  }

  // Custom validator function to check if passwords match
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('cnfirmPass');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  // Getter for easy access to form controls
  get f() { return this.forgotPassfrm.controls; }

  // Form submission function
  onSubmit() {
    this.isSubmitted = true;
    if (this.forgotPassfrm.invalid) {
      return;
    } else {
      let body: resetPassword = {
        Email: this.emailid,
        Password: this.forgotPassfrm.value.password,
        Code: this.code
      };

      // Call the API to reset the password
      this.api.callApi(
        this.constant.ResetPassword,
        body,
        "PUT",
        false,
        false
      ).subscribe((res: any) => {
        var resp = res;
        // console.log("Getting response", resp);
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.forgotPassfrm.reset();
        this.router.navigate(['/login']);
      }, (err: any) => {
        // console.log(err);
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      });
    }
  }

  changeicon(){
    this.visible = this.visible == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
 }

 changeicon1(){
  this.visible1 = this.visible1 == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
}
}

// Custom validator function for confirming password
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('cnfirmPass');

  if (!password || !passwordConfirm) {
    return null;
  }

  if (passwordConfirm.value === '') {
    return null;
  }

  if (password.value === passwordConfirm.value) {
    return null;
  }

  return { 'passwordsNotMatching': true };
};
