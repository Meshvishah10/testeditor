import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { AddBillingCycleComponent } from './add-billing-cycle/add-billing-cycle.component';
import { BillingCycle } from 'src/app/models/BillingCycle.model';
import { ExcelService } from 'src/app/services/export-excel.service';
declare var jQuery: any;

@Component({
  selector: 'app-billing-cycle',
  templateUrl: './billing-cycle.component.html',
  styleUrl: './billing-cycle.component.scss',
})
export class BillingCycleComponent {
  // Declare Common Variables
  billingCycleList: any;
  isSubmitted: any = false;
  statusList: any;
  link = '';

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
      return item.Type == 55;
    });
    // Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.getBillingCycleList();
      this.getMasterDetails();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getBillingCycleList() {
    this.api
      .callApi(
        this.constant.BillingCycleList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.billingCycleList = {
            data: res.BillingCycleList as BillingCycle[],
            total: res.Total,
          };
          this.link = res.SampleFileImportBillingCycleURL;
        },
        (err: any) => {
          // console.log(err);
        }
      );
  }

  addBillingCycle() {
    const modalRef = this.modalService.open(AddBillingCycleComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.sampleFileLink = this.link;
    modalRef.result.then((result) => {
      // console.log(result);
      if (result === 'Yes') {
        this.getBillingCycleList();
      }
    });
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

    this.getBillingCycleList();
  }

  getMasterDetails() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe((res: any) => {
        this.statusList = res.BillingCycleStatusList;
      });
  }

  exportBillingCycle(id: any) {
    this.api
      .callApi(
        this.constant.ExportBillingCycle +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          const modifyField = res.map((element: any) => ({
            'Client Number': element.ClientNumber,
            'Client Name': element.ClientName,
            'Total Amount': element.TotalAmount,
            ACH: element.ACH,
            'ACH Bank Routing': element.ACHBankRouting,
            'ACH Bank Account Number': element.ACHBankAccountNumber,
          }));
          this.excelService.exportToExcel(modifyField, 'Billing_cycle.xlsx');

          // this.toastr.success(res.Message, 'Access Med Lab');
        },
        (err: any) => {
          // console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  onViewBillingCycle(id: any) {
    this.router.navigate([
      `/lab/access-auto-bill/billing-cycle/view/${this.common.EncryptID(id)}`,
    ]);
  }

  // Set product  id for deletion
  deleteModel(id: string) {
    this.deleteIds.push(id);
  }

  // Delete product
  deleteProduct() {
    this.api
      .callApi(
        this.constant.BillingCycle +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.deleteIds)),
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
            if (this.billingCycleList.data.length == this.deleteIds.length) {
              this.state.skip = 0;
              this.state.take = 50;
              this.requestPayload.Page =
                (this.state.skip + this.state.take) / this.state.take;
            }
            this.modelDeleteClose();
            this.getBillingCycleList();
          }
        },
        (err: any) => {
          this.disable = false;
          this.modelDeleteClose();
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Close delete modal
  modelDeleteClose() {
    this.deleteIds = [];
    this.billingCycleList.data.map((e: any) => (e.isSelected = false));
    (function ($) {
      $('#deleteProduct').modal('hide');
    })(jQuery);
  }
}
