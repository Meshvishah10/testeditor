import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-additional-correspondence',
  templateUrl: './additional-correspondence.component.html',
  styleUrl: './additional-correspondence.component.scss'
})
export class AdditionalCorrespondenceComponent {
 
  correspondenceForm:any
  isSubmitted:boolean=false
  permission:any
  categoryList:any
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
      return item.Type == 62;
    });

    if (this.permission.MenuPermission.Add !== true) {
      this.router.navigate(['/lab/dashboard']);
    } 
    
    this.getCommonList()
   
    this.correspondenceForm = this.formBuilder.group({
      Category:['',Validators.required],
      PatientFirstName:['',Validators.required],
      PatientLastName: ['',Validators.required],
      AccessionNumber:['',Validators.required],
      DoctorChecked :false,
      Doctors: this.formBuilder.array([]),
      ResultReleaseChecked:false,
      OnSitePickup:false,
      MailResult :false,
      LicenceVerified:false,
      PatientSignature:false,
      EmployeeSignature:false,
      Note :['']    
    });
    this.addPanelOption() 
  } 
  
  get panelOptionsFormArray() {
    return this.correspondenceForm.get('Doctors') as FormArray;
  }

  addPanelOption() {
    return this.panelOptionsFormArray.get('Doctors') as FormArray;
  }
  add(){
    const newDoctorGroup = this.formBuilder.group({
      DoctorName: ['', Validators.required],
      Fax: ['']
    });
    this.panelOptionsFormArray.push(newDoctorGroup);
  }
  toggleDoctorFields(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      const newDoctorGroup = this.formBuilder.group({
        DoctorName: ['', Validators.required],
        Fax: ['']
      });
      this.panelOptionsFormArray.push(newDoctorGroup);
    } else {
      while (this.panelOptionsFormArray.length !== 0) {
        this.panelOptionsFormArray.removeAt(0);
      }
    }
  }
  
  removePanelOption(index: number) {
    this.panelOptionsFormArray.removeAt(index);
  }
  get f() { return this.correspondenceForm.controls; }
  getCommonList(){
    this.api.callApi(
      this.constant.MasterDetails,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.categoryList= res?.CategoryList
    },(err:any)=>{
      this.categoryList=[]
      // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })

  }
  onSubmit(){
    this.isSubmitted = true;
    if (this.correspondenceForm.invalid) { 
      
      return;
    }else{
     // Use this 'body' object in your HTTP request
     let doctorsArray = this.correspondenceForm.value.Doctors.map((doctor:any) => {
      return {
        DoctorName: doctor.DoctorName,
        Fax: doctor.Fax
      };
    });
    
    let body = {
      Category: this.correspondenceForm.value.Category,
      PatientFirstName: this.correspondenceForm.value.PatientFirstName,
      PatientLastName: this.correspondenceForm.value.PatientLastName,
      AccessionNumber: this.correspondenceForm.value.AccessionNumber,
      DoctorChecked: this.correspondenceForm.value.DoctorChecked,
      Doctors: doctorsArray,
      ResultReleaseChecked: this.correspondenceForm.value.ResultReleaseChecked,
      OnSitePickup: this.correspondenceForm.value.OnSitePickup,
      MailResult: this.correspondenceForm.value.MailResult,
      LicenceVerified: this.correspondenceForm.value.LicenceVerified,
      PatientSignature: this.correspondenceForm.value.PatientSignature,
      EmployeeSignature: this.correspondenceForm.value.EmployeeSignature,
      Note: this.correspondenceForm.value.Note
    };
    

      this.api
      .callApi(this.constant.commonCorrespondence, body , 'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.correspondenceForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.router.navigate(['/lab/follow-up/resolution-center/correspondence/view/', this.common.EncryptID(resp?.Id) ]);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  
    }
  }
}
