import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { RecurringOrderListResponse } from 'src/app/models/RecurringOrder.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-recurring-order',
  templateUrl: './recurring-order.component.html',
  styleUrl: './recurring-order.component.scss'
})
export class RecurringOrderComponent {
  recurringOrderList:any;
  statusList:any;
  selectedId:string='';
  selectedStatus:any;
  NationalSupplyOrderShippingTypeList:any;
  frequencyList:any
  permission:any
  deleteids:any=[];
  StartDate:any;
  EndDate:any
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    Accountno: null,
    Stage:'',
    Startdate:null,
    Enddate:null
  };
  public state: State = {
    skip: 0,
    take: 50,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  }

  Startdate:any='';
  Enddate:any='';

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
        return item.Type == 66;
      });
      if (this.permission.MenuPermission.View == true) {
         this.getRecurringOrderList()
         this.getStatusList()
        
      }else{
        this.router.navigate(['/lab/dashboard']);
      }
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
              if (filter.Field === 'DateSubmitted' || filter.Field === 'StartDate' || filter.Field == 'EndDate'|| filter.Field == 'NextDate' && filter.Value instanceof Date) {
                  filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
              }
              if (filter.Field === 'OrderStatus') {
                  filter.Field = 'Stage';
              }
              if (filter.Field === 'ShippingMethod') {
                  filter.Field = 'ShippingType';
              }
              return filter;
          });
      }
      this.getRecurringOrderList();
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
      this.requestPayload.Accountno = null;
      this.requestPayload.Startdate = null;
      this.requestPayload.Enddate = null;
      this.StartDate = null;
      this.EndDate = null;
      this.requestPayload.Stage = null;
      this.recurringOrderList = {
        data: [],
        total: 0,
      };
      this.getRecurringOrderList();
    }

    getRecurringOrderList() {
      this.requestPayload.Startdate = this.StartDate ? this.datePipe.transform(new Date(this.StartDate), 'MM/dd/yyyy') : null;
      this.requestPayload.Enddate = this.EndDate ? this.datePipe.transform(new Date(this.EndDate), 'MM/dd/yyyy') : null;
      // console.log(this.requestPayload)
      this.api
        .callApi(
          this.constant.RecurringOrderList +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(this.requestPayload)),
          [],
          'GET',
          true,
          true
        )
        .subscribe(
          (res: RecurringOrderListResponse) => {
            this.recurringOrderList = {
              data: res.OrderList,
              total: res.Total,
            };
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
      //status list
      getStatusList() {
        this.api
          .callApi(this.constant.MasterDetails, [], 'GET', true, true)
          .subscribe(
            (res: any) => {
         
               this.statusList = res?.RecurringOrderStageList,
               this.NationalSupplyOrderShippingTypeList = res?.NationalSupplyOrderShippingTypeList
              this.frequencyList=res?.RecurringOrderFrequencyList
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }

      statusChangeModal(data:any){
        this.selectedId=data.Id;
        this.selectedStatus=data.Stage;
        this.modelStatusOpen()
      }

      modelStatusOpen(){
        (function ($) {
          $("#updateStatus").modal("show");
        })(jQuery);
      }

      modelUpdateStatusClose() {
        this.selectedId='',
        this.selectedStatus='',
        (function ($) {
          $("#updateStatus").modal("hide");
        })(jQuery);
      }

      //order status list
      OrderStatusChange(){ 
        let body: any = {
          Id: this.selectedId,
        };
      
        this.api
          .callApi(this.constant.RecurringStatusChange, body, 'PUT', true, true)
          .subscribe(
            (res: any) => {
              var resp = res;
              if(resp.Status ==1){
              this.toastr.success(resp.Message,'Access Med Lab')
              this.modelUpdateStatusClose();
              this.getRecurringOrderList();
              }
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
    
      deleteModel(id: any) {
        this.deleteids.push(id);
      }
           // Close delete modal
           modelDeleteClose() {
            this.deleteids='',
             (function ($) {
               $("#deleteOrder").modal("hide");
             })(jQuery);
           }

      deleteRecurringOrder(){
      
        // this.deleteids.push(this.selectedId);
        this.api
        .callApi(this.constant.commonRecurringOrder +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.deleteids)), [], 'DELETE', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.modelDeleteClose();
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
              this.getRecurringOrderList()
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
  
          }
      )}

      NewOrder(){
        this.router.navigate(['/lab/logistic-central/recurring-order/addOrder'])
      }

      editOrder(data:any){
        this.router.navigate(['/lab/logistic-central/recurring-order/editOrder/'+this.common.EncryptID(data.Id)])
      }
}
