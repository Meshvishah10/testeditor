import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-npi-request',
  templateUrl: './npi-request.component.html',
  styleUrl: './npi-request.component.scss'
})
export class NpiRequestComponent {
  npiReqForm:any
  isSubmitted:boolean=false
  permission:any
  StateList:any
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
    const phonemask = /^\(\d{3}\)-\d{3}-\d{4}$/;
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));  
    this.permission = permissions.find((item: any) => {
      return item.Type == 63;
    });
    if (this.permission.MenuPermission.Add !== true) {
      this.router.navigate(['/lab/dashboard']);
    }else{
      this.getStateList()
    } 

    this.npiReqForm = this.formBuilder.group({     
      PatientFirstName:['',Validators.required],
      PatientLastName: ['',Validators.required],
      AccessionNumber:['',Validators.required],
      ClientChecked: false,
      ClientonFileCheck: false,
      ClientFacility: [''],
      ClientAddress: [''],
      ClientCity: [''],
      ClientZip: [''],
      ClientStateId: [''],
      ClientSuiteNumber: [''],
      ClientTelephone: ['',[Validators.pattern(phonemask)]],
      ClientFax: ['',[Validators.pattern(phonemask)]],
      PhysicianChecked: false,
      PhysicianonFileCheck: false,
      DrFirstName: [''],
      DrLastName: [''],
      Npi: [''],
      Note: ['']
    });
  } 
  getStateList(){
    this.api.callApi(
      this.constant.GetStateList+'?inputRequest='+encodeURIComponent(this.common.Encrypt(AppSettingsService.CountryId() )),
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.StateList=res;
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  } 
  get f() { return this.npiReqForm.controls; }

  onSubmit(){
    this.isSubmitted = true;
    if (this.npiReqForm.invalid) {   
      return;
    }
    
    let body = {

      PatientFirstName: this.npiReqForm.value.PatientFirstName,
      PatientLastName: this.npiReqForm.value.PatientLastName,
      AccessionNumber: this.npiReqForm.value.AccessionNumber,
      ClientChecked: this.npiReqForm.value.ClientChecked,
      ClientonFileCheck: this.npiReqForm.value.ClientonFileCheck,
      ClientFacility: this.npiReqForm.value.ClientFacility,
      ClientAddress: this.npiReqForm.value.ClientAddress,
      ClientCity: this.npiReqForm.value.ClientCity,
      ClientZip: this.npiReqForm.value.ClientZip,
      ClientStateId: this.npiReqForm.value.ClientStateId,
      ClientSuiteNumber: this.npiReqForm.value.ClientSuiteNumber,
      ClientTelephone: this.npiReqForm.value.ClientTelephone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      ClientFax: this.npiReqForm.value.ClientFax.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      PhysicianChecked: this.npiReqForm.value.PhysicianChecked,
      PhysicianonFileCheck: this.npiReqForm.value.PhysicianonFileCheck,
      DrFirstName: this.npiReqForm.value.DrFirstName,
      DrLastName: this.npiReqForm.value.DrLastName,
      Npi: this.npiReqForm.value.Npi,
      Note: this.npiReqForm.value.Note
    };
    
    //console.log(body,"body")
      this.api
      .callApi(this.constant.commonNPIRequest, body , 'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.npiReqForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.router.navigate(['/lab/ticket-resolution/npi-request/view', this.common.EncryptID(resp?.Id) ]);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  
  }
  }

