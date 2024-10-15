import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { TicketCenterResponse } from 'src/app/models/ticket-central.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { DatePipe } from '@angular/common';
import { undoIcon } from '@progress/kendo-svg-icons';
@Component({
  selector: 'app-ticket-resolution',
  templateUrl: './ticket-resolution.component.html',
  styleUrl: './ticket-resolution.component.scss'
})
export class TicketResolutionComponent {
  ticketList: any;
  UserList: any;
  StageList: any;
  TicketTypeList: any;
  fromdate:any;
  todate:any
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    UserId: '',
    FromDate: null,
    ToDate: null,
    TicketId: null,
    Stage: '',
    Tickettype: '',
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

  Severity: any[] = [
    { key: 1, value: 'Standard' },
    { key: 2, value: 'High' },
    { key: 3, value: 'Medium' },
    { key: 4, value: 'Low' },
  ];

  stage:any[]=[
    { key: 1, value: 'Open' },
    { key: 2, value: 'Pending' },
    { key: 3, value: 'Closed' },
  ]

  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 3;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getUserList();
      this.getTicketList();
      this.getStateAndTicketTypeList();
    } else{
        this.router.navigate(['/lab/dashboard']);
    }
  }

  getTicketList() {
      this.requestPayload.FromDate = this.fromdate ?this.datePipe.transform(new Date(this.fromdate),'MM/dd/yyyy'):null;
      this.requestPayload.ToDate = this.todate ?this.datePipe.transform(new Date(this.todate),'MM/dd/yyyy'):null;
    this.api
      .callApi(
        this.constant.GetAllTickets +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: TicketCenterResponse) => {
          this.ticketList = {
            data: res.NCSalesCentralList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  //get userlist
  getUserList() {
    this.api
      .callApi(this.constant.getNCUserlist, [], 'GET', true, true)
      .subscribe(
        (res: TicketCenterResponse) => {
          this.UserList = res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  getStateAndTicketTypeList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          (this.StageList = res?.TicketStageList),
            (this.TicketTypeList = res?.TicketsTypeList);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
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
          if (filter.Field === 'Createddate' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
          if (filter.Field === 'Status') {
            filter.Field = 'StatusText';
        }
        
          return filter;
      });
    } 
    if (this.ticketList.total < state.take) {
    this.state = {
      ...this.state,
      skip: 0
    };
  }
    this.getTicketList();
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
  //reset method
  OnReset() {
    this.requestPayload.UserId = '';
    this.fromdate = null;
    this.todate = null;
    this.requestPayload.Stage = '';
    this.requestPayload.TicketId = null;
    this.requestPayload.Tickettype = '';
    this.requestPayload.FromDate=null;
    this.requestPayload.ToDate=null;

    this.ticketList = {
      data: [],
      total: 0,
    };
    this.getTicketList();
  }
  reidrectView(ticketNumber: string,ticketType:string, ticketId:any): void {
    // Navigate to another route with the ticketNumber as a parameter
    //EncryptID
    // console.log(ticketNumber,ticketType,)
    if(ticketType == 'NPI Request'){
      this.router.navigate(['/lab/ticket-resolution/npi-request/view', this.common.EncryptID(ticketNumber)  ]);
    }else{
      this.router.navigate(['/lab/ticket-resolution/view/', this.common.EncryptID(ticketNumber),this.common.EncryptID(ticketType) , ticketId ]);
    }
   
  }
}
