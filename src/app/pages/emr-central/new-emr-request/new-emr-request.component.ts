import { DatePipe } from '@angular/common';
import { Component, OnInit , ViewChild , ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { delay, from, map, switchMap, tap } from 'rxjs';
import { DecimalFormatPipe } from 'src/app/shared/decimal-format.pipe';
import { AutoCompleteComponent } from '@progress/kendo-angular-dropdowns';
@Component({
  selector: 'app-new-emr-request',
  templateUrl: './new-emr-request.component.html',
  styleUrl: './new-emr-request.component.scss'
})
export class NewEmrRequestComponent implements OnInit , AfterViewInit {
  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;

  emrForm:any
  isSubmitted:any
  permission:any
  salesUser:any
  uniqueId:string=''
  emrTypeList:any
  accountList:any
  accountresp:any
  clientID:string=''
  userList:any = [];
  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService,
 
    public decimalpipe:DecimalFormatPipe
  ) {}
  ngOnInit(): void {
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const phonemask = /^\(\d{3}\)-\d{3}-\d{4}$/;
    const decimalRegex =  /^\d+(\.\d{1,2})?$/;
    this.isSubmitted = false;
    // Get permissions from local storage
    this.uniqueId = this.activatedRoute.snapshot.params['id'] !== undefined?this.common.DecryptID(this.activatedRoute.snapshot.params['id']):'';

    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 48;
    });
 
    this.emrForm = this.formBuilder.group({ 
      ClientId: ['', Validators.required],
      VendorName: ['', Validators.required],
      VendorContactName: ['', Validators.required],
      VendorContact: ['', [Validators.required,Validators.pattern(phonemask)]],
      EmrType: ['', Validators.required],
      AssignToId:[''],
      PocName: ['', Validators.required],
      PocEmail: ['', [Validators.required,Validators.pattern(emailregex)]],
      PocPhone: ['', [Validators.required,Validators.pattern(phonemask)]],
      SalesRepId: [''],
      InterfaceVendor: [''],
      PhysicianPin: [],
      Volume: [],
      Value: ['',[Validators.pattern(decimalRegex)]],
      Cost: ['',[Validators.pattern(decimalRegex)]],
      Comment: [''],
      PocExtension:['',Validators.required]
      });
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
        this.toastr.error('Invalid Request.');  
    }
    if(this.uniqueId == ''){
      if (this.permission.MenuPermission.Add == true) {
        this.getSaleUserList();
        this.getEMRTypeList();
        this.getUserList()
      }else{
        this.router.navigate(['/lab/dashboard']);
      }
    }else{
      if (this.permission.MenuPermission.Edit == true) {
        if (this.uniqueId != '') {
          this.getEMRTypeList()
          this.getSaleUserList();
         this.getUserList();
        }
      }else{
        this.router.navigate(['/lab/dashboard']);
      }
    }  
  }
 
  getEMRTypeList() {
    this.api.callApi(
      this.constant.commonAccountList,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
 
      this.accountresp=res;
   
      this.accountList=this.accountresp.length != 0 ? this.accountresp.slice() : this.accountresp;
      if(this.uniqueId !== ''){
      this.editModel(this.uniqueId);
      }
    },(err:any)=>{
      this.accountList=[];
      // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.emrTypeList = res.EmrTypeList;
         
        },
        (err: any) => {
          // this.stateList = [];
          // show error toast
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
      
  }
  get f() { return this.emrForm.controls; }
  getSaleUserList() {
    this.api
      .callApi(this.constant.getNCUserlist, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
        this.salesUser=res
      
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  getUserList() {
    this.api
      .callApi(this.constant.getClientRelationNCUsers, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
        this.userList=res
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
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

      
    
  }
  accountchange(){
    if(this.emrForm.value.ClientId == ''){
      this.autoComplete.value='';
    }
 
  }
  onSubmit(){
    this.isSubmitted = true;
    if (this.emrForm.value.Value == '.00' || this.emrForm.value.Value == '.' || this.emrForm.value.Value == '') {
      this.emrForm.value.Value = '0.00';
    }
    if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
      this.toastr.error('Invalid Request.');
      return ;
  }
  if(!this.uniqueId && this.uniqueId == "" ){
    const selectedItem = this.accountList.find((item:any) => item.Value === this.emrForm.value.ClientId);
    if (selectedItem == undefined) {
      // this.emrForm.controls['ClientId'].setErrors({ required: true });
      this.emrForm.controls['ClientId'].setValue('');
      //this.emrForm.value.ClientId = ''
    } else {
      this.emrForm.controls['ClientId'].setValue(selectedItem.Key);
    }
  } 
  
    if (this.emrForm.invalid) { 
      return;
    }else{
    // Use this 'body' object in your HTTP request
    let body: any = {     
      ClientId:this.clientID == '' ? this.emrForm.value.ClientId : this.clientID,  
      VendorName: this.emrForm.value.VendorName,
      VendorContactName: this.emrForm.value.VendorContactName,
      VendorContact: this.emrForm.value.VendorContact.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      EmrType: this.emrForm.value.EmrType,
      PocName: this.emrForm.value.PocName,
      AssignToId:this.emrForm.value.AssignToId,
      PocEmail: this.emrForm.value.PocEmail,
      PocPhone: this.emrForm.value.PocPhone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, ''),
      SalesRepId: this.emrForm.value.SalesRepId,
      InterfaceVendor: this.emrForm.value.InterfaceVendor,
      PhysicianPin: Number(this.emrForm.value.PhysicianPin),
      Volume: Number(this.emrForm.value.Volume),
      Value: this.emrForm.value.Value,
      Cost: this.emrForm.value.Cost,
      Comment:this.emrForm.value.Comment,
      PocExt: this.emrForm.value.PocExtension
    };  

     let method = 'POST';
      if (this.uniqueId != '') {
        method = 'PUT';
        body.Id = this.uniqueId;
      }
  
      this.api
      .callApi(this.constant.EMRCentral, body, method, true, true)
      .subscribe(
        (res: any) => {
          var resp = res; 
          this.isSubmitted = false;
          this.emrForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.clientID = ''
          this.router.navigate(['/lab/emr-central' ]);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }
  }
  editModel(id: any) {
    this.uniqueId = id;
    this.api
      .callApi(
        this.constant.EMRCentral +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          //this.modelDisplay = 'block';
    
             const selectedItem = this.accountList?.find((item:any) => item.Key == resp.GetEmrModel.ClientId);
            this.clientID = resp.GetEmrModel.ClientId 
             resp.GetEmrModel.ClientId = selectedItem?.Value;
          
          this.emrForm.reset({
            ClientId:resp.GetEmrModel.ClientId,
            VendorName: resp?.GetEmrModel.VendorName,
            VendorContactName: resp?.GetEmrModel.VendorContactname,
            AssignToId:resp?.GetEmrModel.AssignToId || '',
            VendorContact: resp?.GetEmrModel.VendorContact?.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3'),
            EmrType: resp?.GetEmrModel.EmrType,
            PocName: resp?.GetEmrModel.PocName,
            PocEmail: resp?.GetEmrModel.PocEmail,
            PocPhone: resp?.GetEmrModel.PocPhone?.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3'),
            SalesRepId:resp?.GetEmrModel.SalesRepId || '',
            InterfaceVendor: resp?.GetEmrModel.InterfaceVendor,
            PhysicianPin: resp?.GetEmrModel.PhysicianPin,
            Volume: resp?.GetEmrModel.Volume,
            Value: resp?.GetEmrModel.Value?.toFixed(2),
            Cost: resp?.GetEmrModel.Cost?.toFixed(2),
            PocExtension: res?.GetEmrModel.PocExt
          });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
   
}
