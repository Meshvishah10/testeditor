import { Component, OnInit , ViewChild , ElementRef, AfterViewInit} from '@angular/core';
import {Router , ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators ,FormControl} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { AutoCompleteComponent, MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { delay, from, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-create-ticktes',
  templateUrl: './create-ticktes.component.html',
  styleUrl: './create-ticktes.component.scss'
})
export class CreateTicktesComponent implements OnInit , AfterViewInit {

  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;
  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;

  // Declare common Variable
  commonfrm:any=FormGroup;
  isSubmitted:any= false;
  permission:any='';
  formTypename:any='';

  complaintlist:any=[];
  saleslist:any=[];
  nationallist:any=[];
  comptypelist:any=[];
  accountList:any=[];
  departmentList:any=[];
  userList:any=[];

  accountresp:any=[];
  departmentresp:any=[];
  userresp:any=[];
  selectedDepartment:any=[];
  selectedUser:any=[];

  customvalidation:string='';
  userdropdownflag:any='none';

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,public activatedRoute: ActivatedRoute,private common:CommonService,private toastr: ToastrService,private formBuilder: FormBuilder){
    // this.formTypename =  this.activatedRoute.snapshot.params['name'];
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    var ticketType = [
      {field:'Complaints',type:4},
      {field:'IT-EMR',type:5},
      {field:'Client&Account',type:6},
      {field:'Patient',type:7},
      {field:'Sales',type:8},
      {field:'National',type:9},
      {field:'Centrifuge',type:10},
      {field:'Technical',type:11},
      {field:'COMP',type:14},
    ]
    this.MasterDetails();
    this.getCommonList();
    this.activatedRoute.url.subscribe(url => {
      this.formTypename=url[1].path
      this.ngOnInit();
    let permissionType = ticketType.find((item:any)=>{return item.field == this.formTypename}) 
    this.permission = permissions.find((item: any) => {
      return item.Type == permissionType?.type;
    });
    if(this.permission?.MenuPermission.Add != true){
      this.router.navigate(['/lab/dashboard'])
    }
    });
  }

  ngOnInit() : void {
    this.isSubmitted=false;
    this.selectedDepartment=[];
    this.selectedUser=[];
    this.userdropdownflag='none';
    this.commonfrm= this.formBuilder.group({
      ClientId:['',[Validators.required]],
      Contactname:['',[Validators.required]],
      Description:['',[Validators.required]],
      Isdepartment:true,
      Isuser:false,
    })
    if(this.formTypename == 'Complaints'){
      this.commonfrm.addControl('Complaint', this.formBuilder.control('', [Validators.required]));
    }
    else if(this.formTypename == 'Sales'){
      this.commonfrm.addControl('Sales', this.formBuilder.control('', [Validators.required])); 
   }
   else if(this.formTypename == 'National'){
    this.commonfrm.addControl('National', this.formBuilder.control('', [Validators.required]));
  }
  else if(this.formTypename == 'COMP'){
    this.commonfrm.addControl('CompType', this.formBuilder.control('', [Validators.required]));
  }
  }

  MasterDetails(){
    this.api.callApi(
      this.constant.MasterDetails,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.complaintlist=res.AccountComplaintTypeList;
      this.saleslist= res.SalesCallsTypeList;
      this.nationallist = res.NationalsCallsTypeList;
      this.comptypelist = res.CompTypeList;
    },(err:any)=>{
      this.complaintlist=[];
      this.saleslist=[];
      this.nationallist=[];
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
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


  checkvalue(){


    this.commonfrm.value.Isuser = this.commonfrm.value.Isdepartment == true ? false : true;
    this.userdropdownflag =  this.commonfrm.value.Isdepartment == true ? 'none' : 'flex';
    this.selectedDepartment = this.commonfrm.value.Isdepartment != true ? [] : this.selectedDepartment;
    this.selectedUser = this.commonfrm.value.Isuser != true ? [] : this.selectedUser;
    if(this.isSubmitted){
      this.customvalidation = this.commonfrm.value.Isdepartment
                ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
                : this.commonfrm.value.Isuser
                ? this.selectedUser.length <= 0 ? "Please select User" : ''
                : '';   
    }
  }

  get f() { return this.commonfrm.controls; }



  onSubmit(){
    if(this.formTypename == 'Complaints'){
        this.ComplaintSubmit();
      }
    else if(this.formTypename == 'Sales'){
        this.SalesSubmit();
     }
     else if(this.formTypename == 'National'){
        this.NationalSubmit();
    }
    else if(this.formTypename == 'COMP'){
        this.CompSubmit()
    }
    else{
        this.commonSubmit();
    }
  }

  accountchange(){
    if(this.commonfrm.value.ClientId == ''){
      this.autoComplete.value='';
    }
  }

  ComplaintSubmit(){
    this.isSubmitted=true;
    this.commonfrm.value.Isuser = this.commonfrm.value.Isdepartment ? false : true;
    this.customvalidation = this.commonfrm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
    : this.commonfrm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': ''; 

    const selectedItem = this.accountList.find((item:any) => item.Value === this.commonfrm.value.ClientId);

    if (selectedItem == undefined) {
      // this.emrForm.controls['ClientId'].setErrors({ required: true });
      this.commonfrm.controls['ClientId'].setValue('');
      //this.emrForm.value.ClientId = ''
    } else {
      this.commonfrm.controls['ClientId'].setValue(selectedItem.Key);
    }
    
    if(this.commonfrm.invalid || this.customvalidation !== ''){
      return
    }else{

      let body={
        Accountcomplainttype: this.commonfrm.value.Complaint!==''?parseInt(this.commonfrm.value.Complaint):'',
        Clientid:this.commonfrm.value.ClientId,
        Contactname:this.commonfrm.value.Contactname,
        Description:this.commonfrm.value.Description,
        Isdepartment:this.commonfrm.value.Isdepartment,
        Isuser:this.commonfrm.value.Isdepartment ? false : true,
        DepartmentIdList:this.selectedDepartment,
        UserIdList:this.selectedUser
      }
      this.api.callApi(
        this.constant.commonComplaints,
        body,
        "POST",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        // console.log("Getting res", res);
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.commonfrm.reset();
        this.commonfrm.get('Isdepartment')?.setValue(true);
        this.commonfrm.get('Isuser')?.setValue(false);
        this.selectedDepartment=[];
        this.selectedUser=[];
        this.isSubmitted=false;
        this.router.navigate(['/lab/ticket-resolution/view/', this.common.EncryptID(resp.TicketId),this.common.EncryptID(resp.TicketType) , resp.TicketNumber ]);
        }else{
  
        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
    }
  }


  SalesSubmit(){
    this.isSubmitted=true;
    this.commonfrm.value.Isuser = this.commonfrm.value.Isdepartment == true ? false : true;
    this.customvalidation = this.commonfrm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
    : this.commonfrm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
    const selectedItem = this.accountList.find((item:any) => item.Value === this.commonfrm.value.ClientId);
    if (selectedItem == undefined) {
      // this.emrForm.controls['ClientId'].setErrors({ required: true });
      this.commonfrm.controls['ClientId'].setValue('');
      //this.emrForm.value.ClientId = ''
    } else {
      this.commonfrm.controls['ClientId'].setValue(selectedItem.Key);
    }
    
    if(this.commonfrm.invalid || this.customvalidation !== ''){
      return
    }else{
      let body={
        Salescalltype: this.commonfrm.value.Sales!==''?parseInt(this.commonfrm.value.Sales):'',
        Clientid:this.commonfrm.value.ClientId,
        Contactname:this.commonfrm.value.Contactname,
        Description:this.commonfrm.value.Description,
        Isdepartment:this.commonfrm.value.Isdepartment,
        Isuser:this.commonfrm.value.Isdepartment ? false : true,
        DepartmentIdList:this.selectedDepartment,
        UserIdList:this.selectedUser
      }
      this.api.callApi(
        this.constant.commonSalesCall,
        body,
        "POST",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        // console.log("getting res", res);
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.commonfrm.reset();
        this.commonfrm.get('Isdepartment')?.setValue(true);
        this.commonfrm.get('Isuser')?.setValue(false);
        this.selectedDepartment=[];
        this.selectedUser=[];
        this.isSubmitted=false;
        this.router.navigate(['/lab/ticket-resolution/view/', this.common.EncryptID(resp.TicketId),this.common.EncryptID(resp.TicketType) , resp.TicketNumber ]);
        }else{
  
        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
    }
  }


  NationalSubmit(){
    this.isSubmitted=true;
    this.commonfrm.value.Isuser = this.commonfrm.value.Isdepartment == true ? false : true;
    this.customvalidation = this.commonfrm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
    : this.commonfrm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
    const selectedItem = this.accountList.find((item:any) => item.Value === this.commonfrm.value.ClientId);
    if (selectedItem == undefined) {
      // this.emrForm.controls['ClientId'].setErrors({ required: true });
      this.commonfrm.controls['ClientId'].setValue('');
      //this.emrForm.value.ClientId = ''
    } else {
      this.commonfrm.controls['ClientId'].setValue(selectedItem.Key);
    }
    if(this.commonfrm.invalid){
      return
    }else{
      let body={
        Nationalcalltickettype: this.commonfrm.value.National!==''?parseInt(this.commonfrm.value.National):'',
        Clientid:this.commonfrm.value.ClientId,
        Contactname:this.commonfrm.value.Contactname,
        Description:this.commonfrm.value.Description,
        Isdepartment:this.commonfrm.value.Isdepartment,
        Isuser:this.commonfrm.value.Isdepartment ? false : true,
        DepartmentIdList:this.selectedDepartment,
        UserIdList:this.selectedUser
      }
      this.api.callApi(
        this.constant.commonNationalCall,
        body,
        "POST",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.commonfrm.reset();
        this.commonfrm.get('Isdepartment')?.setValue(true);
        this.commonfrm.get('Isuser')?.setValue(false);
        this.selectedDepartment=[];
        this.selectedUser=[];
        this.isSubmitted=false;
        this.router.navigate(['/lab/ticket-resolution/view/', this.common.EncryptID(resp.TicketId),this.common.EncryptID(resp.TicketType) , resp.TicketNumber ]);
        }else{
  
        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
     }
    }

    commonSubmit(){
      this.isSubmitted=true;
      this.commonfrm.value.Isuser = this.commonfrm.value.Isdepartment == true ? false : true;
      this.customvalidation = this.commonfrm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : '': this.commonfrm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
      const selectedItem = this.accountList.find((item:any) => item.Value === this.commonfrm.value.ClientId);
      if (selectedItem == undefined) {
        // this.emrForm.controls['ClientId'].setErrors({ required: true });
        this.commonfrm.controls['ClientId'].setValue('');
        //this.emrForm.value.ClientId = ''
      } else {
        this.commonfrm.controls['ClientId'].setValue(selectedItem.Key);
      }
      
    if(this.commonfrm.invalid || this.customvalidation !== ''){
      return
    }else{
      let body={
        Clientid:this.commonfrm.value.ClientId,
        Contactname:this.commonfrm.value.Contactname,
        Description:this.commonfrm.value.Description,
        Isdepartment:this.commonfrm.value.Isdepartment,
        Isuser:this.commonfrm.value.Isdepartment ? false : true,
        DepartmentIdList:this.selectedDepartment,
        UserIdList:this.selectedUser
      }
      var apiname=''
      if(this.formTypename == 'IT-EMR'){
        apiname= this.constant.commonITIssue;
      }
      else if(this.formTypename == 'Client&Account'){
        apiname =  this.constant.commonClientBilling;
      }
      else if(this.formTypename == 'Patient'){
        apiname =  this.constant.commonPatientQuestion;
      }
      else if(this.formTypename == 'Centrifuge'){
        apiname = this.constant.commonCentrifugeIssue;
      }
      else if(this.formTypename == 'Technical'){
        apiname = this.constant.commonLabTechnical;
      }

      if(apiname !== ''){
      this.api.callApi(
        apiname,
        body,
        "POST",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        // console.log("Getting res", res);
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.commonfrm.reset();
        this.commonfrm.get('Isdepartment')?.setValue(true);
        this.commonfrm.get('Isuser')?.setValue(false);
        this.selectedDepartment=[];
        this.selectedUser=[];
        this.isSubmitted=false;
        this.router.navigate(['/lab/ticket-resolution/view/', this.common.EncryptID(resp.TicketId),this.common.EncryptID(resp.TicketType) , resp.TicketNumber ]);
        }else{
  
        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
    }
     }
    }



    CompSubmit(){
      this.isSubmitted=true;
      this.commonfrm.value.Isuser = this.commonfrm.value.Isdepartment == true ? false : true;
    this.customvalidation = this.commonfrm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
    : this.commonfrm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
    const selectedItem = this.accountList.find((item:any) => item.Value === this.commonfrm.value.ClientId);
    if (selectedItem == undefined) {
      // this.emrForm.controls['ClientId'].setErrors({ required: true });
      this.commonfrm.controls['ClientId'].setValue('');
      //this.emrForm.value.ClientId = ''
    } else {
      this.commonfrm.controls['ClientId'].setValue(selectedItem.Key);
    }
    
    if(this.commonfrm.invalid || this.customvalidation !== ''){
      return
    }else{
      let body={
        Contactname: this.commonfrm.value.Contactname,
        Clientid:this.commonfrm.value.ClientId,
        CompType:this.commonfrm.value.CompType,
        Description:this.commonfrm.value.Description,
        Isdepartment:this.commonfrm.value.Isdepartment,
        Isuser:this.commonfrm.value.Isdepartment ? false : true,
        DepartmentIdList:this.selectedDepartment,
        UserIdList:this.selectedUser
      }
      this.api.callApi(
        this.constant.commonCompRequest,
        body,
        "POST",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.commonfrm.reset();
        this.commonfrm.reset();
        this.commonfrm.get('Isdepartment')?.setValue(true);
        this.commonfrm.get('Isuser')?.setValue(false);
        this.selectedDepartment=[];
        this.selectedUser=[];
        this.isSubmitted=false;
        this.router.navigate(['/lab/ticket-resolution/view/', this.common.EncryptID(resp.TicketId),this.common.EncryptID(resp.TicketType) , resp.TicketNumber ]);
        }else{
  
        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
     }
    }
}
