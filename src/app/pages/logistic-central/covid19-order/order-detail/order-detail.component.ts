import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { ToastrService } from 'ngx-toastr';
import { OrderDetail } from 'src/app/models/logisticsCentral.modal';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  orderId:any
  details:any=''
  show:boolean = true;
  autoPrint:boolean=true;
  
 name:any;
 title:string=''
 permission:any
 orderDetailApiEndPoint:any
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    private router: Router,

  ) {}
  ngOnInit() {
    this.name = this.activatedRoute.snapshot.params['name'] ;
    this.setApiEndPoint();
    this.orderId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    var orderType = [
      {field:'covid19-order',type:24},
      {field:'salivadirect-order',type:25},
      {field:'noncovid-order',type:26},
      {field:'cls-order',type:27},  
      {field:'kit-order',type:28},
    ]
   let permissionType = orderType.find((item:any)=>{return item.field == this.name}) 
    this.permission = permissions.find((item: any) => {
      return item.Type == permissionType?.type;
    });
    if(this.permission?.MenuPermission.View != true){
      this.router.navigate(['/lab/dashboard'])
    }else{
      this.OrderDetail()
    }
    
  }
  
  setApiEndPoint(){
    switch (this.name) {
    case 'covid19-order':
    this.orderDetailApiEndPoint = this.constant.covid19OrderDetail;
    this.title ='Covid-19 Order Detail'
    break;
  case 'salivadirect-order':
    this.orderDetailApiEndPoint = this.constant.salivaDirectOrderDetail;  
    this.title ='At-Home Saliva Direct Order Detail'
    break;
  case 'noncovid-order':
    this.orderDetailApiEndPoint = this.constant.nonCovid19OrderDetail;
    this.title ='Non-Covid19 Order Detail'
    break;
  case 'cls-order':
    this.orderDetailApiEndPoint = this.constant.clsOrderDetail; 
    this.title ='CLS Order Detail'
    break;
  case 'kit-order':
    this.orderDetailApiEndPoint = this.constant.kitOrderDetail; 
    this.title ='Kit Order Detail'
    break;
      default:
        break;
    }
  }
  OrderDetail(){
    if (this.activatedRoute.snapshot.params['id'] && !this.orderId) {
      this.toastr.error('Invalid Request.');
      this.router.navigate([`/lab/logistic-central/${this.name}`]);
      return
  }
    this.api
          .callApi(this.orderDetailApiEndPoint+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
          .subscribe(
            (res: OrderDetail) => {
              this.details = res
              //console.log("Getting details", this.details);
             // this.clientId=this.details.ClientId
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }
  printDiv() {
    const printContent = document.getElementById('printContent')!;

    html2canvas(printContent).then(canvas => {
      const imageDataUrl = canvas.toDataURL('image/png');

      const printWindow = window.open();
      printWindow?.document.open();
      printWindow?.document.write('<html><head><title>AML OrderDetail</title></head><body>');
      printWindow?.document.write(`<img src="${imageDataUrl}" style="width:100%;" />`);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();

      setTimeout(() => {
        printWindow?.focus();
        printWindow?.print();
        printWindow?.close();
      }, 10);
    });
  }

}
