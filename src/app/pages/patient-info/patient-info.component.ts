import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { PatientInfoListResponse, PatientStatusBody } from 'src/app/models/PatientInfo.model';

import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  styleUrl: './patient-info.component.scss'
})
export class PatientInfoComponent {
  permission:any
  fromDate:any
  toDate:any
  statusList!: any[];
  patientInfoList:any
  selectedId:string = ''
  selectedStatus:any
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomerName: null,
    FromDate:null,
    ToDate:null
   
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
      return item.Type == 20;
    });
    if (this.permission.MenuPermission.View == true) {
      
      this.getStatusList()
      this.getPatientInfoList() ;
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }
  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.statusList = res?.PatientInfoUpdateList
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  OnReset() {
    this.requestPayload.CustomerName = null;
    this.requestPayload.FromDate = null
    this.requestPayload.ToDate=null
    this.fromDate = null
    this.toDate = null
    this.patientInfoList = {
      data: [],
      total: 0,
    };
    this.getPatientInfoList() ;
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
            if (filter.Field === 'CorrectedDOB' && filter.Value instanceof Date) {
                filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
            }
            if (filter.Field === 'CurrentDOB' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
        
        if (filter.Field === 'CreatedDate') {
          filter.Field = 'CreatedDateFilter';
      }
       
        
            return filter;
        });
      }
      if (RequestData.Sorts !== null && RequestData.Sorts.length > 0) {
      this.requestPayload.Sorts = RequestData.Sorts.map((filter: any) => {
        if (filter.Field === 'CorrectedDOB' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
        if (filter.Field === 'CurrentDOB' && filter.Value instanceof Date) {
            filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        if (filter.Field === 'CreatedDate') {
        filter.Field = 'CreatedDateFilter';
        }
        if (filter.Field === 'Stage') {
          filter.Field = 'StageText';
        }
          return filter;
      });
  }

    this.getPatientInfoList() ;
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
  getPatientInfoList() {
    // this.requestPayload.Stage = this.requestPayload.Stage === 'undefined' ? undefined : this.requestPayload.Stage;  
   
      this.requestPayload.FromDate = this.fromDate ?this.datePipe.transform(new Date(this.fromDate),'MM/dd/yyyy'):null;
      this.requestPayload.ToDate = this.toDate ?this.datePipe.transform(new Date(this.toDate),'MM/dd/yyyy'):null;
    
   
    
    this.api
      .callApi(
        this.constant.patientInfo +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: PatientInfoListResponse) => {
          this.patientInfoList = {
            data: res.PatientInfoList,
            total: res.Total,
          };
          this.patientInfoList.data.map((e: any) => {
            e.CreatedDate = new Date(e.CreatedDate);
            e.CurrentDOB = e.CurrentDOB ? new Date(e.CurrentDOB) : '';
            e.CorrectedDOB = e.CorrectedDOB ? new Date(e.CorrectedDOB) : '';
          });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  modelStatusOpen(){
    (function ($) {
      $("#updateStatus").modal("show");
    })(jQuery);
  }
  statusChangeModal(id:any,Status:any){
    this.selectedId=id;
    this.selectedStatus=parseInt(Status)
    this.modelStatusOpen()
  }

  modelUpdateStatusClose() {
    this.selectedId='';
    this.selectedStatus='';
    (function ($) {
      $("#updateStatus").modal("hide");
    })(jQuery);
    this.getPatientInfoList()
  }
 //order status list
  StatusChange(){ 
    let body: PatientStatusBody = {
      Id: this.selectedId,
      Stage: this.selectedStatus,
    };
    this.api
      .callApi(this.constant.statusUpdatePatientInfo, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          if(resp.Status ==1){
          this.toastr.success(resp.Message,'Access Med Lab')
          this.modelUpdateStatusClose()
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          this.modelUpdateStatusClose()
        }
      );
      // this.getPatientInfoList()
  }

  redirectView(id:string): void {
    //EncryptID
    // console.log("Getting id", id);
    this.router.navigate([`/lab/patient-info/details/` + this.common.EncryptID(id)]);
  }
}
