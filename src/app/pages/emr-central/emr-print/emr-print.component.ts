import { Component, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import html2canvas from 'html2canvas';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
@Component({
  selector: 'app-emr-print',
  templateUrl: './emr-print.component.html',
  styleUrl: './emr-print.component.scss'
})
export class EmrPrintComponent {
  details:any
  comment:any
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    private router: Router,
    private renderer: Renderer2
  ) {}
 
  OrderDetail(id:string) {
    // if (!this.id) {
    //   this.toastr.error('Invalid Request.');
    //   this.router.navigate([`/lab/emr-central`]);
    //   return
    // }
    this.api
      .callApi(this.constant.EMRCentral +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(id)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {

                  
          this.details = res.GetEmrModel
          this.comment = res?.Comments
         
          // this.clientId=this.details.ClientId
          setTimeout(() => {
          const printContent = document.getElementById('printContent')!;
      
    html2canvas(printContent).then(canvas => {
      const imageDataUrl = canvas.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      if(printWindow){
      printWindow?.document.open();
      printWindow?.document.write('<html><head><title>AML OrderDetail</title>');
      printWindow?.document.write('<style>body { margin: 0; padding: 0; text-align: center; }</style>');
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(`<img src="${imageDataUrl}" style="width: 100%;" />`);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();

    printWindow?.addEventListener('load', () => {
   
      printWindow.focus();
      printWindow.print();
      printWindow.close();
   
    });
  }else{
    this.fallbackPrint(imageDataUrl);
  }

    });
  }, 2);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  printDiv(id:string) {
    this.OrderDetail(id)
    
  }

  fallbackPrint(imageDataUrl: string) {
    const iframe = this.renderer.createElement('iframe');
    this.renderer.setStyle(iframe, 'display', 'none');
    document.body.appendChild(iframe);

    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write('<html><head><title>Print</title>');
    iframe.contentWindow?.document.write('<style>body { margin: 0; padding: 0; text-align: center; }</style>');
    iframe.contentWindow?.document.write('</head><body>');
    iframe.contentWindow?.document.write(`<img src="${imageDataUrl}" style="width: 100%;" />`);
    iframe.contentWindow?.document.write('</body></html>');
    iframe.contentWindow?.document.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      this.renderer.removeChild(document.body, iframe);
    };
  }
  
}
