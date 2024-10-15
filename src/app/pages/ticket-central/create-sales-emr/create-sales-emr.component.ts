import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder,  FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { ToastrService } from 'ngx-toastr';
import { delay, from, map, switchMap, tap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-create-sales-emr',
  templateUrl: './create-sales-emr.component.html',
  styleUrl: './create-sales-emr.component.scss'
})
export class CreateSalesEmrComponent {

  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;

  salesEMRForm: any = FormGroup;
  isSubmitted: any = false;
  permission: any;
  departmentList:any = [];
  userList:any = [];

  selectedDepartment:any=[];
  selectedUser:any=[];

  userdropdownflag:any='none';
  customvalidation:string='';

  departmentresp:any=[];
  userresp:any=[]

  // Constructor to inject services and modules
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
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const phonemask = /^\(\d{3}\)-\d{3}-\d{4}$/;
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    // console.log(permissions,"permission")
    this.permission = permissions.find((item: any) => {
      return item.Type == 13;
    });
     //console.log(permissions);
    //Create Form
    this.salesEMRForm = this.formBuilder.group({
      Isdepartment: true,
      Isuser: false,
      Laboratorycontactname:  ['', [Validators.required]],
      Requesteddate: ['', [Validators.required,this.checkDateValidate.bind(this)]],
      Requestedby: ['', [Validators.required]],
      Laboratorycontactemail: ['', [Validators.required, Validators.pattern(emailregex)]],
      Laboratorycontactphone: ['', [Validators.required,Validators.pattern(phonemask)]],
      Practicename: ['', [Validators.required]],
      Practiceofficehours: ['', [Validators.required]],
      Practiceaddress: ['', [Validators.required]],
      Practicephone: ['', [Validators.required,Validators.pattern(phonemask)]],
      Clientaccontnumber: ['', [Validators.required]],
      Physiciannameandclientnumber: ['', [Validators.required]],
      Officemanagername: ['', [Validators.required]],
      Officemanageremail: ['', [Validators.required, Validators.pattern(emailregex)]],
      Officemanagerphone: ['', [Validators.required,Validators.pattern(phonemask)]],
      Technicalcontactperson: ['', [Validators.required]],
      Technicalcontactemail: ['', [Validators.required, Validators.pattern(emailregex)]],
      Technicalcontactphone: ['', [Validators.required,Validators.pattern(phonemask)]],
      Vendorname: ['', [Validators.required]],
      Vendorcontact: ['', [Validators.required,Validators.pattern(phonemask)]],
      Vendoremail: ['', [Validators.required, Validators.pattern(emailregex)]],
      Vendorphone: ['', [Validators.required,Validators.pattern(phonemask)]],
      Isquoteneeded: false,
      Isresultsonlydefault: false,
      Isordersandresults: false,
      Isdemographicbridge: false,
      Ispracticeofficeinformed: false,
      Physiciansinpractice: [''],
      Isinsurancetableneeded: false,
      Ismultiplepracticelocation: false,
      Practicelocation: [''],
    
    });
   
      if (this.permission.MenuPermission.Add == true) {
        //User List
          this.getUserList()
          //Department List
          this.getDepartmentList()
      }else{
        this.router.navigate(['/lab/dashboard']);
      }
  }

  checkDateValidate(control: any) {
    const selectedDate: Date = control.value;

    // Check if the control value is not null or undefined
    if (!selectedDate) {
      return null;
    }
  
    // Validate the month (0-11)
    const month: number = selectedDate.getMonth();
    if (month < 0 || month > 11) {
      return { 'invalidDateFormat': true };
    }
  
    // Validate the day (1-31)
    const day: number = selectedDate.getDate();
    if (day < 1 || day > 31) {
      return { 'invalidDateFormat': true };
    }
  
    // Validate the year
    const year: number = selectedDate.getFullYear();
    if (year < 1000 || year > 9999) {
      return { 'invalidDateFormat': true };
    }
  
    // If all checks pass, return null (no errors)
    return null;
  }
  ngAfterViewInit() {
    
    // filter dropdown deprtment list
    const deptcontains = (value:any) => (s:any) => s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    this.department.filterChange
      .asObservable()
      .pipe(
        switchMap((value:any) =>
          from([this.departmentresp]).pipe(
            tap(() => (this.department.loading = true)),
            delay(100),
            map((data:any) => data.filter(deptcontains(value)))
          )
        )
      )
      .subscribe((x) => {
        this.departmentList = x;
        this.department.loading = false;
      });


    // filter user dropdown list
    const usercontains = (value:any) => (s:any) => s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    this.userdropdown.filterChange
      .asObservable()
      .pipe(
        switchMap((value:any) =>
          from([this.userresp]).pipe(
            tap(() => (this.userdropdown.loading = true)),
            delay(100),
            map((data:any) => data.filter(usercontains(value)))
          )
        )
      )
      .subscribe((x) => {
        this.userList = x;
        this.userdropdown.loading = false;
      });
    
  }

get f() {
  return this.salesEMRForm.controls;
}


