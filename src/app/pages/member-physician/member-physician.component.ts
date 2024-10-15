import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { State } from '@progress/kendo-data-query';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { SalesCentralResponse } from 'src/app/models/sales-central.model';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { DatePipe } from '@angular/common';
import { ExcelService } from '../../services/export-excel.service';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ConfirmationModalComponent } from 'src/app/utils/confirmationmodel.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { InvoiceGeneratorComponent } from './invoice-generator/invoice-generator.component';

declare var jQuery: any;
@Component({
  selector: 'app-member-physician',
  templateUrl: './member-physician.component.html',
  styleUrls: ['./member-physician.component.scss'],
})
export class MemberPhysicianComponent {

  //Declare Common Variable
  Memberslist: any;
  deleteids:any=[];
  SuppliesForm:any=FormGroup;
  CardDetails:any=FormGroup;
  ACHDetails:any=FormGroup;
  memberId:any=[];
  ClientID:any=[];
  invoiceAutoPayList:any
  physicianList:any
  freqList:any = [];
  // common payload for get userlist
  requestpayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    FromDate:null,
    ToDate :null,
  };
  FromDate:any;
  ToDate:any;
  public state: State = {
    skip: 0,
    take: 50,
    sort: [],
    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: [],
    },
  };
  AccountText: any[] = [
    { key: 1, value: 'Standard' },
    { key: 2, value: 'Executive' }
  ];

  Approvaltext:any[]=[
    { key: 0, value: 'Pending' },
    { key: 1, value: 'Approved' },
    { key: 2, value: 'Rejected' },
  ]
  permission: any = '';
  changeApprovalStatus:any={Id:'',Status:''};
  isCardEdit : boolean = false;
  isACHEdit : boolean = false;

  AchInfoDetails:any;
  CardinfoDetails:any;

  isSubmitted:boolean=false;

  StateList:any=[]
  supplies: any=[];
  @ViewChild('approvalStatusDropdown', { static: false }) approvalStatusDropdown!: ElementRef;
 

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,public activatedRoute: ActivatedRoute,private common:CommonService,private toastr: ToastrService,public FilterAndSortingService:FilterAndSortingService,private datePipe: DatePipe,private excelService: ExcelService,private formBuilder: FormBuilder,private modalService: NgbModal){}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));

    this.permission = permissions.find((item: any) => {
      return item.Type == 44;
    });

    // console.log("Getting Permission", this.permission);
    // Create FormControls for add/edit Supplies
   
    this.SuppliesForm = this.formBuilder.group({
      NeedlesButterflyQty: [''],
      NeedlesSafetyQty : [''],
    });

    this.FormCreate();
    if(this.permission.MenuPermission.GenerateInvoice){
      this.getPhysicianList()
      this.getInvoiceList()
    }
     //Load Member Using this function
    if (this.permission.MenuPermission.View == true) {
      // this.getSalesList();
      this.getMemberList();
      this.getFreqList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }

  FormCreate(){
    this.CardDetails =this.formBuilder.group({
      CardFirstName: new FormControl({ value: '********', disabled: true }),
      CardLastName: new FormControl({ value: '********', disabled: true }),
      CardBillingZipCode: new FormControl({ value: '****', disabled: true }),
      CardType: new FormControl({ value: '', disabled: true }),
      CardNumber: new FormControl({ value: '************', disabled: true }),
      CardExpirationMonth: new FormControl({ value: '**', disabled: true }),
      CardExpirationYear: new FormControl({ value: '****', disabled: true }),
      CardCVV: new FormControl({ value: '***', disabled: true }),
      CardActiveAutoPay: new FormControl({ value: false, disabled: true }),
      CardActivePayDays : new FormControl({ value: '**', disabled: true }),
    })

    const emailregex: RegExp =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    this.ACHDetails = this.formBuilder.group({
      ACHCompanyName : [{value:'************',disabled:true},[Validators.required]],
      ACHCompanyRegBusiness : [{value:'*********',disabled:true},[Validators.required]],
      ACHCompanyEmail : [{value:'******@****.***',disabled:true},[Validators.required,Validators.pattern(emailregex)]],
      ACHCompanyAddress : [{value:'***********',disabled:true}],
      ACHCompanyStateId : [{value:'',disabled:true},[Validators.required]],
      ACHCompanyCity : [{value:'******',disabled:true},[Validators.required]],
      ACHCompanyZip : [{value:'****',disabled:true},[Validators.required]],
      ACHBankName : [{value:'***********',disabled:true},[Validators.required]],
      ACHBankRouting : [{value:'**********',disabled:true},[Validators.required]],
      ACHBankAccountNumber : [{value:'#############',disabled:true},[Validators.required]],
      ConfirmBankAccount : [{value:'#############',disabled:true},[Validators.required,confirmAccountNumberValidator]],
      ACHBankAddress : [{value:'**************',disabled:true},[Validators.required]],
      ACHBankStateId : [{value:'',disabled:true},[Validators.required]],
      ACHBankCity : [{value:'',disabled:true},[Validators.required]],
      ACHBankZip : [{value:'****',disabled:true},[Validators.required]],
    }, { validator: this.AccountMatchValidator })
  }
  getInvoiceList(){
    this.api
    .callApi(this.constant.MasterDetails, [], 'GET', true, true).subscribe((res:any)=>{

      this.invoiceAutoPayList = res?.InvoiceAutoPayList
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  } 
  getPhysicianList(){
    this.api
    .callApi(this.constant.getAccountList, [],'GET', true, true).subscribe((res:any)=>{

      this.physicianList=res;     
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  } 
  getMemberList() {
      this.requestpayload.FromDate = this.FromDate ?this.datePipe.transform(new Date(this.FromDate),'MM/dd/yyyy'):null;
      this.requestpayload.ToDate = this.ToDate ?this.datePipe.transform(new Date(this.ToDate),'MM/dd/yyyy'):null;
    
    this.api
      .callApi(
        this.constant.getClientsList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log("Getting res", res);
          this.Memberslist = {
            data: res.MPClientsList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  
  search() {  
    const state: DataStateChangeEvent = {
      skip: 0,
      take: this.state.take !== undefined ? this.state.take : 50,
      sort: this.state.sort, 
      filter: this.state.filter 
    };
    this.dataStateChange(state);
  }
   // Call Function when data state changes , user click on next page or order
   public dataStateChange(state: DataStateChangeEvent): void {
    // console.log("Getting state", state);
    // call Filter and Soring Function
    var RequestData=this.FilterAndSortingService.prepareRequestPayload(state);

    this.state=state;
    this.requestpayload.PageSize=state.take;
    this.requestpayload.Sorts=RequestData.Sorts;
    this.requestpayload.Filters=RequestData.Filters;
    this.requestpayload.Page = (state.skip + state.take) / state.take;
  this.getMemberList();
}

OnReset(){
 
  this.requestpayload.FromDate=null;
  this.requestpayload.ToDate=null;
  this.FromDate=null;
  this.ToDate=null;
  this.requestpayload.CustomSearch='';
  this.getMemberList();
}

editMember(id:any){
  this.router.navigate(['/lab/memberphysician/edit-member/' + this.common.EncryptID(id)]);
}

changeStatus(id:any){
  let body = {
    Id: id,
  };
  this.api
    .callApi(this.constant.changeClientStatus, body, 'PUT', true, true)
    .subscribe(
      (res: any) => {
        var resp = res;
        if (resp.Status == 1) {
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.getMemberList();
        } else {
        }
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}

  exportExcel(){
    
      this.requestpayload.FromDate = this.FromDate ?this.datePipe.transform(new Date(this.FromDate),'MM/dd/yyyy'):null;
      this.requestpayload.ToDate = this.ToDate ?this.datePipe.transform(new Date(this.ToDate),'MM/dd/yyyy'):null;
    
    var exportrequest=this.requestpayload;
    exportrequest.PageSize=this.Memberslist.total;

    this.api
      .callApi(
        this.constant.getClientsList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(exportrequest)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp=res.MPClientsList;
          const modifyField = resp.map((element:any) => ({
            'Account #': element.AccountNumber,
            'Account Type': element.AccountTypeText,
            'Practice Name': element.PracticeName,
            'Username': element.Username,
            'Ordering Physician': element.PhysicianName,
            'NPI Number': element.PhysicianNPINumber,
            'Practice Phone': element.Phone,
            'Mobile Number': element.Mobile,
            'Fax': element.Fax,
            'Email Address': element.Email,
            'Address':element.Address,
            'Hear About Us': element.HearAboutUs,
            'Product Interested': element.ProductsInterestedText,
            'Samples Per Day': element.SamplesPerDayText,
            'Blood Draws': element.BloodDraws,
            'Approval Status': element.ApprovalStatusText,
            'Status':element.StatusText,
            'Register Date': this.datePipe.transform(element.CreatedDate, 'MM/dd/yyyy')
          }));
          this.excelService.exportToExcel(modifyField, 'new_register_report.xlsx');
        },
        (err: any) => {
          // console.log("getting error", err.error);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  isAllSelected(): boolean {
    return this.Memberslist?.data.length !== 0?this.Memberslist?.data.every((item:any) => item?.isSelected):false;
  }

  onSelectAllChange(event: any): void {
    const checked = event.target.checked;
    this.Memberslist.data.forEach((item:any) => {
        item.isSelected = checked;
        if(checked){
        this.deleteids.push(item.Id);
        }
    });
    if(!checked){
      this.deleteids=[];
    }
  }

  onCheckboxChange(dataItem: any): void {
    if(dataItem.isSelected){
      this.deleteids.push(dataItem.Id)
    }else{
      this.deleteids.splice(
        this.deleteids.findIndex((i:any) => dataItem.Id.includes(i)),
        1
        );
      }
  }

  // User Click on delete icon than model will display and set id in uniqueid variable
  deleteModel(id?: any) {
    // this.deleteids=[];
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = '';
    modalRef.componentInstance.message = 'Are you sure you want to Delete?';
    
    modalRef.result.then(
      (result:any) => {
        if (result === 'Yes') {
          // Handle confirmation logic
          if(this.deleteids.length == 0){
          this.deleteids.push(id);
          }
          this.deleteMember();
        } else {
          // User clicked Cancel or closed the modal
          this.deleteids=[];
          this.Memberslist.data.map((e: any) => (e.isSelected = false));
        }
      },
      () => {
        // Modal dismissed
        this.deleteids=[];
        this.Memberslist.data.map((e: any) => (e.isSelected = false));
      }
    );
  }

  // If user click on yes than call below function and call api for delete Client
  deleteMember() {
    this.api
      .callApi(
        this.constant.DeleteClient +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.deleteids)),
        [],
        'DELETE',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            if(this.Memberslist.data.length == this.deleteids.length){
              this.state.skip=0;
              this.state.take=50;
              this.requestpayload.Page = (this.state.skip + this.state.take ) / this.state.take
            }
            this.deleteids=[];
            this.Memberslist.data.map((e: any) => (e.isSelected = false));
            this.getMemberList();
          } else {
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  getFreqList(){
    this.api
    .callApi(this.constant.MasterDetails, [], 'GET', true, true)
    .subscribe(
      (res: any) => {
         this.freqList = res?.ClientProductFreeSupplyFrequencyList
       
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }

  // get Free Suplies Details and configure in Form
  getFreeSuplies(id:any){
      this.memberId=id;
      this.api
      .callApi(
        this.constant.GetFreeSupliesClient +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
       
          this.supplies = res.ClientProductFreeSupplies;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  } 

  //Update Free Supplies Details

    UpdateFreeSupplies() {
      if (this.memberId) {
        let body = {
          Id: this.memberId,
          ClientProductFreeSupplies: this.supplies.map((supply:any) => ({
            FreeSuppliesTypeId: supply.FreeSuppliesTypeId,
            Quantity : supply.Quantity ,
            Frequency : supply.Frequency ,
          }))
        };
    

        this.api
          .callApi(this.constant.UpdateFreeSupliesClient, body, 'PUT', true, true)
          .subscribe(
            (res: any) => {
              if (res.Status == 1) {
                this.toastr.success(res.Message, 'Access Med Lab');
                this.modelSuppliesClose();
              }
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      } else {
        this.toastr.error('Something went wrong. Please try again!', 'Access Med Lab');
      }
    }
    
  

  // It's use for close delete model
  modelSuppliesClose() {
    this.memberId = '';
    (function ($) {
      $("#ManageFreeSupplies").modal("hide");
    })(jQuery);
  }

  showClientUser(id:any,name:any){
    this.router.navigate(['/lab/memberphysician/user/' + this.common.EncryptID(id) + '/' + this.common.EncryptID(name)]);
  }

  changeApproval(data:any,e:any){
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = '';
    modalRef.componentInstance.message = 'Are you sure you want to change Approval Status?';

    modalRef.result.then(
      (result:any) => {
        if (result === 'Yes') {
          // Handle confirmation logic
          data.UpdateApproval = e.target.value;
          this.changeApprovalStatus= data;
            this.confirmApproval();
        } else {
          // User clicked Cancel or closed the modal
          e.target.value=data.ApprovalStatus;
          this.changeApprovalStatus.Id='';
          this.changeApprovalStatus.Status='';
        }
      },
      () => {
        // Modal dismissed
        e.target.value=data.ApprovalStatus;
        this.changeApprovalStatus.Id='';
        this.changeApprovalStatus.Status='';
      }
    );
  }

  confirmApproval(){
    let body = {
      Id: this.changeApprovalStatus.Id,
      ApprovalStatus: this.changeApprovalStatus.UpdateApproval
    };
    this.api
      .callApi(this.constant.ApproveRejectClient, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(
              resp.Message,
              'Access Med Lab'
            );
            this.getMemberList();
          } else {
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  get f() {
    return this.ACHDetails.controls;
  }

  showVisibility(dataType:any){
    const modalRef = this.modalService.open(AuthenticationComponent, { centered: true });
    modalRef.componentInstance.title = 'Validate Authentication';
    modalRef.componentInstance.message = 'We kindly request you to verify your identity. Please enter your password in the provided field on the portal!';
     
    modalRef.result.then(
      (result:any) => {
        if (result === 'Yes') {
          // Handle confirmation logic
          if(dataType == 'Card'){
            
            this.CardDetails.enable();
            this.getCardDetail();
          }

          if(dataType == 'ACH'){
            
            this.ACHDetails.enable();
            this.getACHDetail();
          }
        } else {
          // User clicked Cancel or closed the modal
         this.isCardEdit=false;
         this.isACHEdit=false;
         this.ACHDetails.disable();
         this.CardDetails.disable();
        }
      },
      () => {
        // Modal dismissed
       
      }
    );
  }

  OpenCardModel(id:any){
    this.ClientID=id;
    this.isCardEdit=false;
    this.isACHEdit=false;
    this.FormCreate();
    this.getStateList();
  }

  // Custom validator function to check if passwords match
  AccountMatchValidator(formGroup: FormGroup) {
    const bankAccountNumber = formGroup.get('ACHBankAccountNumber');
    const bankAccountNumberConfirm = formGroup.get('ConfirmBankAccount');

    if (bankAccountNumber?.value !== bankAccountNumberConfirm?.value) {
      bankAccountNumberConfirm?.setErrors({ mismatch: true });
    } else {
      bankAccountNumberConfirm?.setErrors(null);
    }
  }

  getACHDetail(){
    this.api
      .callApi(this.constant.GetACHData+'?inputRequest=' + encodeURIComponent(this.common.Encrypt(this.ClientID)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.AchInfoDetails = res;
          this.isACHEdit=true;
          this.ACHDetails.reset({
            ACHCompanyName : this.AchInfoDetails.ACHCompanyName,
            ACHCompanyRegBusiness : this.AchInfoDetails.ACHCompanyRegBusiness,
            ACHCompanyEmail : this.AchInfoDetails.ACHCompanyEmail,
            ACHCompanyAddress : this.AchInfoDetails.ACHCompanyAddress,
            ACHCompanyStateId : this.AchInfoDetails.ACHCompanyStateId!= null ?this.AchInfoDetails.ACHCompanyStateId.toString():'',
            ACHCompanyCity : this.AchInfoDetails.ACHCompanyCity,
            ACHCompanyZip : this.AchInfoDetails.ACHCompanyZip,
            ACHBankName : this.AchInfoDetails.ACHBankName,
            ACHBankRouting : this.AchInfoDetails.ACHBankRouting,
            ACHBankAccountNumber : this.AchInfoDetails.ACHBankAccountNumber,
            ConfirmBankAccount : this.AchInfoDetails.ACHBankAccountNumber,
            ACHBankAddress : this.AchInfoDetails.ACHBankAddress,
            ACHBankStateId : this.AchInfoDetails.ACHBankStateId!= null ?this.AchInfoDetails.ACHBankStateId.toString():'',
            ACHBankCity : this.AchInfoDetails.ACHBankCity,
            ACHBankZip : this.AchInfoDetails.ACHBankZip,
          })

          // console.log("Getting resp", res , this.ACHDetails.value);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  getStateList(){
    const countryid = AppSettingsService.CountryId();
    this.api.callApi(
      this.constant.GetStateList+'?inputRequest='+encodeURIComponent(this.common.Encrypt(countryid)),
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

  getCardDetail(){
    this.api
      .callApi(this.constant.getCarddata+'?inputRequest=' + encodeURIComponent(this.common.Encrypt(this.ClientID)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.CardinfoDetails = res;
          this.isCardEdit=true;
          // console.log("Getting resp", res);
          this.CardDetails.reset({
            CardFirstName: this.CardinfoDetails.CardFirstName,
            CardLastName: this.CardinfoDetails.CardLastName,
            CardBillingZipCode: this.CardinfoDetails.CardBillingZipCode,
            CardType: this.CardinfoDetails.CardType != null ?this.CardinfoDetails.CardType.toString():'',
            CardNumber: this.CardinfoDetails.CardNumber,
            CardExpirationMonth: this.CardinfoDetails.CardExpirationMonth,
            CardExpirationYear: this.CardinfoDetails.CardExpirationYear,
            CardCVV: this.CardinfoDetails.CardCVV,
            CardActiveAutoPay: this.CardinfoDetails.CardActiveAutoPay,
            CardActivePayDays : this.CardinfoDetails.CardActivePayDays,
          })
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  updateCardDetails(){
      let body={
        Id:this.ClientID,
        CardFirstName: this.CardDetails.value.CardFirstName,
        CardLastName: this.CardDetails.value.CardLastName,
        CardBillingZipCode: this.CardDetails.value.CardBillingZipCode,
        CardType: this.CardDetails.value.CardType != ''?parseInt(this.CardDetails.value.CardType):null,
        CardNumber: this.CardDetails.value.CardNumber,
        CardExpirationMonth: this.CardDetails.value.CardExpirationMonth,
        CardExpirationYear: this.CardDetails.value.CardExpirationYear,
        CardCVV: this.CardDetails.value.CardCVV,
        CardActiveAutoPay: this.CardDetails.value.CardActiveAutoPay,
        CardActivePayDays : this.CardDetails.value.CardActivePayDays,
      }

      // console.log("Getting Body", body);

      this.api
        .callApi(this.constant.UpdateCardData, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
            } else {
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
  }

  deleteCardDetails(){
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = '';
    modalRef.componentInstance.message = 'Are you sure you want to Delete Card Details?';

    modalRef.result.then(
      (result:any) => {
        if (result === 'Yes') {
          // Handle confirmation logic
          this.DeleteCardConfirm();
        } else {
          // User clicked Cancel or closed the modal
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  UpdateACHDetails(){
    this.isSubmitted = true;
    if (this.ACHDetails.invalid) {
      return;
    } else {
      let body={
        Id:this.ClientID,
        ACHCompanyName : this.ACHDetails.value.ACHCompanyName,
        ACHCompanyRegBusiness : this.ACHDetails.value.ACHCompanyRegBusiness,
        ACHCompanyEmail : this.ACHDetails.value.ACHCompanyEmail,
        ACHCompanyAddress : this.ACHDetails.value.ACHCompanyAddress,
        ACHCompanyStateId : this.ACHDetails.value.ACHCompanyStateId != ''?parseInt(this.ACHDetails.value.ACHCompanyStateId):this.ACHDetails.value.ACHCompanyStateId,
        ACHCompanyCity : this.ACHDetails.value.ACHCompanyCity,
        ACHCompanyZip : this.ACHDetails.value.ACHCompanyZip,
        ACHBankName : this.ACHDetails.value.ACHBankName,
        ACHBankRouting : this.ACHDetails.value.ACHBankRouting,
        ACHBankAccountNumber : this.ACHDetails.value.ACHBankAccountNumber,
        ACHBankAddress : this.ACHDetails.value.ACHBankAddress,
        ACHBankStateId : this.ACHDetails.value.ACHBankStateId != ''?parseInt(this.ACHDetails.value.ACHBankStateId):this.ACHDetails.value.ACHBankStateId,
        ACHBankCity : this.ACHDetails.value.ACHBankCity,
        ACHBankZip : this.ACHDetails.value.ACHBankZip,
      }
  
      // console.log("Getting Body", body);
  
      this.api
        .callApi(this.constant.UpdateACHData, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
              this.isSubmitted=false;
            } else {
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  DeleteACHDetails(){
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = '';
    modalRef.componentInstance.message = 'Are you sure you want to Delete ACH Details?';

    modalRef.result.then(
      (result:any) => {
        if (result === 'Yes') {
          // Handle confirmation logic
          this.DeleteACHConfirm();
        } else {
          // User clicked Cancel or closed the modal
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }


  DeleteCardConfirm(){
    this.api
      .callApi(
        this.constant.DeleteCardData +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.ClientID)),
        [],
        'DELETE',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.getCardDetail();
          } else {
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  DeleteACHConfirm(){
    this.api
      .callApi(
        this.constant.DeleteACHData +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.ClientID)),
        [],
        'DELETE',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.getACHDetail();
          } else {
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  redirectView(id:any,physicianName:any,accountNumber:any){
   
    const encryptedId = this.common.EncryptID(id);
    const encryptedPhysicianName = this.common.EncryptID(physicianName);
    const encryptedAccountNumber = this.common.EncryptID(accountNumber);
  
    const route = `lab/memberphysician/client-billing/${encryptedId}/${encryptedPhysicianName}/${encryptedAccountNumber}`;
    this.router.navigate([route]);
  
  }

  RecurringOrder(id:any,name:any){
    let account = name + ((id || '') != '' ? ' - ' + id : '');
    const encryptedId = this.common.EncryptID(account);
    this.router.navigate(['lab/logistic-central/recurring-order/addOrder/'+encryptedId]);
  }


  generateInvoice(id:any,physicianName:any) {
    const modal =this.modalService.open(InvoiceGeneratorComponent, {
      centered: true,
      size: 'lg',
    });
    
    modal.componentInstance.PhysicianName = physicianName;
    modal.componentInstance.PhysicianId = id;
    modal.componentInstance.InvoiceAutoPayList = this.invoiceAutoPayList;
  }

}




// Custom validator function for confirming Bank Account Number
export const confirmAccountNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const bankAccountNumber = control.parent.get('ACHBankAccountNumber');
  const bankAccountNumberConfirm = control.parent.get('ConfirmBankAccount');

  if (!bankAccountNumber || !bankAccountNumberConfirm) {
    return null;
  }

  if (bankAccountNumberConfirm.value === '') {
    return null;
  }

  if (bankAccountNumber.value === bankAccountNumberConfirm.value) {
    return null;
  }

  return { 'AccountNotMatching': true };


 
};