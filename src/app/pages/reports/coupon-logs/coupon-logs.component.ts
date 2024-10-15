import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AutoCompleteComponent } from '@progress/kendo-angular-dropdowns';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { delay, from, switchMap, tap, map } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { ExcelService } from '../../../services/export-excel.service';
import { DecimalPipe } from '@angular/common';
declare var jQuery: any;
@Component({
  selector: 'app-coupon-logs',
  templateUrl: './coupon-logs.component.html',
  styleUrl: './coupon-logs.component.scss',
  providers: [DecimalPipe]
})
export class CouponLogsComponent {
  CouponResp: any;
  CouponList: any;
  ClientList: any;
  CouponTypeList: any;
  Clientresp: any;
  clientId: any;
  orderdetails:any;
  requestpayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    ClientId: null,
    ShippingName: null,
    CouponCode: null,
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

  @ViewChild('autocomplete') public autoComplete!: AutoCompleteComponent;

  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public FilterAndSortingService: FilterAndSortingService,
    private datePipe: DatePipe,
    private excelService: ExcelService,
    private decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 76;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getCouponTypeList();
      this.getCouponList();
      this.getUserList();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getUserList() {
    this.api
      .callApi(this.constant.getAccountList, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.Clientresp = res;
          this.ClientList =
            this.Clientresp.length != 0
              ? this.Clientresp.slice()
              : this.Clientresp;
          this.ClientList = res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  ngAfterViewInit() {
    // filter autocomplete account list
    const contains = (value: any) => (s: any) =>
      s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    this.autoComplete.filterChange
      .asObservable()
      .pipe(
        switchMap((value: any) =>
          from([this.Clientresp]).pipe(
            tap(() => (this.autoComplete.loading = true)),
            delay(100),
            map((data: any) => data.filter(contains(value)))
          )
        )
      )
      .subscribe((x) => {
        this.ClientList = x;
        this.autoComplete.loading = false;
      });
  }

  getCouponList() {
    this.api
      .callApi(
        this.constant.CouponLogs +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          
          this.CouponResp = {
            data: res.CouponLogList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  getCouponTypeList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.CouponTypeList = res.AffProductCouponTypeList;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    // call Filter and Soring Function
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);
    this.state = state;
    this.requestpayload.PageSize = state.take;
    this.requestpayload.Sorts = RequestData.Sorts;
    this.requestpayload.Filters = RequestData.Filters;
    this.requestpayload.Page = (state.skip + state.take) / state.take;
    this.getCouponList();
  }
  search() {
    const state: DataStateChangeEvent = {
      skip: 0,
      take: this.state.take !== undefined ? this.state.take : 50,
      sort: this.state.sort,
      filter: this.state.filter,
    };

    const selectedItem = this.ClientList.find(
      (item: any) => item.Value === this.clientId
    );
    this.requestpayload.ClientId = selectedItem?.Key || null;

    this.dataStateChange(state);
  }
  OnReset() {
    this.requestpayload.ClientId = null;
    this.clientId = null;
    // this.requestpayload.ClientName = null;
    this.requestpayload.ShippingName = null;
    this.requestpayload.CouponCode = null;
    this.CouponResp = {
      data: [],
      total: 0,
    };
    this.getCouponList();
  }

  exportExcel(){
    
   
  var exportrequest=this.requestpayload;
  exportrequest.PageSize=this.CouponResp.Total;

  this.api
    .callApi(
      this.constant.CouponLogs +
      '?inputRequest=' +
      encodeURIComponent(this.common.Encrypt(this.requestpayload)),
      [],
      'GET',
      true,
      true
    )
    .subscribe(
      (res: any) => {
        var resp=res.CouponLogList;
        const modifyField = resp.map((element:any) => ({
          'Order Date': this.datePipe.transform(element.CreatedDate,'MM/dd/yyyy'),
          'Order #': element.OrderNo,
          'Practice Name': element.ClientName,
          'Shipping Name': element.ShippingName,
          'Shipping Address': element.ShippingFullAddress,
          'Coupon Code': element.CouponCode,
          'Disount Amount': '$'+ this.decimalPipe.transform(element.CouponDiscount , '1.2-2'),
        }));
        this.excelService.exportToExcel(modifyField, 'Coupon_logs.xlsx');
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }

  OrderDetails(id:any){
    // console.log("Getting Id", id);
    this.api
      .callApi(this.constant.CouponOrderDetails+ '?inputRequest=' +
      encodeURIComponent(this.common.Encrypt(id)),[], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.orderdetails=res;
          (function ($) {
            $("#orderdetailshow").modal("show");
          })(jQuery);
          // console.log("Getting response",this.orderdetails);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  detailmodelclose(){
    (function ($) {
      $("#orderdetailshow").modal("hide");
    })(jQuery);
  }
}
