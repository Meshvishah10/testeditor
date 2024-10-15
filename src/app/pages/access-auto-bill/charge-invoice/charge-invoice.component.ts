import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { CardDetailResponse, ChargeInvoiceResponse } from 'src/app/models/ChargeInvoice.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;

@Component({
  selector: 'app-charge-invoice',
  templateUrl: './charge-invoice.component.html',
  styleUrl: './charge-invoice.component.scss'
})
export class ChargeInvoiceComponent {
 // Declare Common Variables
 chargeInvoiceList: any;
 isSubmitted: any = false;
 statusList: any;

 requestPayload: any = {
   Page: 1,
   PageSize: 50,
   Sorts: null,
   Filters: null,
   CustomSearch: '',
 };

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

 permission: any = '';
 uniqueId: any = '';
 disable: boolean = false;
 deleteIds: string[] = [];
  response: any = '';

 constructor(
   private router: Router,
   private api: ApiService,
   private constant: ConstantService,
   public activatedRoute: ActivatedRoute,
   private common: CommonService,
   private toastr: ToastrService,
   public formBuilder: FormBuilder,
   public FilterAndSortingService: FilterAndSortingService,
   private datePipe: DatePipe
 ) {}

 ngOnInit() {
   let permissions = this.common.Decrypt(localStorage.getItem('permission'));
   this.permission = permissions.find((item: any) => {
     return item.Type == 67;
   });
   // Load Department Using this function
   if (this.permission.MenuPermission.View == true) {
     this.getChargeInvoice();
     this.getMasterDetails();
   } else {
     this.router.navigate(['/lab/dashboard']);
   }
 }

 getChargeInvoice() {
   this.api
     .callApi(
       this.constant.getChargeInvoice +
         '?inputRequest=' +
         encodeURIComponent(this.common.Encrypt(this.requestPayload)),
       [],
       'GET',
       true,
       true
     )
     .subscribe(
       (res: ChargeInvoiceResponse) => {   
      //  console.log(res);
         this.chargeInvoiceList = {
           data: res.AutoBillClientChargeInvoicesList,
           total: res.Total,
         };
       },
       (err: any) => {
        //  console.log(err);
       }
     );
 }

 addBillingCycle() {
   this.router.navigate(['/lab/access-auto-bill/charge-invoice/add']);
 }
 // Handle data state change (pagination, sorting, filtering)
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
       if (filter.Field === 'CreatedDate' && filter.Value instanceof Date) {
         filter.Value =
           this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
       }
       if (filter.Field === 'BillingPeriod' && filter.Value instanceof Date) {
         filter.Value =
           this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
       }
       if (filter.Field === 'InvoiceDate' && filter.Value instanceof Date) {
         filter.Value =
           this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
       }
       if (filter.Field === 'StatusText') {
         filter.Field = 'Status';
       }
       // if (filter.Field === 'ShippingMethod') {
       //   filter.Field = 'ShippingType';
       // }
       return filter;
     });
   }

   this.getChargeInvoice();
 }

 getMasterDetails() {
   this.api
     .callApi(this.constant.MasterDetails, [], 'GET', true, true)
     .subscribe((res: any) => {
       this.statusList = res.ClientChargeInvoiceStage;
     });
 }

 listDataStageOpen(id:any){
  (function ($) {
    $("#InfoModel").modal("show");
  })(jQuery);
  this.viewChargeInvoiceModel(id)
}
  listDataStageClose() { 
    (function ($) {
      $("#InfoModel").modal("hide");
    })(jQuery);
  }
  viewChargeInvoiceModel(id:any){
    this.api
        .callApi(
          this.constant.AddChargeInvoice +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(id)),
          [],
          'GET',
          true,
          true
        )
        .subscribe(
          (res: CardDetailResponse) => {
            this.response=res;
          },
          (err: any) => {       
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            this.listDataStageClose()
          }
        );
  }

  closeModel(){
    this.response=[];
  }
}
