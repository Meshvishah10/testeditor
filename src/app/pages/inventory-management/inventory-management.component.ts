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
import { ExcelService } from '../../services/export-excel.service';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.scss']
})
export class InventoryManagementComponent {

   //Declare Common Variable
   Inventorylist: any;
   // common payload for get userlist
   requestpayload: any = {
     Page: 1,
     PageSize: 50,
     Sorts: null,
     Filters: null,
     CustomSearch: '',
     FromDate:null,
     ToDate :null,
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

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,public activatedRoute: ActivatedRoute,private common:CommonService,private toastr: ToastrService,public FilterAndSortingService:FilterAndSortingService,private datePipe: DatePipe,private excelService: ExcelService){}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
   
    this.permission = permissions.find((item: any) => {
      return item.Type == 42;
    });
    //Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.ToDate = new Date();
      this.FromDate = new Date();
      this.FromDate.setDate(this.ToDate.getDate() - 7);
      // this.getSalesList();
      this.getInventoryList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }


  getInventoryList() {
    // console.log("Getting request Payload", this.requestpayload);
   
      this.requestpayload.FromDate = this.FromDate ?this.datePipe.transform(new Date(this.FromDate),'MM/dd/yyyy'):null;
      this.requestpayload.ToDate = this.ToDate?this.datePipe.transform(new Date(this.ToDate),'MM/dd/yyyy'):null;

    this.api
      .callApi(
        this.constant.getAllInventory +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.Inventorylist = {
            data: res.inventoryManagmentsList,
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
      this.getInventoryList();
    }

    OnReset(){
      this.requestpayload.CustomSearch='';
      this.ToDate = new Date();
      this.FromDate = new Date();
      this.FromDate.setDate(this.ToDate.getDate() - 7);

      this.getInventoryList();
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
    
        this.requestpayload.FromDate = this.FromDate ?this.datePipe.transform(new Date(this.FromDate),'MM/dd/yyyy'):null;
        this.requestpayload.ToDate = this.ToDate ?this.datePipe.transform(new Date(this.ToDate),'MM/dd/yyyy'):null;
      
      var exportrequest=this.requestpayload;
      exportrequest.PageSize=this.Inventorylist.Total;

      this.api
        .callApi(
          this.constant.getAllInventory +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(exportrequest)),
          [],
          'GET',
          true,
          true
        )
        .subscribe(
          (res: any) => {
            var resp=res.inventoryManagmentsList;
            const modifyField = resp.map((element:any) => ({
              'Product Name': element.ProductName,
              'Quantity': element.Quantity,
              'Order Number': element.OrderNumber,
              'Order Date': this.datePipe.transform(element.OrderDate,'MM/dd/yyyy hh:mm aa'),
            }));
            this.excelService.exportToExcel(modifyField, 'Inventory_mgmt.xlsx');
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
      
    }
}
