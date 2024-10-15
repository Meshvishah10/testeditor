import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { ExcelService } from 'src/app/services/export-excel.service';
import { EmrPrintComponent } from '../emr-print/emr-print.component';
import { EMRCentralListResponse, EMRCommentBody } from 'src/app/models/EMRCentral.model';
import { AutoCompleteComponent } from '@progress/kendo-angular-dropdowns';
import { delay, from, map, switchMap, tap } from 'rxjs';
declare var jQuery: any;
@Component({
  selector: 'app-emr-request',
  templateUrl: './emr-request.component.html',
  styleUrl: './emr-request.component.scss'
})
export class EmrRequestComponent implements OnInit , AfterViewInit {
  statusList:any
  emrReqList:any
  dateRequested:any
  selectedStatus:any
  pendingStatusList:any
  selectedId:any
  Stage:any
  salesUser:any
  emrTypeList:any
  commentStatus: string='';
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    ClientFilter: '',
    Stage: '',   
    AssignToId: '',
  };
  public state: State = {
    skip: 0,
    take: 50,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  };
  permission: any = '';
  commentList: any;
  comment:string = ''
  accountList:any;
  accountresp:any;
  showprint:boolean=false;
  clientId:any='';
  userList:any = [];
  @ViewChild(EmrPrintComponent) emrPrintComponent!: EmrPrintComponent;
  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;
  
  constructor( 
     private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe,
    private renderer: Renderer2,
    private excelService: ExcelService){
  }
  ngOnInit() {

    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 48;
    });
    if (this.permission?.MenuPermission.View == true) {
      this.getStatusList()
      this.getUserList()
      this.getEmrReqList()
      this.getSaleUserList()
      this.getEMRTypeList()
    
    }
    else{
        this.router.navigate(['/dashboard']);
    }
    
  }

  togglePrint(id:string){

    this.api.callApi
      (this.constant.GetEmrApprovalRequestPdf+'?inputRequest=' +
      encodeURIComponent(this.common.Encrypt(id)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
        const binaryString = atob(res.FileBytes);
        const bytesArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytesArray[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytesArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
  
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = res.FileName;
        link.click();
  
        // Open the PDF in a new window/tab
        // const pdfWindow = window.open(blobUrl, '_blank');
        // if (pdfWindow) {
        //   pdfWindow.focus();
        // }
  
        // Clean up: revoke the Blob URL
        URL.revokeObjectURL(blobUrl);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
    )
  }
  getSaleUserList() {
    this.api
      .callApi(this.constant.salesUser, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
        this.salesUser=res
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
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

  public dataStateChange(state: DataStateChangeEvent): void {
    // call Filter and Soring Function
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);
 
    this.state = state;
    this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
    this.requestPayload.Filters = RequestData.Filters;
    this.requestPayload.Page = (state.skip + state.take) / state.take;
    if (RequestData.Filters !== null && RequestData.Filters.length > 0) {
      this.requestPayload.Filters = RequestData.Filters.map((filter: any) => {
          if (filter.Field === 'Createddate' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
          if (filter.Field === 'Stage') {
            filter.Field = 'StageName';
        }
      
     
          return filter;
      });}
    this.getEmrReqList()

  }
  OnReset() {
    //this.requestPayload.ClientName = null;
    //this.requestPayload.AccountNo = null;
    //this.requestPayload.DateRequested= null;
    this.requestPayload.AssignToId='';
    //this.requestPayload.SalesRep=null;
    this.requestPayload.Stage='';
    this.requestPayload.ClientFilter = null
    this.dateRequested=null;
   
    this.emrReqList = {
      data: [],
      total: 0,
    };
    this.getEmrReqList()
  }
  getEmrReqList(){
   
    this.api
      .callApi(
        this.constant.EmrCentralList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res:EMRCentralListResponse) => {
       
          this.emrReqList = {
            data: res.EmrRequestList,
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

    const selectedItem = this.accountList.find((item:any) => item.Value === this.clientId);
    this.requestPayload.ClientFilter = selectedItem?.Key || null;

    this.dataStateChange(state);
  }
  reidrectView(Id:any): void {
    // Navigate to another route with the ticketNumber as a parameter
    //EncryptID
   
    this.router.navigate(['/lab/emr-central/edit/', this.common.EncryptID(Id) ]);
  }
  redirectView(id:string): void {
    // Navigate to another route with the orderNumber as a parameter
    //EncryptID
    this.router.navigate([`/lab/emr-central/detail/` + this.common.EncryptID(id)]);
  }
  NewRequest(){
    this.router.navigate(['/lab/emr-central/add'])
  }
  //status list
  getStatusList() {
        this.api
          .callApi(this.constant.MasterDetails, [], 'GET', true, true)
          .subscribe(
            (res: any) => {    
              this.statusList = res?.EmrCentralStage
              // this.pendingStatusList=res?.EmrCentralPendingStage
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }
  getEMRTypeList() {
    
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.emrTypeList = res.EmrTypeList;
        },
        (err: any) => {
           this.emrTypeList = [];
          // show error toast
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
      
  }
  statusChangeModal(id:any,Status:any){
    this.selectedId=id,
    this.selectedStatus=Status
    this.modelStatusOpen()
  }
  modelStatusOpen(){
    (function ($) {
      $("#updateStatus").modal("show");
    })(jQuery);
  }
  modelCommentStatusOpen(){
    (function ($) {
      $("#commentStatus").modal("show");
    })(jQuery);
  }
  modelCommentStatusClose(){
    (function ($) {
      $("#commentStatus").modal("hide");
    })(jQuery);
    this.getEmrReqList()
  }
  modelUpdateStatusClose() {
   
    (function ($) {
      $("#updateStatus").modal("hide");
    })(jQuery);
    this.getEmrReqList()
  }
  statusChange(){
    let body:any ={
      Id: this.selectedId,
      Stage:this.selectedStatus,
    }
 
    // const Live = this.statusList.find((item:any) => item.Value.toLowerCase() === 'live');
    if (body.Stage != 5){
    this.api
          .callApi(this.constant.EMRReqStatusChange,body, 'PUT', true, true)
          .subscribe(
            (res: any) => {
                var resp = res;
                if(resp.Status ==1){
                  this.selectedId='',
                  this.selectedStatus='',              
                this.modelUpdateStatusClose()
                this.toastr.success(resp.Message,'Access Med Lab');
             
               
                }
            },
            (err: any) => {
              this.selectedId='',
                  this.selectedStatus='',   
                  this.modelUpdateStatusClose()
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
        }
        else{
          // console.log("status")
          this.modelUpdateStatusClose()
          this.modelCommentStatusOpen()
        }
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
  Submit(){
    let body: any = {
      Id: this.selectedId,
      Stage: this.selectedStatus,
      DeniedReason: this.commentStatus || ''
    }
      this.api
      .callApi(this.constant.EMRReqStatusChange, body, 'PUT', true, true)
      .subscribe(
          (res: any) => {
              var resp = res;
              if (resp.Status == 1) {
                  this.selectedId = '';
                  this.selectedStatus = '';
                  this.modelCommentStatusClose();
                  this.toastr.success(resp.Message, 'Access Med Lab');
              }
          },
          (err: any) => {
              this.selectedId = '';
              this.selectedStatus = '';
              this.modelCommentStatusClose();
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
      );
}
  
  exportExcel(){

    var exportrequest=this.requestPayload;
    exportrequest.PageSize=this.emrReqList.total;
    //console.log("Getting requets", exportrequest);
    this.api
    .callApi(
      this.constant.EmrCentralList +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(exportrequest)),
      [],
      'GET',
      true,
      true
    )
    .subscribe(
      (res: any) => {
        var resp=res.EmrRequestList;
        const modifyField = resp.map((element:any) => ({
          'Account No#': element.AccountNo,
          'Client Name': element.ClientName,
          'Assigned To': element.AssignedTo,
          'Date Submitted': this.datePipe.transform(element.Createddate,'MM/dd/yyyy'),
          'Order #': element.Orderno,
          'Vendor Name': element.VendorName,
          'Vendor Contact Name': element.VendorContactname,
          'Vendor Contact': element.VendorContact,
          'EMR Type': element.EmrTypeText,
          'POC Name': element.PocName,
          'POC Email': element.PocEmail,
          'POC Phone': element.PocPhone,
          'Status': element.StageName
        }));
        this.excelService.exportToExcel(modifyField, 'EMR_Requests.xlsx');
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      } 
    );
  }

  viewAddModel(id:any){
    this.selectedId = id
    this.getcommentList() 
   }
   getcommentList() {
    this.api
      .callApi(
        this.constant.EMRCommentList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.selectedId)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          
          this.commentList = res
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  modelViewClose() {
    this.selectedId='',
    
     (function ($) {
       $("#viewAdd").modal("hide");
     })(jQuery);
   }
   onAddComment() {
    if (this.comment == '') {
      return;
    } else {
      let body:EMRCommentBody = {
        EmrCentralId: this.selectedId,
        Comment: this.comment,
      };
      this.api
        .callApi(this.constant.EMRAddComment, body, 'POST', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.comment = '';
            
            this.getcommentList()
          },
          (err: any) => {
            
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
}
