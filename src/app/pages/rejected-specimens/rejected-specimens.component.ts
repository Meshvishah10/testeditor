import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { RejectedSpecimenListResponse } from 'src/app/models/RejectedSpecimen.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-rejected-specimens',
  templateUrl: './rejected-specimens.component.html',
  styleUrl: './rejected-specimens.component.scss'
})
export class RejectedSpecimensComponent {
  specimensList:any
  statusList:any
  fromdate:any
  todate:any
  departmentList:any
  rejectedReasonList:any
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    PatientName: null,
    AccessionNumber: null,
    ToDate: null,
    FromDate: null,
    RejectionReason: '',
    Department: '',
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
  stage:any[]=[
    { key: 1, value: 'Open' },
    { key: 2, value: 'Received' },
    { key: 3, value: 'Disregard' },
  ]

  permission: any = '';
  constructor( 
     private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe){
  }
  ngOnInit() {
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 18;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getStatusList()
      this.getSpecimensList()
    } else{
      this.router.navigate(['/lab/dashboard']);
  }
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
          return filter;
      });}
    this.getSpecimensList()
   
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
    this.requestPayload.PatientName = null;
    this.requestPayload.AccessionNumber = null;
    this.requestPayload.RejectionReason ='';
    this.requestPayload.Department = '';
    this.requestPayload.FromDate=null;
    this.requestPayload.ToDate=null;
    this.fromdate=null;
    this.todate=null;

    this.specimensList = {
      data: [],
      total: 0,
    };
    this.getSpecimensList()
  }
    getSpecimensList(){
      
          this.requestPayload.FromDate = this.fromdate ?this.datePipe.transform(new Date(this.fromdate),'MM/dd/yyyy'):null;
          this.requestPayload.ToDate = this.todate ?this.datePipe.transform(new Date(this.todate),'MM/dd/yyyy'):null;
        
        this.api
          .callApi(
            this.constant.specimenReqList +
              '?inputRequest=' +
              encodeURIComponent(this.common.Encrypt(this.requestPayload)),
            [],
            'GET',
            true,
            true
          )
          .subscribe(
            (res: RejectedSpecimenListResponse) => {
              
              this.specimensList = {
                data: res.NCRejectedSpecimenList,
                total: res.Total,
              };
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      
    }
    reidrectView(Id:any): void {
      // Navigate to another route with the ticketNumber as a parameter
      //EncryptID
      this.router.navigate(['/lab/rejected-specimens/view/', this.common.EncryptID(Id) ]);
    }
        //status list
    getStatusList() {
          this.api
            .callApi(this.constant.MasterDetails, [], 'GET', true, true)
            .subscribe(
              (res: any) => {
                this.statusList = res?.RejectedSpecimenTicketStatusList
                this.rejectedReasonList =  res?.RejectedSpecimenTicketRejectionReasonList
                this.departmentList=res?.RejectedSpecimenTicketDepartmentList
              },
              (err: any) => {
                this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
              }
            );
    }
}

