import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder,FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { delay, from, map, switchMap, tap } from 'rxjs';
import { AutoCompleteComponent, MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
declare var jQuery: any;
@Component({
  selector: 'app-create-add-on',
  templateUrl: './create-add-on.component.html',
  styleUrl: './create-add-on.component.scss'
})
export class CreateAddOnComponent implements OnInit , AfterViewInit{
  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;
  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;
  
  addonForm:any
  isSubmitted:boolean=false
  addOnSubmitted:boolean=false
  permission:any
  accountresp:any=[];
  userList:any[]=[]
  departmentresp:any=[]
  userresp:any=[]
  selectedDepartment:any=[];
  selectedUser:any=[];
  userdropdownflag:any='none';
  departmentList: any;
  customvalidation: string='';
  accountList:any;
  addOn:any
  extraValidation:boolean=false
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
    this.addOnSubmitted=false;
    this.selectedDepartment=[];
    this.selectedUser=[];
    this.userdropdownflag='none';
  
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));   
    let userName= this.common.Decrypt(localStorage.getItem('fullname'));   
    this.permission = permissions.find((item: any) => {
      return item.Type == 33;
    });
    if (this.permission.MenuPermission.Add !== true) {
      this.router.navigate(['/lab/dashboard']);
    } 
    this.getCommonList();
    this.addOn = this.formBuilder.group({
      Issigned:true,
      Initialsvalue:[''],
    })
    this.addonForm = this.formBuilder.group({
      Issigned:true,
      Initialsvalue:[''],
      Isdepartment: true,
      AccessionNumber:['',[Validators.required]],
      ClientId:[''],
      PatientName: ['',[Validators.required]], 
      PatientDob: [''], 
      CorrectionMade: [''], 
      TestRequested: [''], 
      Isuser: false, 
      DepartmentIdList: [[]], 
      UserIdList: [[]],
      RequestedBy:userName,
      DateRequested:new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
    });
  this.modelOpen()
  }
  modelOpen() {
    (function ($) {
      $('#firstLoad').modal({ backdrop: 'static', keyboard: false });
      $('#firstLoad').modal('show');
    })(jQuery);
  
  }
  modelCommentClose() {
    (function ($) {
      $('#firstLoad').modal('hide');
    })(jQuery);
    this.extraValidation = false;
    // this.getUpsPickupList();
  }
  toggleInitialsValidation(value: boolean) {
  
    if (value === false) { 
      this.extraValidation = true
      this.addOn.get('Initialsvalue').setValidators([Validators.required]); // Set required validator
    } else {
      this.extraValidation = false;
      this.addOn.get('Initialsvalue').clearValidators(); // Clear validators if Issigned is true (Yes)
    }
    this.addOn.get('Initialsvalue').updateValueAndValidity(); // Update validation status
  }
  Submit(): void {
    this.addOnSubmitted = true;
    if (this.addOn.invalid) { 
      return;
    }else{
      this.addOnSubmitted = false
      this.modelCommentClose()
    }
  }
  getCommonList(){
    this.api.callApi(
      this.constant.commonAccountList,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.accountresp=res;
      this.accountList=this.accountresp.length != 0 ? this.accountresp.slice() : this.accountresp;
    },(err:any)=>{
      this.accountList=[];
      // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
    //get Department List
    this.api.callApi(
      this.constant.commonDepartmentlist,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.departmentresp = res;
      this.departmentList= this.departmentresp.length != 0 ? this.departmentresp.slice() : this.departmentresp;
    },(err:any)=>{
      this.departmentList=[];
      // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })

    //get User List
    this.api.callApi(
      this.constant.getNCUserlist,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.userresp = res;
      this.userList= this.userresp.length != 0 ? this.userresp.slice() : this.userresp;
    },(err:any)=>{
      this.userList=[];
      // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })

  }
  get f() { return this.addonForm.controls; }
  get m() { return this.addOn.controls; }
  accountchange(){
    if(this.addonForm.value.ClientId == ''){
      this.autoComplete.value='';
    }
  }
  onSubmit(): void {
    this.isSubmitted = true;
    this.addonForm.value.Isuser = this.addonForm.value.Isdepartment == true ? false : true;
    this.customvalidation = this.addonForm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : '': this.addonForm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
  const selectedItem = this.accountList?.find((item:any) => item.Value === this.addonForm.value.ClientId);
  this.addonForm.value.ClientId = selectedItem?.Key;
    if (this.addonForm.invalid) { 
      return;
    }else{
      let body :any= {
        Issigned:this.addOn.value.Issigned,
        Initialsvalue:this.addOn.value.Initialsvalue,
        Isdepartment: this.addonForm.value.Isdepartment,
        AccessionNumber: this.addonForm.value.AccessionNumber,
        ClientId:this.addonForm.value.ClientId,
        PatientName: this.addonForm.value.PatientName,
        PatientDob: this.datePipe.transform(this.addonForm.get('PatientDob').value, 'MM/dd/yyyy'),
        CorrectionMade:this.addonForm.value.CorrectionMade,
        TestRequested:this.addonForm.value.TestRequested,
        Isuser: this.addonForm.value.Isuser,
        DepartmentIdList: this.selectedDepartment,
        UserIdList: this.selectedUser,

      }; 
    //  console.log(body)
     this.api
     .callApi(this.constant.commenAddOn, body,'POST', true, true)
     .subscribe(
       (res: any) => {
         var resp = res; 
         this.isSubmitted = false;
         this.addonForm.reset();
         this.toastr.success(
           resp.Message,
           'Access Med Lab'
         );
    //  console.log(resp?.Id)
     this.router.navigate(['/lab/follow-up/resolution-center/add-on/view/', this.common.EncryptID(resp?.Id)])
       },
       (err: any) => {
         this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
       }
     );
    }
  }
  ngAfterViewInit() {
    // filter autocomplete account list
    const contains = (value:any) => (s:any) => s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    this.autoComplete.filterChange
      .asObservable()
      .pipe(
        switchMap((value:any) =>
          from([this.accountresp]).pipe(
            tap(() => (this.autoComplete.loading = true)),
            delay(100),
            map((data:any) => data.filter(contains(value)))
          )
        )
      )
      .subscribe((x) => {
        this.accountList = x;
        this.autoComplete.loading = false;
      });

          // filter dropdown deprtment list
    const deptcontains = (value:any) => (s:any) => s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    this.department?.filterChange
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
  checkvalue(){
    this.addonForm.value.Isuser = this.addonForm.value.Isdepartment == true ? false : true;
    this.userdropdownflag =  this.addonForm.value.Isdepartment == true ? 'none' : 'flex';
    this.selectedDepartment = this.addonForm.value.Isdepartment != true ? [] : this.selectedDepartment;
    this.selectedUser = this.addonForm.value.Isuser != true ? [] : this.selectedUser;
    if(this.isSubmitted){
      this.customvalidation = this.addonForm.value.Isdepartment
                ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
                : this.addonForm.value.Isuser
                ? this.selectedUser.length <= 0 ? "Please select User" : ''
                : '';   
    }
  }
}
