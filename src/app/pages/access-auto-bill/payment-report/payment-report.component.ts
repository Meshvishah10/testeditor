import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { PaymentReportResponse } from 'src/app/models/PaymentReport.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { ExcelService } from 'src/app/services/export-excel.service';
declare var jQuery: any;
@Component({
  selector: 'app-payment-report',
  templateUrl: './payment-report.component.html',
  styleUrl: './payment-report.component.scss'
})
export class PaymentReportComponent {
  paymentReportList:any;
  statusList:any
  permission:any
  submittedDateFrom:any
  submittedDateTo:any
  invoiceId:any
  cardList:any
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    AccountNo: null,
    SubmittedDateFrom: null,
    SubmittedDateTo: null,
    Status: '',
    
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
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private datePipe: DatePipe,
    private excelService: ExcelService
  ) {}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
 
    this.permission = permissions.find((item: any) => {
      return item.Type == 56;
    });
    
    // Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.getPaymentReportList();
      this.getMasterDetails();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }
  getMasterDetails() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe((res: any) => {
       
        this.statusList = res.ClientBillingPaymentStage;
        this.cardList = res.CardTypeList
      });
  }

  getPaymentReportList() { 
   
 
  
      this.requestPayload.SubmittedDateFrom = this.submittedDateFrom
        ? this.datePipe.transform(
            new Date(this.submittedDateFrom),
            'MM/dd/yyyy'
          ) 
        : null;
      this.requestPayload.SubmittedDateTo = this.submittedDateTo
        ? this.datePipe.transform(new Date(this.submittedDateTo), 'MM/dd/yyyy')
        : null;
    

    this.api
      .callApi(
        this.constant.PaymentReportList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: PaymentReportResponse) => {
          this.paymentReportList = {
            data: res.PaymentReportList,
            total: res.Total,
          };
        },
        (err: any) => {
          //console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  OnReset() {
    this.requestPayload.AccountNo = null;
    this.requestPayload.SubmittedDateFrom = null;
    this.requestPayload.SubmittedDateTo = null;
    this.requestPayload.Status = '';
    this.submittedDateFrom = null;
    this.submittedDateTo = null;
    this.paymentReportList = {
      data: [],
      total: 0,
    };
    this.getPaymentReportList();
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
        if (filter.Field === 'PaymentDate' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        
        return filter;
      });
    }
    this.getPaymentReportList();
  }
  search() {
    const state: DataStateChangeEvent = {
      skip: 0,
      take: this.state.take !== undefined ? this.state.take : 50,
      sort: this.state.sort,
      filter: this.state.filter,
    };
    this.dataStateChange(state);
  }
  modelChargeInvoiceOpen(id: string) {

    (this.invoiceId = id),
      (function ($) {
        $('#charge-invoice-modal').modal('show');
      })(jQuery);
  }
  modelChargeInvoiceClose() {
    (function ($) {
      $('#charge-invoice-modal').modal('hide');
    })(jQuery);
    this.invoiceId = '';
    //this.getBillingList();
  }
    onPayInvoice() {
      // console.log((this.invoiceId))
      this.api
        .callApi(
          this.constant.PaymentReportChargeInvoice +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(this.invoiceId)),
          [],
          'GET',
          true,
          true
        )
        .subscribe(
          (res: any) => {
            if(res.Status == 2){
              this.toastr.info(res.Message, 'Access Med Lab');
            }else{
              this.toastr.success(res.Message, 'Access Med Lab');
            }
            this.getPaymentReportList();
            this.modelChargeInvoiceClose();
          },
          (err: any) => {
            this.getPaymentReportList();
            this.toastr.error(err.error?.errors[0].message, 'Access Med Lab');
            this.modelChargeInvoiceClose()
          }
        );
    }

    exportExcel(){
      var paymentrequest=this.requestPayload;
      paymentrequest.PageSize=this.paymentReportList.total;
      // console.log("Getting requets", paymentrequest);
      this.api
      .callApi(
        this.constant.PaymentReportList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(paymentrequest)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp=res.PaymentReportList;
          const modifyField = resp.map((element:any) => ({
            'Invoice#': element.InvoiceNo,
            'Account#': element.AccountNo,
            'Account Name': element.AccountName,
            'Amount': element.Amount.toFixed(2),
            'Card Type': element.CardType,
            'Status': element.StatusText,
            'Message': element.Message,
            'Payment Date': this.datePipe.transform(element.PaymentDate,'MM/dd/yyyy')
          }));
          this.excelService.exportToExcel(modifyField, 'Payment_Report.xlsx');
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        } 
      );
    }
  
}
