import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { State } from '@progress/kendo-data-query';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { SalesCentralResponse } from 'src/app/models/sales-central.model';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-sales-central',
  templateUrl: './sales-central.component.html',
  styleUrls: ['./sales-central.component.scss']
})
export class SalesCentralComponent {
  //Declare Common Variable
  Saleslist: any;
  UserList:any;
  // common payload for get userlist
  requestpayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    FromDate:null,
    ToDate :null,
    UserId:null
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

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,public activatedRoute: ActivatedRoute,private common:CommonService,private toastr: ToastrService,public FilterAndSortingService:FilterAndSortingService,private datePipe: DatePipe){}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
   
    this.permission = permissions.find((item: any) => {
      return item.Type == 57;
    });
    //Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.ToDate = new Date();
      this.FromDate = new Date();
      this.FromDate.setDate(this.ToDate.getDate() - 7);

      this.getSalesList();
      this.getUserList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getUserList(){
    this.api
      .callApi(
        this.constant.getNCUserlist,
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: SalesCentralResponse) => {
          this.UserList=res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  getSalesList() {
  
    // console.log("Getting request Payload", this.requestpayload.UserId);
  
      this.requestpayload.FromDate = this.FromDate ?this.datePipe.transform(new Date(this.FromDate),'MM/dd/yyyy'):null;
      this.requestpayload.ToDate = this.ToDate ?this.datePipe.transform(new Date(this.ToDate),'MM/dd/yyyy'):null;
    
    this.api
      .callApi(
        this.constant.getAllSalesCentral +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: SalesCentralResponse) => {
          this.Saleslist = {
            data: res.NCSalesCentralList,
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
        var RequestData=this.FilterAndSortingService.prepareRequestPayload(state);

        this.state=state;
        this.requestpayload.PageSize=state.take;
        this.requestpayload.Sorts=RequestData.Sorts;
        this.requestpayload.Filters=RequestData.Filters;
        this.requestpayload.Page = (state.skip + state.take) / state.take;
      this.getSalesList();
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

    OnReset(){
      this.requestpayload.UserId=null;
      this.ToDate = new Date();
      this.FromDate = new Date();
      this.FromDate.setDate(this.ToDate.getDate() - 7);

      this.getSalesList();
    }

    redirectPrint(id:any){
      this.router.navigate(['/lab/salescentral/print/' + this.common.EncryptID(id)]);
    }
}
