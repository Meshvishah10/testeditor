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
import { ExcelService } from '../../../services/export-excel.service';
@Component({
  selector: 'app-kits-sold',
  
  templateUrl: './kits-sold.component.html',
  styleUrl: './kits-sold.component.scss'
})
export class KitsSoldComponent {
  kitSoldList:any;
  productTypeList:any;
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    ProductId: null,
    AccountNumber: null,
    FromDate: null,
    ToDate: null,
  };
  Fromdate:any;
  Todate:any;
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
    private excelService: ExcelService
  ) {
    }
  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 29;
    });
    if(this.permission?.MenuPermission.View !== true){
      this.router.navigate(['/lab/dashboard'])
    }
    this.getProductTypeList() 
    this.getKitSoldList() 
  
  }
  
  getKitSoldList() {
    
      this.requestPayload.FromDate = this.Fromdate ?this.datePipe.transform(new Date(this.Fromdate),'MM/dd/yyyy'):null;
      this.requestPayload.ToDate = this.Todate ?this.datePipe.transform(new Date(this.Todate),'MM/dd/yyyy'):null;
    
    this.api
      .callApi(
        this.constant.kitSoldList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res:any) => {
          this.kitSoldList = {
            data: res.LogisticsCentralList,
            total: res.Total,
          };     
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  //get product type list
  getProductTypeList() {
    this.api
      .callApi(
        this.constant.kitSoldProductList ,
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res:any) => {
          this.productTypeList=res
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  //reset method
  OnReset() {
    this.requestPayload.ProductId = '';
    this.requestPayload.AccountNumber = null;
    this.Fromdate = null;
    this.Todate = null
    this.requestPayload.FromDate = null;
    this.requestPayload.ToDate = null;
    this.kitSoldList = {
      data: [],
      total: 0,
    };
    this.getKitSoldList() ;
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
            return filter;
        });
    }

    this.getKitSoldList();
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

  exportExcel(){
   
      this.requestPayload.FromDate = this.Fromdate ?this.datePipe.transform(new Date(this.Fromdate),'MM/dd/yyyy'):null;
      this.requestPayload.ToDate = this.Todate ?this.datePipe.transform(new Date(this.Todate),'MM/dd/yyyy'):null;
    
    var exportrequest=this.requestPayload;
    exportrequest.PageSize=0;
    exportrequest.Page=0;

    this.api
      .callApi(
        this.constant.kitSoldList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(exportrequest)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
         
          var resp=res.LogisticsCentralList;
          const modifyField = resp.map((element:any) => ({
            'Date Submitted': element.SubmittedDate,
            'Order #': element.OrderNumber ,
            'Account Number#':element.AccountNumber,
            'Client Name':element.ClientName,
            'Product Name':element.ProductName,
            'Product Price':element.ProductPrice,
            'Qty#':element.Qty,
            'Total':element.Total,
            'Total Paid':element.TotalPaid
          }));
          this.excelService.exportToExcel(modifyField, 'covid19_kits_sold.xls');
        },
        (err: any) => {
     
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    
  }
}
