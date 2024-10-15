import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';


@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent implements OnInit {
  @Input() title: string = 'Validate Authentication';
  @Input() message: string = 'Are you sure?';

  authfrm: any = FormGroup;
  isSubmitted: any = false;
  loginresp: any;
  visible :any = 'fa fa-eye';

  constructor(public activeModal: NgbActiveModal,
              private api: ApiService,
              private constant: ConstantService,
              private formBuilder: FormBuilder,
              private common: CommonService,
              private toastr: ToastrService,
              ) {}

  ngOnInit(): void {
    this.isSubmitted = false;

    // Regular expression for password validation
    // const passregex =
    //   '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$';

    // Create login form with form controls and validators
    this.authfrm = this.formBuilder.group({
      password: ['', [Validators.required]],
    });
  }

  // Getters for easy access to form controls
  get f() {
    return this.authfrm.controls;
  }


   // Submit login form
   onSubmit() {
    this.isSubmitted = true;
    if (this.authfrm.invalid) {
      return;
    } else {
      // Create the request body for the login API call
      let body = {
        UserName: this.common.Decrypt(localStorage.getItem('username')),
        Password: this.authfrm.value.password,
      };
      // console.log("Getting Body", body)
      // Call the login API
      this.api.callApi(
        this.constant.ValidateCredential,
        body,
        'POST',
        true,
        true
      ).subscribe(
        (res: any) => {
          var resp = res;
          if(res.Status == 1){
          this.activeModal.close('Yes');
          }
        },(err:any)=>{
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        })
    }
   }

   changeicon(){
      this.visible = this.visible == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
   }

  onCancel() {
    // this.cancel.emit();
    this.activeModal.close('No');
  }

}
