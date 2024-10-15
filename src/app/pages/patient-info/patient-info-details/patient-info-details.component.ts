import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { ToastrService } from 'ngx-toastr';
import { OrderDetail } from 'src/app/models/logisticsCentral.modal';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-patient-info-details',
  templateUrl: './patient-info-details.component.html',
  styleUrl: './patient-info-details.component.scss'
})
export class PatientInfoDetailsComponent {
  orderId:any;
  details:any='';
  autoPrint:boolean=true;

  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(){
    this.orderId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';

    this.orderDetails()
  }

  orderDetails(){
    if (this.activatedRoute.snapshot.params['id'] && !this.orderId) {
      this.toastr.error('Invalid Request.');
      this.router.navigate([`/lab/patient-info`]);
      return
  }
    this.api
          .callApi(this.constant.patientInfoDetails+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
          .subscribe(
            (res: OrderDetail) => {
              this.details = res
              // console.log("Getting details", this.details);
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
      printWindow?.document.write('<html><head><title>AML Update Patient Information</title></head><body>');
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

