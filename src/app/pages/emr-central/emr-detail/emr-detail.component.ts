import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { EmrPrintComponent } from '../emr-print/emr-print.component';
import { EMRCentralDetailResponse } from 'src/app/models/EMRCentral.model';
@Component({
  selector: 'app-emr-detail',

  templateUrl: './emr-detail.component.html',
  styleUrl: './emr-detail.component.scss'
})
export class EmrDetailComponent {
  // @ViewChild('dynamicComponent', { read: ViewContainerRef })
  // dynamicComponent!: ViewContainerRef;
  @ViewChild(EmrPrintComponent) emrPrintComponent!: EmrPrintComponent;
  orderId: any
  details: any = ''
  print:boolean = false
  permission: any
  printContentVisible: any
  comment:any
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    private router: Router,
    // private viewContainerRef: ViewContainerRef

  ) { }
  ngOnInit() {
    this.orderId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';

    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 48;
    });
    if (this.activatedRoute.snapshot.params['id'] && !this.orderId) {
      this.toastr.error('Invalid Request.');  
  }
  if (this.permission?.MenuPermission.View == true) {
    this.OrderDetail()
  }else{
    this.router.navigate(['/dashboard']);
  }
  }
  togglePrint() {
    this.api.callApi(
      this.constant.GetEmrApprovalRequestPdf + '?inputRequest=' + encodeURIComponent(this.common.Encrypt(this.orderId)),
      [],
      'GET',
      true,
      true
    ).subscribe(
      (res: any) => {
        const binaryString = atob(res.FileBytes);
        const bytesArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytesArray[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytesArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
  
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = res.FileName;
        link.click();

        URL.revokeObjectURL(blobUrl);
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }
  
  OrderDetail() {
    if (this.activatedRoute.snapshot.params['id'] && !this.orderId) {
      this.toastr.error('Invalid Request.');
      this.router.navigate([`/lab/emr-central`]);
      return
    }
    this.api
      .callApi(this.constant.EMRCentral +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
      .subscribe(
        (res: EMRCentralDetailResponse) => {
        
          this.details = res.GetEmrModel
          this.comment = res?.Comments
          // this.clientId=this.details.ClientId
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
 
}
