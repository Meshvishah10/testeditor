import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderDetails } from 'src/app/models/nationalSupplyOrder.model';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-order-information',
  templateUrl: './order-information.component.html',
  styleUrl: './order-information.component.scss'
})
export class OrderInformationComponent {
  orderId:any
  details:any=''
  show:boolean = true;
  autoPrint:boolean=true;
  trackingnumber:any='';
  statusList:any='';
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    private router: Router,

  ) {}
  ngOnInit() {
    this.orderId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';
    this.supplyOrderDetail();
    this.getStatusList();
  }
  supplyOrderDetail(){
    this.api
          .callApi(this.constant.orderDetail+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
          .subscribe(
            (res: OrderDetails) => {
              this.details = res
              // console.log("Getting details", this.details);
             // this.clientId=this.details.ClientId
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }

  getStatusList() {
    this.api
    .callApi(this.constant.MasterDetails, [], 'GET', true, true)
    .subscribe(
      (res: any) => {
        this.statusList = res?.SupplyOrderStatusList
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }


  onShipOrder() {
    // Here you can perform any logic related to shipping the order
    // For now, let's just hide the table
    const stageid = this.statusList.find((r1: any) => r1.Value.toLowerCase() === 'shipped')?.Key;

    let body:any={
      OrderId:this.orderId,
      Stage: stageid,
      TrackingId:this.trackingnumber
    }
    this.api
        .callApi(this.constant.StatusChangeNationalOrder, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if(resp.Status ==1){
            this.toastr.success(resp.Message,'Access Med Lab');
            this.show = false;
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    this.modelShipClose()
  }
  modelShipClose() {
     (function ($) {
       $("#shipOrder").modal("hide");
     })(jQuery);
   }
   redirectView(): void {
    // Navigate to another route with the orderNumber as a parameter
    //EncryptID
    this.router.navigate([`/lab/logistic-central/national-order/order-information/invoice/`+this.common.EncryptID(this.orderId)])
  }

}
