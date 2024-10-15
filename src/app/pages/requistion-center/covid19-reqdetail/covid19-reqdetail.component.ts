import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-covid19-reqdetail',
  templateUrl: './covid19-reqdetail.component.html',
  styleUrl: './covid19-reqdetail.component.scss'
})
export class Covid19ReqdetailComponent {
  // Declare common variables
  reqdetailForm: any = FormGroup;
  permission: any;
  uniqueid:any='';
  ReqDetailResp:any=[];
  autoPrint:boolean=true;

  @ViewChild('contentToExport', { static: false }) contentToExport: ElementRef | undefined;

   // Constructor to inject services and modules
   constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    private http: HttpClient,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {}

  // Angular lifecycle hook - OnInit
  ngOnInit(): void {
    this.uniqueid = this.common.DecryptID(this.activatedRoute.snapshot.params['id']);
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 16;
    });
    if (this.permission.MenuPermission.View == true) {
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueid) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/covid19-req-orders']);
        return
      }
      this.getReqDetail();
    } else{
      this.router.navigate(['/lab/dashboard']);
  }
   
  }

  getReqDetail(){
   
    // console.log("Getting Unique id", this.uniqueid);
    this.api
      .callApi(
        this.constant.covid19RequisitionForm +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.uniqueid)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log("geting res", res);
          this.ReqDetailResp = res;
         // Create a date object with a dummy date and the given time
           const dummyDate = new Date(`2000-01-01T${this.ReqDetailResp.Collectiontime}`);
  
          // Use DatePipe to format the time to 12-hour format
          this.ReqDetailResp.Customtime = this.datePipe.transform(dummyDate, 'hh:mm aa');       
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  onSavePdf(){
    const printContent = document.getElementById('printContent')!;

    html2canvas(printContent).then(canvas => {
      const imageDataUrl = canvas.toDataURL('image/png');

      const printWindow = window.open();
      printWindow?.document.open();
      printWindow?.document.write('<html><head><title>AML Req Details</title></head><body>');
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
