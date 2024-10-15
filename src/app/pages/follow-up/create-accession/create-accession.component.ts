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
  selector: 'app-create-accession',
  templateUrl: './create-accession.component.html',
  styleUrl: './create-accession.component.scss'
})

export class CreateAccessionComponent implements OnInit , AfterViewInit {
  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;
  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;
  
  accessionForm:any
  isSubmitted: boolean = false;
  permission: any;
  specimenType: any[] = [];
  userList:any=[];
  accountresp:any=[];
  departmentresp:any=[];
  userresp:any=[];
  selectedDepartment:any=[];
  selectedUser:any=[];
  userdropdownflag:any='none';
  priorityList:any[]=[]
  InfoList:any
  accountList: any;
  departmentList: any;
  customvalidation: string='';
  showOtherSection:boolean=false
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
    this.selectedDepartment=[];
    this.selectedUser=[];
    this.userdropdownflag='none';
  
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 32;
    });
    if (this.permission.MenuPermission.Add !== true) {
      this.router.navigate(['/lab/dashboard']);
    } 
    //Create Form
    this.getStatusList()
    this.getCommonList();
    this.accessionForm = this.formBuilder.group({
      Isdepartment: true,
      Title:['',[Validators.required]],
      Specimentype:[[]],
      MissingIncorrectInformation:[[]],
      Other: [''], 
      Note: [''], 
      Runcbc: true, 
      Runpt:  true, 
      Runua:  true, 
      Plantculture:  true, 
      Patientfirstname: [''],
      Patientlastname: [''], 
      ClientId: [''], 
      Priority: [''],
      Isuser: false, 
      DepartmentIdList: [[]], 
      UserIdList: [[]],
      Accessionnumber: [''], 
      BillingType: [''] ,
      
    });
  }

  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          // console.log(res)
          this.specimenType=res?.SpecimenTypeList
          this.InfoList=res?.MissingIncorrectInformationList
          this.priorityList=res?.NewAccessionPriorityList
          this.specimenType?.forEach(specimen => {
              this.accessionForm.addControl('specimen' + specimen.Key, new FormControl(false));
          });
          this.InfoList?.forEach((specimen: { Key: string; }) => {
            this.accessionForm.addControl('info' + specimen.Key, new FormControl(false));
        });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  getCommonList(){
    // get Account List
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
  get f() { return this.accessionForm.controls; }
  openModal() {
    // Show the modal using jQuery
    (function ($) {
      $('#moreField').modal("show");
    })(jQuery);
  }

  closeModal() {
    this.isSubmitted=false;
    (function ($) {
      $('#moreField').modal("hide");
    })(jQuery);
  }
  submit(){
    this.isSubmitted = true;
   
    if (this.accessionForm.invalid) {  
      
      return;
    }
    else{
      this.isSubmitted = false
      this.openModal()
    }
  }
  onSubmit(): void {
    this.isSubmitted = true;
    this.accessionForm.value.Isuser = this.accessionForm.value.Isdepartment == true ? false : true;
    this.customvalidation = this.accessionForm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : '': this.accessionForm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
  const selectedItem = this.accountList.find((item:any) => item.Value === this.accessionForm.value.ClientId);
  this.accessionForm.value.ClientId = selectedItem?.Key;
    if (this.accessionForm.invalid) { 
      return;
    }else{
      let body :any= {
        Isdepartment: this.accessionForm.value.Isdepartment,
        Title: this.accessionForm.value.Title,
        Specimentype: this.accessionForm.value.Specimentype,
        MissingIncorrectInformation: this.accessionForm.value.MissingIncorrectInformation,
        Other: this.accessionForm.value.Other,
        Note: this.accessionForm.value.Note,
        Runcbc: this.accessionForm.value.Runcbc,
        Runpt: this.accessionForm.value.Runpt,
        Runua: this.accessionForm.value.Runua,
        Plantculture: this.accessionForm.value.Plantculture,
        Patientfirstname: this.accessionForm.value.Patientfirstname,
        Patientlastname: this.accessionForm.value.Patientlastname,
        ClientId: this.accessionForm.value.ClientId,
        Priority: this.accessionForm.value.Priority,
        Isuser: this.accessionForm.value.Isuser,
        DepartmentIdList: this.selectedDepartment,
        UserIdList: this.selectedUser,
        Accessionnumber: this.accessionForm.value.Accessionnumber,
        BillingType: this.accessionForm.value.BillingType
        
      }; 
     this.api
     .callApi(this.constant.commonAccession, body,'POST', true, true)
     .subscribe(
       (res: any) => {
         var resp = res; 
        this.closeModal()
         this.isSubmitted = false;
         this.accessionForm.reset();
         this.toastr.success(
           resp.Message,
           'Access Med Lab'
         );
        this.router.navigate(['/lab/follow-up/resolution-center/accession/view/', this.common.EncryptID(resp?.Id) ]);
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
    this.accessionForm.value.Isuser = this.accessionForm.value.Isdepartment == true ? false : true;
    this.userdropdownflag =  this.accessionForm.value.Isdepartment == true ? 'none' : 'flex';
    this.selectedDepartment = this.accessionForm.value.Isdepartment != true ? [] : this.selectedDepartment;
    this.selectedUser = this.accessionForm.value.Isuser != true ? [] : this.selectedUser;
    if(this.isSubmitted){
      this.customvalidation = this.accessionForm.value.Isdepartment
                ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
                : this.accessionForm.value.Isuser
                ? this.selectedUser.length <= 0 ? "Please select User" : ''
                : '';   
    }
  }
  updateSpecimenType() {
    const selectedSpecimens = this.specimenType.filter((specimen:any) => {
      return this.accessionForm.get('specimen' + specimen.Key)?.value;
    }).map((specimen:any) => specimen.Key);
    this.accessionForm.patchValue({
      Specimentype: selectedSpecimens
    });
  }
  updateInfoType(i:any) {
    const selectedSpecimens = this.InfoList.filter((specimen:any) => {
      return this.accessionForm.get('info' + specimen.Key)?.value;
    }).map((specimen:any) => specimen.Key);
    this.accessionForm.patchValue({
      MissingIncorrectInformation: selectedSpecimens
    });
    if (this.accessionForm.get('info20').value) {
      // If checked, add the conditional field
      this.showOtherSection=true
    }else{
      this.showOtherSection=false
    }
  }
  accountchange(){
    if(this.accessionForm.value.ClientId == ''){
      this.autoComplete.value='';
    }
  }
}
