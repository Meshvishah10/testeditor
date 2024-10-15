import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-ups-pickup-logs',
  templateUrl: './ups-pickup-logs.component.html',
  styleUrl: './ups-pickup-logs.component.scss',
})
export class UpsPickupLogsComponent {
  @Input() UpsId: any = '';
  //Declare Common Variable
  logData: any;
  // common payload for get Report List
  requestpayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    FromDate: null,
    ToDate: null,
    ClientId: null,
    UpsId: null,
  };
  FromDate: any;
  ToDate: any;
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

  Stagetext: any[] = [
    { key: 2, value: 'Update' },
    { key: 1, value: 'View' },
  ];

  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public FilterAndSortingService: FilterAndSortingService,
    private datePipe: DatePipe,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    // this.clientId =
    //   this.activatedRoute.snapshot.params['id'] !== undefined
    //     ? this.common.DecryptID(this.activatedRoute.snapshot.params['id'])
    //     : '';
    // if (this.activatedRoute.snapshot.params['id'] && !this.clientId) {
    //   this.toastr.error('Invalid Request.');
    // }
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 21;
    });
    if (this.permission?.MenuPermission.View == true) {
      this.getLogs();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onCancel() {
    // this.cancel.emit();
    this.UpsId = '';
    this.requestpayload = null;
    this.activeModal.close();
  }

  getLogs() {
    if (this.FromDate != null || this.ToDate != null) {
      this.requestpayload.FromDate =
        this.FromDate != null
          ? this.datePipe.transform(new Date(this.FromDate), 'MM/dd/yyyy')
          : undefined;
      this.requestpayload.ToDate =
        this.ToDate != null
          ? this.datePipe.transform(new Date(this.ToDate), 'MM/dd/yyyy')
          : undefined;
    }
    this.requestpayload.UpsId = this.UpsId;
    this.api
      .callApi(
        this.constant.UPSPickupLog +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log(res);
          this.logData = {
            data: res.UpsPickupLogList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Call Function when data state changes , user click on next page or order
  public dataStateChange(state: DataStateChangeEvent): void {
    // call Filter and Soring Function
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);
    this.state = state;
    this.requestpayload.PageSize = state.take;
    this.requestpayload.Sorts = RequestData.Sorts;
    this.requestpayload.Filters = RequestData.Filters;
    this.requestpayload.Page = (state.skip + state.take) / state.take;
    this.getLogs();
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
  OnReset() {
    this.requestpayload.ClientId = null;
    this.ToDate = null;
    this.FromDate = null;
    this.requestpayload.FromDate = null;
    this.requestpayload.ToDate = null;
    this.logData = {
      data: [],
      total: 0,
    };
    this.getLogs();
  }
}
