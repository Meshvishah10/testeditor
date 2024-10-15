import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-returned-discared-specimen',
  templateUrl: './returned-discared-specimen.component.html',
  styleUrl: './returned-discared-specimen.component.scss'
})
export class ReturnedDiscaredSpecimenComponent {
  statusList:any
  specimenList:any
  severityList:any
  permission: any = '';
  TypeList:any
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
   private datePipe: DatePipe){
 }
  ngOnInit() {
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 34;
    });
  
    if (this.permission.MenuPermission.View == true) {  
      this.getSpecimenList()
      this. getStatusList()      
    }
    else{
        this.router.navigate(['/lab/dashboard']);
    }
  }
  getSpecimenList(){
    this.api
      .callApi(
        this.constant.AllSpecimenList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res:any) => {
      
          this.specimenList = {
            data: res.specimenList,
            total: res.Total,
          };
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
    this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
    this.requestPayload.Filters = RequestData.Filters;
    this.requestPayload.Page = (state.skip + state.take) / state.take;
    if (RequestData.Filters !== null && RequestData.Filters.length > 0) {
      this.requestPayload.Filters = RequestData.Filters.map((filter: any) => {
          if (filter.Field === 'DueDate' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
          if (filter.Field === 'SeverityName') {
            filter.Field = 'Severity';
          }
          if (filter.Field === 'StageName') {
            filter.Field = 'Stage';
          }
          return filter;
      });}
    this.getSpecimenList()
   
  }
  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.statusList = res?.ReturnedDiscardedSpecimenTicketStatusList
          this.TypeList=res?.ReturnedDiscardedSpecimenTicketTypeList
          this.severityList =  res?.SeverityList     
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  reidrectView(Id:any): void {
    // Navigate to another route with the ticketNumber as a parameter
    //EncryptID
    this.router.navigate(['/lab/follow-up/discard-specimen/view', this.common.EncryptID(Id) ]);
  }
add() {
this.router.navigate(['/lab/follow-up/discard-specimen/add'])
}
}

