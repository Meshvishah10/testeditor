import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import html2canvas from 'html2canvas';
import { OrderDetails } from 'src/app/models/nationalSupplyOrder.model';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent {
  
  orderId:any
  details:any=''
  show:boolean = true;
  autoPrint:boolean=true;
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    private router: Router,

  ) {}
  ngOnInit() {
    // Get permissions from local storage
    // let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    // this.permission = permissions.find((item: any) => {
    //   return item.Type == 23;
    // });
    // if (this.permission.MenuPermission.View == true) {
      
    // }else{
    //   this.router.navigate(['/lab/dashboard']);
    // }
    this.orderId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';
    this.supplyOrderDetail()
  }


  supplyOrderDetail(){
    this.api
          .callApi(this.constant.orderDetail+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
          .subscribe(
            (res: OrderDetails) => {
              this.details = res
             // this.clientId=this.details.ClientId
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
}
print() {
  const printContent = document.getElementById('contentToExport')!;

  html2canvas(printContent).then(canvas => {
    const imageDataUrl = canvas.toDataURL('image/png');
  
    const printWindow = window.open();
    printWindow?.document.open();
    printWindow?.document.write('<html><head><title>Invoice</title></head><body>');
    printWindow?.document.write('<style>@page { size: landscape; }</style>');
    printWindow?.document.write(`<img src="${imageDataUrl}" style="width:100%;" />`);
    printWindow?.document.write('</body></html>');
    printWindow?.document.close();
  
    setTimeout(() => {
      printWindow?.focus();
      printWindow?.print();
      printWindow?.close();
    }, 100);
  });
}

}