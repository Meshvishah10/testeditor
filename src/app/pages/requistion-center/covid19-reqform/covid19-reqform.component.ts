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
import { ExcelService } from '../../../services/export-excel.service';

@Component({
  selector: 'app-covid19-reqform',
  templateUrl: './covid19-reqform.component.html',
  styleUrl: './covid19-reqform.component.scss'
})
export class Covid19ReqformComponent {

  reqlist:any;
  fromdate:any;
  todate:any;
  requestPayload:any={
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    ToDate: null,
    FromDate: null,
    CustomerName : '',
    KitId : '',
  }

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

  constructor( 
    private api: ApiService,
   private constant: ConstantService,
   public activatedRoute: ActivatedRoute,
   private common: CommonService,
   private toastr: ToastrService,
   public formBuilder: FormBuilder,
   public FilterAndSortingService: FilterAndSortingService,
   private router: Router,
   private datePipe: DatePipe,
   private excelService:ExcelService){
 }

 ngOnInit() {
  let permissions = this.common.Decrypt(localStorage.getItem('permission'));
  this.permission = permissions.find((item: any) => {
    return item.Type == 16;
  });
  
  // console.log("Getting Permission" , this.permission)
  if (this.permission.MenuPermission.View == true) {
    this.getReqorder()
  } else{
    this.router.navigate(['/lab/dashboard']);
}
 }


 getReqorder(){
 
    this.requestPayload.FromDate = this.fromdate ?this.datePipe.transform(new Date(this.fromdate),'MM/dd/yyyy'):null;
    this.requestPayload.ToDate = this.todate ?this.datePipe.transform(new Date(this.todate),'MM/dd/yyyy'):null;
  
  this.api
    .callApi(
      this.constant.covid19ReqList +
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
        this.reqlist = {
          data: res.covid19RequisitionsList,
          total: res.Total,
        };
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
 }

 OnReset() {
  this.requestPayload.CustomerName = '';
  this.requestPayload.KitId = '';
  this.requestPayload.FromDate=null;
  this.requestPayload.ToDate=null;
  this.fromdate=null;
  this.todate=null;

  this.reqlist = {
    data: [],
    total: 0,
  };
  this.getReqorder()
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
      if (filter.Field === 'SubmittedDate' && filter.Value instanceof Date) {
        filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
      }
      if (filter.Field === 'Dob' && filter.Value instanceof Date) {
        filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
      }
        return filter;
    });}
  this.getReqorder()
 
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
reidrectView(Id:any): void {
  const url = this.router.serializeUrl(this.router.createUrlTree(['/covid19-req-details/',this.common.EncryptID(Id)]));
window.open(url, '_blank');
}

  exportCSV(){
    var exportrequest=this.requestPayload;
    exportrequest.PageSize=this.reqlist.Total;

    this.api
      .callApi(
        this.constant.covid19ReqList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(exportrequest)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp=res.covid19RequisitionsList;
          const modifyField = resp.map((element:any) => ({
            'Date Submitted': this.datePipe.transform(element.SubmittedDate,'MM/dd/yyyy hh:mm aa'),
            'Kit ID#': element.KitId,
            'First Name': element.FirstName,
            'Last Name':element.LastName,
            'Phone':element.Phone,
            'D.O.B': this.datePipe.transform(element.Dob,'MM/dd/yyyy'),
            'Email':element.Email,
            'Address':element.Address,
          }));
          this.excelService.exportToExcel(modifyField, 'Covid19_Req_Report.csv');
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  
}
