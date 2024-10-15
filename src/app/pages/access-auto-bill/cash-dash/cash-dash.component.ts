import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-cash-dash',
  templateUrl: './cash-dash.component.html',
  styleUrl: './cash-dash.component.scss',
})
export class CashDashComponent {
  DateFrom = new Date();
  DateTo: any;
  permission: any = '';
  resData: any;

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
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 53;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getCashDashData();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  search() {
    this.getCashDashData();
  }

  OnReset() {
    this.DateFrom = new Date();
    this.DateTo = undefined;
    this.getCashDashData();
  }

  getCashDashData() {
    const body = {
      SubmittedDateFrom: this.datePipe.transform(this.DateFrom, 'MM/dd/yyyy'),
      SubmittedDateTo: this.datePipe.transform(this.DateTo, 'MM/dd/YYYY'),
    };
    this.api
      .callApi(
        this.constant.CashDash +
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

  onInvoiceRoute(params: any) {
    if (params?.submittedDateFrom) {
      params.submittedDateFrom = this.datePipe.transform(
        params?.submittedDateFrom,
        'MM/dd/yyyy'
      );
    }
    if (params?.submittedDateTo) {
      params.submittedDateTo = this.datePipe.transform(
        params?.submittedDateTo,
        'MM/dd/yyyy'
      );
    }
    if (params?.paymentDateFrom) {
      params.paymentDateFrom = this.datePipe.transform(
        params?.paymentDateFrom,
        'MM/dd/yyyy'
      );
    }
    if (params?.paymentDateTo) {
      params.paymentDateTo = this.datePipe.transform(
        params?.paymentDateTo,
        'MM/dd/yyyy'
      );
    }
    if (params?.modifiedDateFrom) {
      params.modifiedDateFrom = this.datePipe.transform(
        params?.modifiedDateFrom,
        'MM/dd/yyyy'
      );
    }
    if (params?.modifiedDateTo) {
      params.modifiedDateTo = this.datePipe.transform(
        params?.modifiedDateTo,
        'MM/dd/yyyy'
      );
    }
    if (params?.partialPaymentFrom) {
      params.partialPaymentFrom = this.datePipe.transform(
        params?.partialPaymentFrom,
        'MM/dd/yyyy'
      );
    }
    if (params?.partialPaymentTo) {
      params.partialPaymentTo = this.datePipe.transform(
        params?.partialPaymentTo,
        'MM/dd/yyyy'
      );
    }
    this.router.navigate([`/lab/access-auto-bill/billing-invoice`], {
      queryParams: {
        q: encodeURIComponent(this.common.Encrypt(params)),
      },
    });
  }

  onTotalAmountCollectedReport() {
    const body = {
      SearchFromDate: this.datePipe.transform(this.DateFrom, 'MM/dd/yyyy'),
      SearchToDate: this.datePipe.transform(this.DateTo, 'MM/dd/YYYY'),
    };
    this.router.navigate([`/lab/access-auto-bill/cash-dash/invoice-report`], {
      queryParams: {
        q: encodeURIComponent(this.common.Encrypt(body)),
      },
    });
  }
}
