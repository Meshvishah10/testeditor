import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-add-rejected-specimen',
  templateUrl: './add-rejected-specimen.component.html',
  styleUrl: './add-rejected-specimen.component.scss'
})
export class AddRejectedSpecimenComponent {
  specimenForm:any
  isSubmitted: any = false;
  permission: any;
  departmentList:any = [];
  selectedDepartment:any=[];
  selectReason:any
  departmentresp:any=[];
  rejectedReasonList:any=[]
  // IsDepartment:boolean=false
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
      return item.Type == 18;
    });
     //console.log(permissions);
    //Create Form
    this.specimenForm = this.formBuilder.group({
      Isdepartment: false,
      Patientfirstname: ['',[Validators.required]], // Patient First Name
      Patientlastname: ['',[Validators.required]], // Patient Last Name
      AccessionNumber: ['',[Validators.required]], // Accession Number
      Departmentoption: [''], // Department Option
      RejectionreasonOption:  [''], // Rejection Reason Option
      Paneloptions: this.formBuilder.array([]), // List of Panel Options, initialize as an empty array
      Clientnotificationdate: '', // Client Notification Date
      Clientnotificationnumber: '', // Client Notification Number
      Clientnotificationgiven: '', // Client Notification Given
      Note: ''
    });
   
      if (this.permission.MenuPermission.Add == true) {
        this.getRejectedReasonList();
        this.addPanelOption();
      }
      else{
        this.router.navigate(['/lab/dashboard']);
      }
    
    
  }
  get panelOptionsFormArray() {
    return this.specimenForm.get('Paneloptions') as FormArray;
  }

  addPanelOption() {
    this.panelOptionsFormArray.push(this.formBuilder.control(''));
  }

  removePanelOption(index: number) {
    this.panelOptionsFormArray.removeAt(index);
  }
  get f() { return this.specimenForm.controls; }

  getRejectedReasonList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.rejectedReasonList =  res?.RejectedSpecimenTicketRejectionReasonList
          this.departmentList= res?.RejectedSpecimenTicketDepartmentList
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  
onSubmit(){
  this.isSubmitted = true;
  if (this.specimenForm.invalid) { 
    return;
  }
  // else{
  //  // Use this 'body' object in your HTTP request
  //  this.specimenForm.get('Departmentoption').valueChanges.subscribe((value:any) => {
  //   if (value !== '') {
  //     this.IsDepartment = true; // Set isDepartment flag to true if a department is selected
  //   } else {
  //     this.IsDepartment= false; // Set isDepartment flag to false if no department is selected
  //   }
  // });
    let body = {
      // Isdepartment: this.IsDepartment,
      Departmentoption:this.specimenForm.value.Departmentoption ,
      Patientfirstname:this.specimenForm.value.Patientfirstname, // Patient First Name
      Patientlastname: this.specimenForm.value.Patientlastname, // Patient Last Name
      AccessionNumber: this.specimenForm.value.AccessionNumber, // Accession Number
      RejectionreasonOption: this.specimenForm.value.RejectionreasonOption, // Rejection Reason Option
      Paneloptions: this.specimenForm.value.Paneloptions, // List of Panel Options, initialize as an empty array
      Clientnotificationdate: this.datePipe.transform(this.specimenForm.get('Clientnotificationdate').value, 'MM/dd/yyyy'), // Client Notification Date
      Clientnotificationnumber: this.specimenForm.value.Clientnotificationnumber, // Client Notification Number
      Clientnotificationgiven: this.specimenForm.value.Clientnotificationgiven, // Client Notification Given
   
    }; 
    this.api
    .callApi(this.constant.specimenCommon, body , 'POST', true, true)
    .subscribe(
      (res: any) => {
        var resp = res;
        this.isSubmitted = false;
        this.specimenForm.reset();
        this.toastr.success(
          resp.Message,
          'Access Med Lab'
        );
    
        this.router.navigate(['/lab/rejected-specimens/view', this.common.EncryptID(res?.SpecimenId) ]);
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );

  // }
}
}
