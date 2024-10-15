import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-add-specimen',
  templateUrl: './add-specimen.component.html',
  styleUrl: './add-specimen.component.scss'
})
export class AddSpecimenComponent {
  isSubmitted:any
  specimenForm: any = FormGroup;
  permission:any
  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {}
  ngOnInit(): void {
    this.isSubmitted = false;
    // Get permissions from local storage
   
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 34;
    });
    if (this.permission?.MenuPermission.Add !== true) {
      this.router.navigate(['/lab/dashboard']);
    }
   
    this.specimenForm = this.formBuilder.group({ 
      PatientFirstName:['', [Validators.required]],
      PatientLastName: ['', [Validators.required]], 
      Client: [''], 
      Physician: [''], 
      Sampletype : [''], 
      Poc: [''], 
      Courier: [''], 
      Expectedtoreceive: [''], 
      Reason: [''], 
      });
    
  }
  get f() { return this.specimenForm.controls; }
  
  onSubmit(){
    this.isSubmitted = true;
    if (this.specimenForm.invalid) { 
      return;
    }else{
    // Use this 'body' object in your HTTP request

      let body :any= {
        PatientFirstName: this.specimenForm.value.PatientFirstName,
        PatientLastName: this.specimenForm.value.PatientLastName,
        Client: this.specimenForm.value.Client,
        Physician: this.specimenForm.value.Physician,
        Sampletype: this.specimenForm.value.Sampletype,
        Poc: this.specimenForm.value.Poc,
        Courier: this.specimenForm.value.Courier,
        Expectedtoreceive: this.specimenForm.value.Expectedtoreceive,
        Reason: this.specimenForm.value.Reason,
      }; 
    //  console.log(body)
   
      this.api
      .callApi(this.constant.Specimen, body,'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res; 
          this.isSubmitted = false;
          this.specimenForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
      
          this.router.navigate(['/lab/follow-up/discard-specimen/view', this.common.EncryptID(resp?.Id) ]);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );

    }
  }
}
