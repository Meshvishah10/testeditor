import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { get } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html',
  styleUrl: './invoice-report.component.scss',
})
export class InvoiceReportComponent {
  resData: any;
  params: any;

  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    const qParams = this.activatedRoute.snapshot.queryParams['q'];
    if (qParams) {
      this.params = this.common.Decrypt(decodeURIComponent(qParams));
      // console.log(this.params);
      this.getInvoiceReport(this.params);
    } else {
      this.router.navigate(['/lab/access-auto-bill/cash-dash']);
    }
  }

  getInvoiceReport(body: any) {
    this.api
      .callApi(
        this.constant.GetTotalAmountCollectedReport +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(body)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log(res);
          this.resData = res;
        },
        (err: any) => {
          // console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
