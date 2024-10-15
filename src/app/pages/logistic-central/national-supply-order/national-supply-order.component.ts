import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { CommentBody, NationalSupplyOrderResponse, StatusBody, TrackingBody, TrackingDetails, commentList, historyDetail } from 'src/app/models/nationalSupplyOrder.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { ViewdatastageComponent } from './viewdatastage/viewdatastage.component';

declare var jQuery: any;
@Component({
  selector: 'app-national-supply-order',
  templateUrl: './national-supply-order.component.html',
  styleUrls: ['./national-supply-order.component.scss'],
})

export class NationalSupplyOrderComponent {
    nationalSupplyList:any;
    statusList:any;
    selectedId:any;
    selectedStatus:any;
    NationalSupplyOrderShippingTypeList:any;
    permission: any = '';
    deleteids:any;
    history:any;
    commentList:any;
    comment: string = '';
    orderDate:any
    
    requestPayload: any = {
      Page: 1,
      PageSize: 50,
      Sorts: null,
      Filters: null,
      CustomSearch: '',
      Stage: '',
      Orderno: null,
      Accountno: null,
      orderdate:null,
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

    trackingresp:any='';
    fieldNo:any=1;
    isDetail:any=false;
    AttentionText:any='';
    trackingarray: string[] = [''];
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
      private modalService: NgbModal
    ) {}
    ngOnInit() {
      // Get permissions from local storage
      let permissions = this.common.Decrypt(localStorage.getItem('permission'));
      this.permission = permissions.find((item: any) => {
        return item.Type == 23;
      });
      if (this.permission.MenuPermission.View == true) {
        this.getNationalOrderList()
        this.getStatusList()
        
      }else{
        this.router.navigate(['/lab/dashboard']);
      }
    }

    deleteModel(id: any) {
      this.selectedId = id;
      const deny = this.statusList.find((item:any) => item.Value.toLowerCase() === 'deny');
      this.selectedStatus = deny?.Key
    }
    archiveModel(id: any) {
      this.selectedId = id;
      //set key for archive status
      //const archive = this.statusList.filter((item:any) => item.Value.toLowerCase() == 'archives');
      const archive = this.statusList.find((item: any) => item.Value.toLowerCase() === 'archives');
      this.selectedStatus = archive?.Key
    }

