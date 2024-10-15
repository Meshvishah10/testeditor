import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { LogisticsCentralListResponse, OrderTracking, TrackingRequestBody } from 'src/app/models/logisticsCentral.modal';
import { StatusBody } from 'src/app/models/nationalSupplyOrder.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-covid19-order',
  templateUrl: './covid19-order.component.html',
  styleUrl: './covid19-order.component.scss'
})
export class Covid19OrderComponent {

  // General Variable
  covidOrderList:any;
  statusList:any;
  clsStatusList:any;
  selectedId:string=''
  selectedStatus:any;
  Trackingid:any;
  TrackingDetail:any;
  AffOrderShippingTypeList:any;
  name:any;
  trackingForm:any;
  actionFlag:boolean=false;
  //set Api Endpoint
  orderDetailApiEndPoint:any;
  trackingDetailapiendpoint:any;
  stautsChangeAPiEndPoint:any;
  updateTrackingAPiEndPoint:any;
  orderTypeName:any;
  
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    CustomerName: null,
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
    private datePipe: DatePipe
  ) {
    this.activatedRoute.url.subscribe(url => {
      this.orderTypeName=url[1].path; 
      // reset state
      this.state = {
        skip: 0,
        take: 50,
        sort: [],
        filter: {
          logic: 'and',
          filters: [],
        },
      };

      // reset request payload
      this.requestPayload = {
        Page: 1,
        PageSize: 50,
        Sorts: null,
        Filters: null,
        CustomSearch: '',
        CustomerName: '',
        FromDate: '',
        ToDate: '',
      };

        this.getStatusList()
         this.setApiEndPoint()
         this.Init();
    });
  }
  Init() {
    // Get permissions from local storage
    this.name = this.activatedRoute.snapshot.params['name'] ;
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    var orderType = [
      {field:'covid19-order',type:24},
      {field:'salivadirect-order',type:25},
      {field:'noncovid-order',type:26},
      {field:'cls-order',type:27},  
      {field:'kit-order',type:28},
    ]
    this.trackingForm = this.formBuilder.group({
      TrackingId: this.formBuilder.array([]), // List of Panel Options, initialize as an empty array
    });
    
    let permissionType = orderType.find((item:any)=>{return item.field == this.name}) 
    this.permission = permissions.find((item: any) => {
      return item.Type == permissionType?.type;
    });
    if(this.permission?.MenuPermission.View != true){
      this.router.navigate(['/lab/dashboard'])
    }
    this.getOrderList()
  }
  get panelOptionsFormArray() {
    return this.trackingForm.get('TrackingId') as FormArray;
  }

  addPanelOption() {
    this.panelOptionsFormArray.push(this.formBuilder.control(''));
  }

  removePanelOption(index: number) {
    this.panelOptionsFormArray.removeAt(index);
  }
  setApiEndPoint(){
    switch (this.orderTypeName) {
    case 'covid19-order':
    this.orderDetailApiEndPoint = this.constant.covid19Order;
    this.trackingDetailapiendpoint = this.constant.covid19TrackingDetail;
    this.stautsChangeAPiEndPoint = this.constant.covid19StatusChange;
    this.updateTrackingAPiEndPoint = this.constant.covid19UpdateTracking;
    break;

  case 'salivadirect-order':
    this.orderDetailApiEndPoint = this.constant.salivaDirectOrder;
    this.trackingDetailapiendpoint = this.constant.salivaDirectTrackingDetail;
    this.stautsChangeAPiEndPoint = this.constant.salivaDirectStatusChange;
    this.updateTrackingAPiEndPoint = this.constant.salivaDirectUpdateTracking;
    break;

  case 'noncovid-order':
    this.orderDetailApiEndPoint = this.constant.nonCovid19Order;
    this.trackingDetailapiendpoint = this.constant.nonCovid19TrackingDetail;
    this.stautsChangeAPiEndPoint = this.constant.nonCovid19StatusChange;
    this.updateTrackingAPiEndPoint = this.constant.nonCovid19UpdateTracking;
    break;

  case 'cls-order':
    this.orderDetailApiEndPoint = this.constant.clsOrder;
    this.trackingDetailapiendpoint = this.constant.clsTrackingDetail;
    this.stautsChangeAPiEndPoint = this.constant.clsStatusChange;
    this.updateTrackingAPiEndPoint = this.constant.clsUpdateTracking;
    break;
  case 'kit-order':
      this.orderDetailApiEndPoint = this.constant.kitOrder;
      this.trackingDetailapiendpoint = this.constant.kitTrackingDetail;
      this.stautsChangeAPiEndPoint = this.constant.kitStatusChange;
      this.updateTrackingAPiEndPoint = this.constant.kitUpdateTracking; 
      break;
    default:
      break;
    }
  }
  //status list
  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
        
         this.clsStatusList= res?.affiliateCLSOrderStageList
          this.statusList = res?.affiliateOrderStageList 
          this.AffOrderShippingTypeList = res?.AffOrderShippingTypeList       
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  // order list
  getOrderList() { 
    this.covidOrderList = {
      data: [],
      total: 0
   };
    this.requestPayload.FromDate = this.Fromdate ?this.datePipe.transform(new Date(this.Fromdate),'MM/dd/yyyy'):null;
    this.requestPayload.ToDate = this.todate ?this.datePipe.transform(new Date(this.todate),'MM/dd/yyyy'):null;
    this.api
      .callApi(
        this.orderDetailApiEndPoint +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
       
        (res: LogisticsCentralListResponse) => {
          this.covidOrderList = {
             data: res.LogisticsCentralList || res?.KitOrdersList,
             total: res.Total,
          };
       
          let data:any;
          if(this.orderTypeName !=='kit-order'){
           data = res?.LogisticsCentralList?.filter(a => a?.OrderStatus ==3)
          }else{
            data= res?.KitOrdersList?.filter(a => a?.OrderStatus ==3)
          }
           if(data?.length > 0){
            this.actionFlag = true
           }else{
            this.actionFlag = false
           }
          
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  
  //get tracking list
  trackingModal(id:any){
    this.selectedId=id
    this.getTrackingDetail()
  }


  getTrackingDetail() {
    this.api
      .callApi(
        this.trackingDetailapiendpoint +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.selectedId)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: OrderTracking) => {
          this.TrackingDetail=res
    
          this.Trackingid=this.TrackingDetail?.Trackingid          
          this.panelOptionsFormArray.clear();

          // Populate form array with retrieved tracking IDs
          if (this.Trackingid && this.name=='kit-order') {
            this.Trackingid.forEach((trackingId: string) => {
              this.panelOptionsFormArray.push(this.formBuilder.control(trackingId));
            
            });
          }
          if (this.panelOptionsFormArray.length === 0) {
            this.addPanelOption();
          }
         
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
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
          if (filter.Field === 'SubmittedDate' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
        
          return filter;
      });
  }
    this.getOrderList();
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
  //reset method
  OnReset() {
    this.requestPayload.CustomerName = null;
    this.Fromdate = null;
    this.todate = null;
    this.requestPayload.FromDate = null
    this.requestPayload.ToDate = null
    this.covidOrderList = {
      data: [],
      total: 0,
    };
    this.getOrderList();
  }
  //close update status modal
  modelUpdateStatusClose() {
    this.selectedId='',
    this.selectedStatus='',
    (function ($) {
      $("#updateStatus").modal("hide");
    })(jQuery);
    this.getOrderList()
  }
  statusChangeModal(id:any,Status:any){
    this.selectedId=id,
    this.selectedStatus=Status
    this.modelStatusOpen()
  }
  modelStatusOpen(){
    (function ($) {
      $("#updateStatus").modal("show");
    })(jQuery);
  }
  statusChange(){
    this.OrderStatusChange()
    // this.modelUpdateStatusClose()
   
  }
  //order status change
  OrderStatusChange(){ 
      let body: StatusBody = {
        OrderId: this.selectedId,
        Stage: this.selectedStatus,
      };
  
      this.api
        .callApi(this.stautsChangeAPiEndPoint, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if(resp.Status ==1){
            this.getOrderList()
            this.toastr.success(resp.Message,'Access Med Lab');
            this.selectedId='',
            this.selectedStatus='',
            (function ($) {
              $("#updateStatus").modal("hide");
            })(jQuery);
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
      //this.getOrderList()
  }
  TrackingChangeModal(){
      this.TrackingNumberChange() 
      this.modelTrackingClose()
  }
  //update tracking number
  TrackingNumberChange(){ 
    const trackingIds = this.panelOptionsFormArray.value.filter((id:any) => id !== '');
    let body: TrackingRequestBody = {
      OrderId: this.selectedId,
      Trackingid: this.name == 'kit-order' ? trackingIds : this.Trackingid,
    };
      this.api
        .callApi(this.updateTrackingAPiEndPoint, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if(resp.Status ==1){
            this.toastr.success(resp.Message,'Access Med Lab');
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
      this.getOrderList()
  }

    //close tracking modal
      //close update status modal
  modelTrackingClose() {
   
    this.selectedId='',
    this.Trackingid='',
    
    (function ($) {
      $("#editAdd").modal("hide");
    })(jQuery);
  }
  redirectView(id:string): void {
    // Navigate to another route with the orderNumber as a parameter
    //EncryptID
    this.router.navigate([`/lab/logistic-central/${this.orderTypeName}/detail/` + this.common.EncryptID(id)]);
  }
  }
