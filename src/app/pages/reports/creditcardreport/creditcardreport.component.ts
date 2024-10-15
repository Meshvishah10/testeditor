import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { State } from '@progress/kendo-data-query';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { DatePipe } from '@angular/common';
import { AutoCompleteComponent } from '@progress/kendo-angular-dropdowns';
import { delay, from, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-creditcardreport',
  templateUrl: './creditcardreport.component.html',
  styleUrl: './creditcardreport.component.scss'
})
export class CreditcardreportComponent {

  //Declare Common Variable
  Cardresp: any;
  ClientList:any;
  Clientresp:any;
 // common payload for get Report List
 requestpayload: any = {
  Page: 1,
  PageSize: 50,
  Sorts: null,
  Filters: null,
  FromDate:null,
  ToDate :null,
  ClientId:null
};
  FromDate:any;
  ToDate:any;
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
  clientId:any='';
  Stagetext:any;

  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,public activatedRoute: ActivatedRoute,private common:CommonService,private toastr: ToastrService,public FilterAndSortingService:FilterAndSortingService,private datePipe: DatePipe){}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
   
    this.permission = permissions.find((item: any) => {
      return item.Type == 65;
    });
    //Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      // this.ToDate = new Date();
      // this.FromDate = new Date();
      // this.FromDate.setDate(this.ToDate.getDate() - 7);
      this.getCardAchLogTypeList();
      this.getReportList();
      this.getUserList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getUserList(){
    this.api
    .callApi(this.constant.getAccountList, [],'GET', true, true).subscribe((res:any)=>{
      this.Clientresp=res;
      this.ClientList=this.Clientresp.length != 0 ? this.Clientresp.slice() : this.Clientresp;
      this.ClientList=res;     
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  getCardAchLogTypeList() {
    this.api
      .callApi(
        this.constant.MasterDetails,
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.Stagetext = res.ClientCardAchLogTypeList;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  getReportList(){
      this.requestpayload.FromDate = this.FromDate ?this.datePipe.transform(new Date(this.FromDate),'MM/dd/yyyy'):null;
      this.requestpayload.ToDate = this.ToDate ?this.datePipe.transform(new Date(this.ToDate),'MM/dd/yyyy'):null;
    this.api
      .callApi(
        this.constant.CreditCardLogs +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.Cardresp = {
            data: res.CreditCardLogList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  ngAfterViewInit() {
    // filter autocomplete account list
    const contains = (value:any) => (s:any) => s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    this.autoComplete.filterChange
      .asObservable()
      .pipe(
        switchMap((value:any) =>
          from([this.Clientresp]).pipe(
            tap(() => (this.autoComplete.loading = true)),
            delay(100),
            map((data:any) => data.filter(contains(value)))
          )
        )
      )
      .subscribe((x) => {
        this.ClientList = x;
        this.autoComplete.loading = false;
      });
 }

   // Call Function when data state changes , user click on next page or order
   public dataStateChange(state: DataStateChangeEvent): void {
    // call Filter and Soring Function
    var RequestData=this.FilterAndSortingService.prepareRequestPayload(state);
    this.state=state;
    this.requestpayload.PageSize=state.take;
    this.requestpayload.Sorts=RequestData.Sorts;
    this.requestpayload.Filters=RequestData.Filters;
    this.requestpayload.Page = (state.skip + state.take) / state.take;
  this.getReportList();
}
search() {  
  const state: DataStateChangeEvent = {
    skip: 0,
    take: this.state.take !== undefined ? this.state.take : 50,
    sort: this.state.sort, 
    filter: this.state.filter 
  };

  const selectedItem = this.ClientList.find((item:any) => item.Value === this.clientId);
  this.requestpayload.ClientId = selectedItem?.Key || null;

  this.dataStateChange(state);
}
OnReset(){
  this.requestpayload.ClientId=null;
  this.clientId='';
  this.ToDate = null;
  this.FromDate = null;
  this.requestpayload.FromDate = null
  this.requestpayload.ToDate=null
  this.Cardresp = {
    data: [],
    total: 0,
  };
  this.getReportList();
}
}
