import { DatePipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-aging-report',
  templateUrl: './aging-report.component.html',
  styleUrl: './aging-report.component.scss',
  providers: [DecimalPipe]
})
export class AgingReportComponent {
  date = new Date();
  permission: any = '';
  resData: any;

  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 52;
    });
    // Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.getData();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getData() {
    this.api
      .callApi(this.constant.AgingReport, [], 'GET', true, true)
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
    if(params?.paymentDueDateFrom){
      params.paymentDueDateFrom = this.datePipe.transform(
        params?.paymentDueDateFrom,
        'MM/dd/yyyy'
      );
    }
    if(params?.pastPaymentDueDate){
      params.pastPaymentDueDate = this.datePipe.transform(
        params?.pastPaymentDueDate,
        'MM/dd/yyyy'
      );
    }
    if(params?.paymentDueDate){
      params.paymentDueDate = this.datePipe.transform(
        params?.paymentDueDate,
        'MM/dd/yyyy'
      );
    }
    this.router.navigate([`/lab/access-auto-bill/billing-invoice`], {
      queryParams: {
        q: encodeURIComponent(this.common.Encrypt(params)),
      },
    });
  }
  
  exportExcel() {
    this.api
      .callApi(
        this.constant.AgingReportExport,
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          const resp = res;
          // console.log("Getting res", res);
  
          // Helper function to calculate the total payment amount
          const calculateTotalAmount = (list: any[]): string => {
            return list.reduce((acc, item) => {
              const amount = parseFloat(item['Payment Amount'].replace(/[$,]/g, '')) || 0;
              return acc + amount;
            }, 0).toFixed(2);
          };
  
          const CurrentInvoicesList = resp.CurrentInvoicesList.map((element: any) => ({
            'Invoice #': element.Invoiceno,
            'Lab Invoice No': element.LabInvoiceNo,
            'Account #': element.AccountNo,
            'Practice Name': element.PracticeName,
            'Payment Date': element.PaymentDate != null ? this.datePipe.transform(element.PaymentDate, 'MM/dd/yyyy') : '',
            'Payment Due Date': element.PaymentDueDate != null ? this.datePipe.transform(element.PaymentDueDate, 'MM/dd/yyyy') : '',
            'Payment Amount': '$ ' + this.decimalPipe.transform(element.Amount, '1.2-2'),
            'Payment Status': element.PaymentStatusText,
            'Created Date': element.CreatedDate != null ? this.datePipe.transform(element.CreatedDate, 'MM/dd/yyyy') : '',
          }));
  
          const InvoicesPendingList = resp.InvoicesPendingList.map((element: any) => ({
            'Invoice #': element.Invoiceno,
            'Lab Invoice No': element.LabInvoiceNo,
            'Account #': element.AccountNo,
            'Practice Name': element.PracticeName,
            'Payment Date': element.PaymentDate != null ? this.datePipe.transform(element.PaymentDate, 'MM/dd/yyyy') : '',
            'Payment Due Date': element.PaymentDueDate != null ? this.datePipe.transform(element.PaymentDueDate, 'MM/dd/yyyy') : '',
            'Payment Amount': '$ ' + this.decimalPipe.transform(element.Amount, '1.2-2'),
            'Payment Status': element.PaymentStatusText,
            'Created Date': element.CreatedDate != null ? this.datePipe.transform(element.CreatedDate, 'MM/dd/yyyy') : '',
          }));
  
          // Grouped data for "Next Payment Dues"
          const NextPaymentDuesData: any[] = [];
          resp.NextPaymentDuesData.forEach((elementdata: any) => {
            // Add the header for the group
            NextPaymentDuesData.push({
              'Next Payment Date': this.datePipe.transform(elementdata.NextPaymentDate, 'MM/dd/yyyy'),
              'Invoice #': '',
              'Lab Invoice No': '',
              'Account #': '',
              'Practice Name': '',
              'Payment Date': '',
              'Payment Due Date': '',
              'Payment Amount': '',
              'Payment Status': '',
              'Created Date': ''
            });
  
            // Process each item under the group
            const groupItems = elementdata.NextPaymentDuesList.map((element: any) => ({
              'Next Payment Date': '', // Empty since it's grouped
              'Invoice #': element.Invoiceno,
              'Lab Invoice No': element.LabInvoiceNo,
              'Account #': element.AccountNo,
              'Practice Name': element.PracticeName,
              'Payment Date': element.PaymentDate != null ? this.datePipe.transform(element.PaymentDate, 'MM/dd/yyyy') : '',
              'Payment Due Date': element.PaymentDueDate != null ? this.datePipe.transform(element.PaymentDueDate, 'MM/dd/yyyy') : '',
              'Payment Amount': '$ ' + this.decimalPipe.transform(element.Amount, '1.2-2'),
              'Payment Status': element.PaymentStatusText,
              'Created Date': element.CreatedDate != null ? this.datePipe.transform(element.CreatedDate, 'MM/dd/yyyy') : '',
            }));
  
            NextPaymentDuesData.push(...groupItems);
  
            // Calculate and add the total for this group if it contains items
            if (groupItems.length > 0) {
              const groupTotalAmount = calculateTotalAmount(groupItems);
              NextPaymentDuesData.push({
                'Next Payment Date': '',
                'Invoice #': '',
                'Lab Invoice No': '',
                'Account #': '',
                'Practice Name': '',
                'Payment Date': '',
                'Payment Due Date': 'Total Payment Amount',
                'Payment Amount': '$ ' + groupTotalAmount,
                'Payment Status': '',
                'Created Date': ''
              });
  
              // Add a blank line between groups for better readability
              NextPaymentDuesData.push({
                'Next Payment Date': '',
                'Invoice #': '',
                'Lab Invoice No': '',
                'Account #': '',
                'Practice Name': '',
                'Payment Date': '',
                'Payment Due Date': '',
                'Payment Amount': '',
                'Payment Status': '',
                'Created Date': ''
              });
            }
          });
  
          const PastInvoicesList = resp.PastInvoicesList.map((element: any) => ({
            'Invoice #': element.Invoiceno,
            'Lab Invoice No': element.LabInvoiceNo,
            'Account #': element.AccountNo,
            'Practice Name': element.PracticeName,
            'Payment Date': element.PaymentDate != null ? this.datePipe.transform(element.PaymentDate, 'MM/dd/yyyy') : '',
            'Payment Due Date': element.PaymentDueDate != null ? this.datePipe.transform(element.PaymentDueDate, 'MM/dd/yyyy') : '',
            'Payment Amount': '$ ' + this.decimalPipe.transform(element.Amount, '1.2-2'),
            'Payment Status': element.PaymentStatusText,
            'Created Date': element.CreatedDate != null ? this.datePipe.transform(element.CreatedDate, 'MM/dd/yyyy') : '',
          }));
  
          // Create a new workbook
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
  
          // Create a worksheet for each list and add it to the workbook
          const wsInvoicesPending = XLSX.utils.json_to_sheet(InvoicesPendingList);
          if (InvoicesPendingList.length > 0) {
            XLSX.utils.sheet_add_aoa(wsInvoicesPending, [['', '', '', '', '', 'Total Payment Amount', `$ ${calculateTotalAmount(InvoicesPendingList)}`]], { origin: -1 });
          }
          XLSX.utils.book_append_sheet(wb, wsInvoicesPending, 'Invoices Pending');
          
          const wsCurrentInvoices = XLSX.utils.json_to_sheet(CurrentInvoicesList);
          if (CurrentInvoicesList.length > 0) {
            XLSX.utils.sheet_add_aoa(wsCurrentInvoices, [['', '', '', '', '', 'Total Payment Amount', `$ ${calculateTotalAmount(CurrentInvoicesList)}`]], { origin: -1 });
          }
          XLSX.utils.book_append_sheet(wb, wsCurrentInvoices, 'Current Invoices');
  
          const wsPastInvoices = XLSX.utils.json_to_sheet(PastInvoicesList);
          if (PastInvoicesList.length > 0) {
            XLSX.utils.sheet_add_aoa(wsPastInvoices, [['', '', '', '', '', 'Total Payment Amount', `$ ${calculateTotalAmount(PastInvoicesList)}`]], { origin: -1 });
          }
          XLSX.utils.book_append_sheet(wb, wsPastInvoices, 'Past Due');
          
          const wsNextPaymentDues = XLSX.utils.json_to_sheet(NextPaymentDuesData);
          XLSX.utils.book_append_sheet(wb, wsNextPaymentDues, 'Next Payment Dues');
  
          // Generate the Excel file and trigger download
          XLSX.writeFile(wb, 'AgingReport.xlsx');
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  
}