onSubmit(){
  this.isSubmitted = true;
  this.customvalidation = this.salesEMRForm.value.Isdepartment
  ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
  : this.salesEMRForm.value.Isuser
  ? this.selectedUser.length <= 0 ? "Please select User" : ''
  : '';   
  if (this.salesEMRForm.invalid || this.customvalidation) { 
    return;
  }else{
   // Use this 'body' object in your HTTP request
    let body = {
      Isdepartment: this.salesEMRForm.value.Isdepartment,
      Isuser: this.salesEMRForm.value.Isuser,
      DepartmentIdList: this.selectedDepartment,
      UserIdList: this.selectedUser,
      Laboratorycontactname: this.salesEMRForm.value.Laboratorycontactname,
      Requesteddate: this.datePipe.transform(this.salesEMRForm.get('Requesteddate').value, 'MM/dd/yyyy'),
      Requestedby: this.salesEMRForm.value.Requestedby,
      Laboratorycontactemail: this.salesEMRForm.value.Laboratorycontactemail,
      Laboratorycontactphone: this.salesEMRForm.value.Laboratorycontactphone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      Practicename: this.salesEMRForm.value.Practicename,
      Practiceofficehours: this.salesEMRForm.value.Practiceofficehours,
      Practiceaddress: this.salesEMRForm.value.Practiceaddress,
      Practicephone: this.salesEMRForm.value.Practicephone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      Clientaccontnumber: this.salesEMRForm.value.Clientaccontnumber,
      Physiciannameandclientnumber: this.salesEMRForm.value.Physiciannameandclientnumber,
      Officemanagername: this.salesEMRForm.value.Officemanagername,
      Officemanageremail: this.salesEMRForm.value.Officemanageremail,
      Officemanagerphone: this.salesEMRForm.value.Officemanagerphone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      Technicalcontactperson: this.salesEMRForm.value.Technicalcontactperson.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      Technicalcontactemail: this.salesEMRForm.value.Technicalcontactemail,
      Technicalcontactphone: this.salesEMRForm.value.Technicalcontactphone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      Vendorname: this.salesEMRForm.value.Vendorname,
      Vendorcontact: this.salesEMRForm.value.Vendorcontact.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      Vendoremail: this.salesEMRForm.value.Vendoremail,
      Vendorphone: this.salesEMRForm.value.Vendorphone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      Isquoteneeded: this.salesEMRForm.value.Isquoteneeded,
      Isresultsonlydefault: this.salesEMRForm.value.Isresultsonlydefault,
      Isordersandresults: this.salesEMRForm.value.Isordersandresults,
      Isdemographicbridge: this.salesEMRForm.value.Isdemographicbridge,
      Ispracticeofficeinformed: this.salesEMRForm.value.Ispracticeofficeinformed,
      Physiciansinpractice: this.salesEMRForm.value.Physiciansinpractice,
      Isinsurancetableneeded: this.salesEMRForm.value.Isinsurancetableneeded,
      Ismultiplepracticelocation: this.salesEMRForm.value.Ismultiplepracticelocation,
      Practicelocation: this.salesEMRForm.value.Practicelocation,
    };
    this.api
    .callApi(this.constant.commonEMRRequest, body , 'POST', true, true)
    .subscribe(
      (res: any) => {
        var resp = res;
       
        this.isSubmitted = false;
        this.salesEMRForm.reset();
        this.toastr.success(
          resp.Message,
          'Access Med Lab'
        );
        this.router.navigate(['/lab/ticket-resolution/view/', this.common.EncryptID(resp.TicketId),this.common.EncryptID(resp.TicketType) , resp.TicketNumber ]);
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );

  }
}


CancelbtnClick() {
  this.salesEMRForm.reset();
}
//radio button change
onRadioChange() {
  // Implement logic to load data based on the selected radio button
  this.salesEMRForm.get('Isuser').value = this.salesEMRForm.get('Isdepartment').value?false:true
  this.salesEMRForm.value.Isuser = this.salesEMRForm.value.Isdepartment == true ? false : true;
  this.userdropdownflag =  this.salesEMRForm.value.Isdepartment == true ? 'none' : 'block';
  this.selectedDepartment = this.salesEMRForm.value.Isdepartment != true ? [] : this.selectedDepartment;
  this.selectedUser = this.salesEMRForm.value.Isuser != true ? [] : this.selectedUser;
  if(this.isSubmitted){
    this.customvalidation = this.salesEMRForm.value.Isdepartment
              ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
              : this.salesEMRForm.value.Isuser
              ? this.selectedUser.length <= 0 ? "Please select User" : ''
              : '';    
  }
}
//User list
getUserList() {
  this.api
    .callApi(this.constant.getNCUserlist, [], 'GET', true, true)
    .subscribe(
      (res: any) => {
        this.userresp = res;
        this.userList= this.userresp.length != 0 ? this.userresp.slice() : this.userresp;
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}
//Department list
getDepartmentList() {
  this.api
    .callApi(this.constant.commonDepartmentlist, [], 'GET', true, true)
    .subscribe(
      (res: any) => {
        this.departmentresp = res;
        this.departmentList= this.departmentresp.length != 0 ? this.departmentresp.slice() : this.departmentresp;
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}

}
