import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;

@Component({
  selector: 'app-viewdatastage',
  templateUrl: './viewdatastage.component.html',
  styleUrl: './viewdatastage.component.scss'
})
export class ViewdatastageComponent {
    // Declare common variables
  datastageList: any;
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    FromDate: null,
    ToDate: null,
  };

  Fromdate:any;
  todate:any;


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
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    private datePipe: DatePipe,
    public FilterAndSortingService: FilterAndSortingService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
      this.getDataStaeList();
    
  }

  getDataStaeList() {
    this.datastageList = {
      data: [],
      total: 0
   };
  
      this.requestPayload.FromDate = this.Fromdate ?this.datePipe.transform(new Date(this.Fromdate),'MM/dd/yyyy'):null;
      this.requestPayload.ToDate = this.todate ?this.datePipe.transform(new Date(this.todate),'MM/dd/yyyy'):null;
  

    this.api
      .callApi(
        this.constant.DataStage +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.datastageList = {
            data: res.dataStages,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Handle data state change (pagination, sorting, filtering)
  public dataStateChange(state: DataStateChangeEvent): void {
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);

    this.state = state;
    this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
     if (RequestData.Filters !== null && RequestData.Filters.length > 0) {
      this.requestPayload.Filters = RequestData.Filters.map((filter: any) => {
          if (filter.Field === 'Date__c' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
     
          return filter;
      });}
    this.requestPayload.Filters = RequestData.Filters;
    this.requestPayload.Page = (state.skip + state.take) / state.take;
    this.getDataStaeList();
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

  OnReset() {
    this.requestPayload.CustomSearch = '';
    this.Fromdate = null;
    this.todate = null;
    this.requestPayload.FromDate = null
    this.requestPayload.ToDate = null;
    this.getDataStaeList();
  }

  onCancel() {
    // this.cancel.emit();
    this.activeModal.close();
  }
}