    trackingModel(id:any){
      this.trackingarray=[''];
      this.fieldNo=1;
      this.api
          .callApi(
            this.constant.GetNCTracking +
              '?inputRequest=' +
              encodeURIComponent(this.common.Encrypt(id)),
            [],
            'GET',
            true,
            true
          )
          .subscribe(
            (res: TrackingDetails) => {
              this.trackingresp=res;
              this.fieldNo = this.trackingresp?.TrackingNumbers?.length;
              this.trackingarray=this.trackingresp.TrackingNumbers;
              if(!this.fieldNo){
                this.addNewField()
              }
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
    }

    addNewField(){
      if (this.trackingarray.length < 10) {
        this.fieldNo ++;
        this.trackingarray.push('');
      }
    }

  
      removeField(event:any,index:any) {
         event.stopPropagation(); 
         event.preventDefault(); 
        if (this.fieldNo > 1) {
            this.fieldNo--;
            this.trackingarray.splice(index, 1);
        }
    }

    trackByIndex(index: number, obj: any): any {
      return index;
    }
    
    

    addNewTracking(){
      this.trackingarray = this.trackingarray.filter(trackingNumber => trackingNumber.trim() !== '');
    let body:any={
        OrderId:this.trackingresp.OrderId,
        TrackingNumbers:this.trackingarray,
      }  
  
      this.api
          .callApi(this.constant.UpdateNCTracking, body, 'PUT', true, true)
          .subscribe(
            (res: any) => {
              var resp = res;
              if(resp.Status ==1){
              this.toastr.success(resp.Message,'Access Med Lab');
              this.modelViewClose();
              (function ($) {
                $("#trackingOrder").modal("hide");
              
              })(jQuery);
              }
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
    }

    getNationalOrderList() {
      this.requestPayload.orderdate = this.orderDate ?this.datePipe.transform(new Date(this.orderDate),'MM/dd/yyyy'):null;
      this.api
        .callApi(
          this.constant.getNationalOrderDetails +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(this.requestPayload)),
          [],
          'GET',
          true,
          true
        )
        .subscribe(
          (res: NationalSupplyOrderResponse) => {
            this.nationalSupplyList = {
              data: res.OrderList,
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
        // call Filter and Soring Function
        var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);
        
          this.state = state;
          this.requestPayload.PageSize = state.take;
          this.requestPayload.Sorts = RequestData.Sorts;
          this.requestPayload.Filters = RequestData.Filters;
          this.requestPayload.Page = (state.skip + state.take) / state.take;
           if (RequestData.Filters !== null && RequestData.Filters.length > 0) {
            this.requestPayload.Filters = RequestData.Filters.map((filter: any) => {
                if (filter.Field === 'DateSubmitted' && filter.Value instanceof Date) {
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
    
        this.getNationalOrderList();
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
      editOrder(data:any,event: MouseEvent){
        if(data.Stage != 4){
          if(data.Attention && data.Attention != '' && data.Stage == 1){
            this.selectedId=data.Id;
            this.AttentionText= data.Attention;
            (function ($) {
              $("#attentionModel").modal("show");
            })(jQuery);
          }else{
            // this.selectedId='';
            const url = `/lab/logistic-central/national-order/editOrder/` + this.common.EncryptID(data.Id);

            if (event.ctrlKey || event.metaKey) { 
              window.open(url, '_blank'); 
            } else {
              this.router.navigate([url]); 
            }
          }
      }else{
        (function ($) {
          $("#InfoModel").modal("show");
        })(jQuery);
      }
        // this.router.navigate(['/lab/logistic-central/national-order/editOrder/'+this.common.EncryptID(id)])
      }


      //reset method
      OnReset() {
        this.requestPayload.Orderno = null;
        this.requestPayload.Accountno = null;
        this.orderDate = null;
        this.requestPayload.orderdate = null;
        this.requestPayload.Stage = null;
        this.nationalSupplyList = {
          data: [],
          total: 0,
        };
        this.getNationalOrderList();
      }
      modelStatusOpen(){
        (function ($) {
          $("#updateStatus").modal("show");
        })(jQuery);
      }
      deleteNationalOrder() {
        this.OrderStatusChange()
        this.modelDeleteClose();
        this.getNationalOrderList()
      }
      
      // Close delete modal
      modelDeleteClose() {
       this.selectedId='',
       this.selectedStatus='',
        (function ($) {
          $("#deleteOrder").modal("hide");
        })(jQuery);
      }
      //archive it modal close
      modelArchiveClose() {
        this.selectedId='',
        this.selectedStatus='',
         (function ($) {
           $("#archiveOrder").modal("hide");
         })(jQuery);
       }
      statusChangeModal(data:any){
        this.selectedId=data.Id;
        this.selectedStatus=data.Stage;
        this.modelStatusOpen()
        // if(data.Attention && data.Attention != '' && data.Stage != 3 && data.Stage != 4){
        //   this.AttentionText = data.Attention;
        //   (function ($) {
        //     $("#attentionModel").modal("show");
        //   })(jQuery);
        // }else{
        // }
      }

      attentionClose(event:any){
        (function ($) {
          $("#attentionModel").modal("hide");
        })(jQuery);
        if(this.selectedId && this.selectedStatus && this.selectedId != '' && this.selectedStatus != ''){
          this.modelStatusOpen()
        }else{
          if(this.isDetail){
            this.isDetail=false;
            const idString = this.selectedId.toString();
            this.selectedId='';
            const url = `/lab/logistic-central/national-order/order-details/` + this.common.EncryptID(idString);
            if (event.ctrlKey || event.metaKey) { 
              window.open(url, '_blank');
            } else {
              this.router.navigate([url]);
            }
          
          }else{
           
            const url = `/lab/logistic-central/national-order/editOrder/` + this.common.EncryptID(this.selectedId);
            if (event.ctrlKey || event.metaKey) { 
              window.open(url, '_blank');
            } else {
              this.router.navigate([url]);
            }
            this.selectedId='';
          }
        }
      }

      statusChange(){
        const Shipped = this.statusList.find((item:any) => item.Value.toLowerCase() === 'shipped');
        if(this.selectedStatus==Shipped?.Key){
          this.router.navigate([`/lab/logistic-central/national-order/order-information/`+this.common.EncryptID(this.selectedId)])
          this.selectedStatus=='';
          this.modelUpdateStatusClose();
          return
        }else{
          this.OrderStatusChange();
          this.modelUpdateStatusClose();
        }
      }
      //status list
      getStatusList() {
        this.api
          .callApi(this.constant.MasterDetails, [], 'GET', true, true)
          .subscribe(
            (res: any) => {
              this.statusList = res?.SupplyOrderStatusList,
              this.NationalSupplyOrderShippingTypeList = res?.NationalSupplyOrderShippingTypeList
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
      //order status list
      OrderStatusChange(){ 
        let body: StatusBody = {
          OrderId: this.selectedId,
          Stage: this.selectedStatus,
        };
      
        this.api
          .callApi(this.constant.StatusChangeNationalOrder, body, 'PUT', true, true)
          .subscribe(
            (res: any) => {
              var resp = res;
              if(resp.Status ==1){
              this.toastr.success(resp.Message,'Access Med Lab')
              this.getNationalOrderList();
            }
          },
          (err: any) => {
              this.getNationalOrderList();
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
      statusChangeArchive(){
        this.OrderStatusChange()
        this.selectedId='',
        this.selectedStatus=''
        this.modelArchiveClose() 
      }
      //close update status modal
       modelUpdateStatusClose() {
        this.selectedId='',
        this.selectedStatus='',
        (function ($) {
          $("#updateStatus").modal("hide");
        })(jQuery);
        this.getNationalOrderList()
      }
      //History Details
      getHistory() {
        this.api
          .callApi(
            this.constant.orderHistory +
              '?inputRequest=' +
              encodeURIComponent(this.common.Encrypt(this.selectedId)),
            [],
            'GET',
            true,
            true
          )
          .subscribe(
            (res:historyDetail) => {
            
              this.history = res
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
      //historyModal Open 
      historyModel(id:any){
        this.selectedId = id
        this.getHistory()
      }
       // Close history modal
       modelHistoryClose() {
        this.selectedId='',
        this.history=null,
         (function ($) {
           $("#history").modal("hide");
         })(jQuery);
       }

       //get commentList for view/add modal
       getcommentList() {
        this.api
          .callApi(
            this.constant.commentList +
              '?inputRequest=' +
              encodeURIComponent(this.common.Encrypt(this.selectedId)),
            [],
            'GET',
            true,
            true
          )
          .subscribe(
            (res: commentList) => {
              // console.log(res)
              this.commentList = res
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
       //view/add modal
       viewAddModel(id:any){
        this.selectedId = id
        this.getcommentList() 
       }

       onAddComment() {
        if (this.comment == '') {
          return;
        } else {
          let body:CommentBody = {
            OrderId: this.selectedId,
            Note: this.comment,
          };
          this.api
            .callApi(this.constant.addComment, body, 'POST', true, true)
            .subscribe(
              (res: any) => {
                var resp = res;
                this.toastr.success(resp.Message, 'Access Med Lab');
                this.comment = '';
                
                this.getcommentList()
              },
              (err: any) => {
                
                this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
              }
            );
        }
      }

       // Close view  modal
       modelViewClose() {
        this.selectedId='',
        this.history=null,
        this.trackingresp = '';
         (function ($) {
           $("#viewAdd").modal("hide");
         })(jQuery);
       }
       redirectView(data:any,event: MouseEvent): void {
        // Navigate to another route with the orderNumber as a parameter
        //EncryptID
        if(data.Attention && data.Attention != '' && data.Stage == 1){
          this.selectedId=data.Id;
          this.AttentionText= data.Attention;
          this.isDetail=true;
          (function ($) {
            $("#attentionModel").modal("show");
          })(jQuery);
        }else{
          const idString = data.Id.toString();
          const url = `/lab/logistic-central/national-order/order-details/` + this.common.EncryptID(idString);

            if (event.ctrlKey || event.metaKey) { 
              window.open(url, '_blank');
            } else {
              this.router.navigate([url]);
            }
        }
      }

      listDataStage(){
        const modalRef = this.modalService.open(ViewdatastageComponent, { centered: true ,  size: 'xl' });
         
        modalRef.result.then(
          (result:any) => {
            
          },
          () => {
            // Modal dismissed
           
          }
        );
      }
  }
  

