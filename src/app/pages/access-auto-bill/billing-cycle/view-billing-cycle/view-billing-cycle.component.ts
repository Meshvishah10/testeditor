import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { BillingCycleDetail } from 'src/app/models/BillingCycle.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-view-billing-cycle',
  templateUrl: './view-billing-cycle.component.html',
  styleUrl: './view-billing-cycle.component.scss',
})
export class ViewBillingCycleComponent {
  id = '';
  billingCycleDetails: any;
  resData: any;
  permission: any = '';
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
      return item.Type == 55;
    });
    // Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.id = this.activatedRoute.snapshot.params['id'];
      this.id = this.common.DecryptID(this.id);
      if (this.id) {
        this.requestPayload.BillingCycleId = this.id;
        this.getBillingCycle();
      }
      this.getMasterDetails();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getMasterDetails() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe((res: any) => {
        this.statusList = res.BillingCycleDetailStatusList;
      });
  }
  isValidDate(dateString: string | null | undefined): boolean {
    return dateString ? !isNaN(Date.parse(dateString)) : false;
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
        if (filter.Field == 'DOB' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          
        }
        if (filter.Field === 'SVCDate' && filter.Value instanceof Date) {
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

    this.getBillingCycle();
  }

  getBillingCycle() {
    this.api
      .callApi(
        this.constant.BillingCycleDetailsList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log(res);
          this.resData = res;
          this.billingCycleDetails = {
            data: res.BillingCycleDetailList as BillingCycleDetail[],
            total: res.Total,
          };
        },
        (err: any) => {
          // console.log(err);
        }
      );
  }

  generateInvoice() {
    this.api
      .callApi(
        this.constant.BillingCycleGenerateInvoice +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.resData.BillingCycleId)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log(res);
          this.toastr.success(res.Message, 'Access Med Lab');
          this.getBillingCycle();
        },
        (err: any) => {
          // console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
