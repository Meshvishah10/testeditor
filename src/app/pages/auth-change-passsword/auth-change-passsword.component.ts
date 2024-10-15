import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auth-change-passsword',
  templateUrl: './auth-change-passsword.component.html',
  styleUrl: './auth-change-passsword.component.scss'
})
export class AuthChangePassswordComponent {
  // Declare Common Variables
  changePassfrm: any = FormGroup;
  isSubmitted: any = false;
  apiresp: any;

  visible :any = 'fa fa-eye';
  visible1 :any = 'fa fa-eye';
  visible2 :any = 'fa fa-eye';

  constructor(private api: ApiService, private constant: ConstantService, public activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private common: CommonService, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
    this.isSubmitted = false;
    const passregex = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$";
    // Create Change Password Form
    this.changePassfrm = this.formBuilder.group({
      oldpassword: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(passregex)]],
      cnfirmPass: ['', [Validators.required, Validators.pattern(passregex), confirmPasswordValidator]]
    }, { validator: this.passwordMatchValidator });
  }

  // Check Password and confirm password match or not
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('cnfirmPass');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  // Cancel Button Click Event
  CancelbtnClick() {
    this.changePassfrm.reset();
    this.isSubmitted = false;
  }

  // Getter for Form Controls
  get f() { return this.changePassfrm.controls; }

  // Submit Button Click Event
  onSubmit() {
    this.isSubmitted = true;
    if (this.changePassfrm.invalid) {
      return;
    } else {
      let accessToken = localStorage.getItem('accessToken')
      let body = {
        AccessToken: accessToken,
        OldPassword: this.changePassfrm.value.oldpassword,
        NewPassword: this.changePassfrm.value.password
      };
      // Call API to Change Password
      this.api.callApi(
        this.constant.AuthChangePassword,
        body,
        "PUT",
        false,
        false
      ).subscribe((res: any) => {
        var resp = res;
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.changePassfrm.reset();
        this.isSubmitted = false;
        localStorage.clear();
        this.router.navigateByUrl('/login');
      }, (err: any) => {
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

  changeicon2(){
    this.visible2 = this.visible2 == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
  }

}

// Custom Validator for Confirm Password
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