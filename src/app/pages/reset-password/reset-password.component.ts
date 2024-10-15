import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { forgotpassword } from 'src/app/models/general.model';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  // Declare Common Variables
  forgotPassfrm:any= FormGroup; // Form group for the reset password form
  isSubmitted: boolean = false; // Flag to track whether the form is submitted
  apiresp: any; // Variable to store API response

  // Constructor to inject dependencies
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

  // Lifecycle hook called after component initialization
  ngOnInit(): void {
    this.isSubmitted = false;
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    // Initialize the form with email field and validation rules
    this.forgotPassfrm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(emailregex)]],
    });
  }

  // Getter method to easily access form controls in the template
  get f() { return this.forgotPassfrm.controls; }

  // Method to handle form submission
  onSubmit() {
    this.isSubmitted = true;
    
    // Check if the form is invalid
    if (this.forgotPassfrm.invalid) {
      return;
    } else {
      // Prepare the request body using the forgotpassword model
      let body: forgotpassword = {
        Email: this.forgotPassfrm.value.username
      };

      // Call the API for password reset
      this.api.callApi(
        this.constant.ForgotPassword,
        body,
        'POST',
        false,
        false
      ).subscribe((res: any) => {
        var resp = res;
        // Display success message and reset the form
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.forgotPassfrm.reset();
        // Navigate to the login page
        this.router.navigate(['/login']);
      }, (err: any) => {
        // Display error message in case of API error
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      });
    }
  }
}
