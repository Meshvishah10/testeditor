import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { drawDOM, exportPDF } from '@progress/kendo-drawing';

@Component({
  selector: 'app-print-sales',
  templateUrl: './print-sales.component.html',
  styleUrls: ['./print-sales.component.scss']
})
export class PrintSalesComponent {
  // Declare common variables
  salesForm: any = FormGroup;
  isSubmitted: any = false;
  permission: any;
  uniqueid:any='';
  SalesPrintResp:any=[];
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
    this.isSubmitted = false;

    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.uniqueid = this.common.DecryptID(this.activatedRoute.snapshot.params['id']);
    this.permission = permissions.find((item: any) => {
      return item.Type == 57;
    });
    if (this.permission.MenuPermission.View == true) {
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueid) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/salescentral']);
        return
      }
      this.getSalesForPrint();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getSalesForPrint(){
    
    // console.log("Getting Unique id", this.uniqueid);
    this.api
      .callApi(
        this.constant.commmonSales +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.uniqueid)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.SalesPrintResp = res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Check form Validation
  get f() {
    return this.salesForm.controls;
  }

  onSavePdf(){
    const contentElement = this.contentToExport?.nativeElement;

    // Draw the content
    drawDOM(contentElement)
      .then((group) => {
        // Export the content as PDF
        return exportPDF(group, { paperSize: 'A2', margin: { left: '1cm', top: '1cm', right: '1cm', bottom: '1cm' } });
      })
      .then((dataUri) => {
        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = 'SalesEODReport.pdf';
        link.click();
      });
  }
}
