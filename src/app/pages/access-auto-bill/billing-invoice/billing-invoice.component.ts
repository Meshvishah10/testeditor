import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import {
  BillingInvoiceCommentBody,
  BillingInvoiceResponse,
} from 'src/app/models/BillingInvoice.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { validate } from 'uuid';
declare var jQuery: any;
@Component({
  selector: 'app-billing-invoice',
  templateUrl: './billing-invoice.component.html',
  styleUrl: './billing-invoice.component.scss',
})
export class BillingInvoiceComponent {
  billingList: any;
  statusList: any;
  editStatusList: any
  isSubmitted: boolean = false;
  approvalStatusList: any = [];
  permission: any = '';
  comment: string = '';
  commentList: any;
  invoiceDetail: any;
  submittedDateTo: any;
  submittedDateFrom: any;
  pendingAmount: any;
  paidAmount: any;
  selectedId: string = '';
  selectedStatus: any;
  invoiceId: string = '';
  customvalidation: string = '';
  accountNumber: string = '';
  physicianName: string = '';
  ModelType:any
  paymentDueDate:any
  submittedDate:any
  customvalidation1:string=''
  deleteIds:any = []
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    Invoiceno: null,
    LabInvoiceNo: null,
    AccountNo: null,
    PracticeName: null,
    SubmittedDateFrom: null,
    SubmittedDateTo: null,
    Status: "",
    AmountFrom: null,
    AmountTo: null,
  };
  public state: State = {
    skip: 0,
    take: 50,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  };

  PaymentForm: any = FormGroup;
  InvoiceForm: any = FormGroup;
  memberId: any = '';
  autoPay: any;
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe
  ) {}
  ngOnInit() {
    // Create FormControls for add/edit Supplies
    const decimalRegex =  /^\d+(\.\d{1,2})?$/;
    this.PaymentForm = this.formBuilder.group({
      AmountToPay: ['', [Validators.required,Validators.pattern(decimalRegex)]],
      ConfirmationNumber: [''],
      Comment: ['', Validators.required],
    });
    this.InvoiceForm = this.formBuilder.group({
      Amount: ['', [Validators.required,Validators.pattern(decimalRegex)]],
      Status: ['', Validators.required],
      PaymentDueDate: ['', Validators.required],
      CheckNumber: [''],
      CheckAmount: [''],
      Comment: ['', Validators.required],
    });
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
  
    this.permission = permissions.find((item: any) => {
      return item.Type == 54;
    });
    
    this.InvoiceForm.get('Status').valueChanges.subscribe((value: any) => {
      if (value == 7) {
        this.InvoiceForm.get('CheckNumber').setValidators([
          Validators.required,
        ]);
        this.InvoiceForm.get('CheckAmount').setValidators([
          Validators.required,
        ]);
      } else {
        // If 'Title' is not 'other', remove the 'required' validator from 'other' control
        this.InvoiceForm.get('CheckNumber').clearValidators();
        this.InvoiceForm.get('CheckAmount').clearValidators();
      }
      // Update the validation status of 'other' control
      this.InvoiceForm.get('CheckNumber').updateValueAndValidity();
      this.InvoiceForm.get('CheckAmount').updateValueAndValidity();
    });
    if (this.permission.MenuPermission.View == true) {
      this.getStatusList();
      const qParams = this.activatedRoute.snapshot.queryParams['q'];
      if (qParams) {
        const params = this.common.Decrypt(decodeURIComponent(qParams));
        this.requestPayload.PendingInvoices = params.pendingInvoices || false;
        this.requestPayload.PaymentDueDateFrom = params.paymentDueDateFrom;
        this.requestPayload.PastPaymentDueDate = params.pastPaymentDueDate;
        this.requestPayload.PaymentDueDate = params.paymentDueDate;
        if(params.amountEditType){
          this.requestPayload.AmountEditType = params.amountEditType;
        }
        if (params.submittedDateFrom) {
          this.requestPayload.SubmittedDateFrom = params.submittedDateFrom;
          this.submittedDateFrom = new Date(params.submittedDateFrom);
        }
        if (params.submittedDateTo) {
          this.requestPayload.SubmittedDateTo = params.submittedDateTo;
          this.submittedDateTo = new Date(params.submittedDateTo);
        }
        if (params.paymentDateFrom) {
          this.requestPayload.PaymentDateFrom = params.paymentDateFrom;
        }
        if (params.paymentDateTo) {
          this.requestPayload.PaymentDateTo = params.paymentDateTo;
        }
        if (params.modifiedDateFrom) {
          this.requestPayload.ModifiedDateFrom = params.modifiedDateFrom;
        }
        if (params.modifiedDateTo) {
          this.requestPayload.ModifiedDateTo = params.modifiedDateTo;
        }
        if (params.partialPaymentFrom) {
          this.requestPayload.PartialPaymentFrom = params.partialPaymentFrom;
        }
        if (params.partialPaymentTo) {
          this.requestPayload.PartialPaymentTo = params.partialPaymentTo;
        }
      }
      this.getBillingList();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  // amountValidation(event: any) {
  //   const inputValue = event.target.value;
  //   const decimalRegex =  /^\d+(\.\d{1,2})?$/;
  //   if (decimalRegex.test(inputValue)) {
  //     console.log('Valid amount:', inputValue);
  //     // You can perform further actions if needed
  //     this.requestPayload.AmountFrom = inputValue;
  //   } else {
  //     console.error('Invalid amount:', inputValue);
  //     // Handle invalid input, e.g., reset the value or show an error message
  //      this.requestPayload.AmountFrom = '';  // Example: reset the value
  //   }
  // }

  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.statusList = res?.BillingInvoicesPaymentStage;
          this.approvalStatusList = res?.ClientBillingApprovalStage;
          this.editStatusList =  res?.BillingInvoicesEditPaymentStage
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  limitLength(event: any) {
    const maxLength = 9; // Adjust the maximum length as needed
    const input = event.target.value;
  
    if (input.length > maxLength) {
      event.preventDefault();
      event.target.value = input.slice(0, maxLength);
    }
  }
  getBillingList() {
  
      this.requestPayload.SubmittedDateFrom = this.submittedDateFrom
        ? this.datePipe.transform(
            new Date(this.submittedDateFrom),
            'MM/dd/yyyy'
          )
        : null;
      this.requestPayload.SubmittedDateTo = this.submittedDateTo
        ? this.datePipe.transform(new Date(this.submittedDateTo), 'MM/dd/yyyy')
        : null;
    
       
    this.api
      .callApi(
        this.constant.BillingInvoice +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: BillingInvoiceResponse) => {
          
          this.billingList = {
            data: res.BillingInvoicesList,
            total: res.Total,
          };
          //console.log("Getting billing list", res);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  search() {
    const state: DataStateChangeEvent = {
      skip: 0,
      take: this.state.take !== undefined ? this.state.take : 50,
      sort: this.state.sort,
      filter: this.state.filter,
    };
    this.dataStateChange(state);
  }

  OnReset() {
    this.requestPayload.Invoiceno = null;
    this.requestPayload.LabInvoiceNo = null;
    this.requestPayload.AccountNo = null;
    this.requestPayload.PracticeName = null;
    this.requestPayload.SubmittedDateFrom = null;
    this.requestPayload.SubmittedDateTo = null;
    this.requestPayload.Status = '';
    this.requestPayload.AmountFrom = null;
    this.requestPayload.AmountTo = null;
    this.submittedDateFrom = null;
    this.submittedDateTo = null;
    this.billingList = {
      data: [],
      total: 0,
    };
    this.getBillingList();
  }
  getFiles(id: string, type: number) {
    this.api
      .callApi(
        this.constant.BillingInvoiceFile,
        {
          Id: id,
          Type: type,
        },
        'PUT',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // Decode the Base64 string into a binary array

          const binaryString = atob(res.FileBytes);
          // Convert the binary string into a Uint8Array
          const bytesArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytesArray[i] = binaryString.charCodeAt(i);
          }
          // Create a Blob from the Uint8Array
          const blob = new Blob([bytesArray], {
            type:
              type === 1
                ? 'application/octet-stream'
                : type === 2
                ? 'application/pdf'
                : 'application/octet-stream',
          });
          // Create a URL for the Blob
          const blobUrl = URL.createObjectURL(blob);
          if (type === 1) {
            // Create a link element
            const link = document.createElement('a');
            link.href = blobUrl;
            // Optionally set the download attribute to specify the file name
            link.download = res.FileName;
            // Programmatically click on the link to trigger the download
            link.click();
            // Clean up: revoke the Blob URL
            URL.revokeObjectURL(blobUrl);
          }
          if (type === 2) {
            const pdfWindow = window.open('', '_blank');
            if (pdfWindow) {
              pdfWindow.document.write(`
              <html>
                <head>
                  <style>
                    body { margin: 0; }
                  </style>
                </head>
                <body>
                  <object width='100%' height='100%' data='${blobUrl}' type='application/pdf'></object>
                </body>
              </html>
            `);
              pdfWindow.document.close();
            }
          }
        },
        (err: any) => {
          // console.log(err);
          // show error toast
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  modelCommentOpen(id: string) {
    this.selectedId = id;
    (function ($) {
      $('#viewAdd').modal('show');
    })(jQuery);
    this.getComments(id);
  }
  modelCommentClose() {
    (function ($) {
      $('#viewAdd').modal('hide');
    })(jQuery);
    this.selectedId = '';
    this.getBillingList();
  }
  getComments(id: string) {
    this.selectedId = id;
    this.api
      .callApi(
        this.constant.BillingInvoiceCommentList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.commentList = res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  submitComment() {
    if (this.comment == '') {
      return;
    } else {
      const body: BillingInvoiceCommentBody = {
        ClientBillingId: this.selectedId,
        Comment: this.comment,
      };

      this.api
        .callApi(
          this.constant.BillingInvoiceAddComment,
          body,
          'POST',
          true,
          true
        )
        .subscribe(
          (res: any) => {
            this.comment = '';
            this.getComments(this.selectedId);
            this.toastr.success(res.Message, 'Access Med Lab');
          },
          (err: any) => {
            // console.log(err);
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
  modelChargeInvoiceOpen(id: string) {
    (this.invoiceId = id),
      (function ($) {
        $('#charge-invoice-modal').modal('show');
      })(jQuery);
  }
  modelChargeInvoiceClose() {
    (function ($) {
      $('#charge-invoice-modal').modal('hide');
    })(jQuery);
    this.invoiceId = '';
    this.getBillingList();
  }
  modelInvoiceOpen(id: string) {
    this.selectedId = id;
    (function ($) {
      $('#invoice').modal('show');
    })(jQuery);
    this.getInvoice(id);
  }
  modelPartialPayOpen(id: string, type: string) {
    this.selectedId = id;
    this.ModelType = type;
    (function ($) {
      $(`#${type}`).modal('show');
    })(jQuery);
    this.getInvoice(id);
  }
  modelPartialPayClose(type: string) {
    this.selectedId = '';
    this.isSubmitted = false;
    this.customvalidation = '';
    this.customvalidation1 = '';
    this.pendingAmount = ''; 
    this.paidAmount = '';
    this.PaymentForm.reset();
    this.InvoiceForm.reset();
    const paymentTermIds = ['paymentTerm10', 'paymentTerm15', 'paymentTerm20'];
    paymentTermIds.forEach(id => {
      const radioElement = document.getElementById(id);
      if (radioElement) {
        (radioElement as HTMLInputElement).checked = false;
      }
    });
    (function ($) {
      $(`#${type}`).modal('hide');
    })(jQuery);
    this.getBillingList();
  }
  onFileSelect(e: any) {
  
    if(e.target.files.length > 0){

     let filename = e.target.files[0].name;
     let lstindex = filename.lastIndexOf('.') + 1;
     let extfile = filename.substr(lstindex, filename.length).toLowerCase();
     if (extfile === 'pdf' || extfile === 'htm' || extfile === 'html') {
       const reader = new FileReader();
       reader.onload = () => {
         // The result property contains the file's data as a data URL
         const arrayBuffer = reader.result as ArrayBuffer;
         const bytearray = new Uint8Array(arrayBuffer);
         // convert data in array format
         const base64String = Array.from(bytearray);
         // console.log(e.target.files[0].name, base64String);
         // set the request body
         // this.fileName = e.target.files[0].name;
         // this.fileContentByteData = base64String;
       
         this.InvoiceForm.get('FileName')?.setValue(e.target.files[0].name);
         this.InvoiceForm
           .get('FileContentByteData')
           ?.setValue(base64String);
       };
       // This line is missing in your original code
       reader.readAsArrayBuffer(e?.target?.files?.[0]);
       // } else {
       //   this.toastr.error(
       //     "PDF size shouldn't be more than 5 MB!",
       //     'Access Med Lab'
       //   );
       // }
     }
     else {
       this.toastr.error('Only PDF, htm, or html files are allowed!', 'Access Med Lab');
     }
    }
    else{
     this.InvoiceForm.get('FileName')?.setValue('');
     this.InvoiceForm
       .get('FileContentByteData')
       ?.setValue('');
    }
  
   
 }
  modelInvoiceClose() {
    (function ($) {
      $('#invoice').modal('hide');
    })(jQuery);
    this.selectedId = '';
    this.getBillingList();
  }

  onPayInvoice() {
    this.api
      .callApi(
        this.constant.BillingInvoiceChargeInvoice +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.invoiceId)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          if(res.Status == 2){
            this.toastr.info(res.Message, 'Access Med Lab');
          }else{
            this.toastr.success(res.Message, 'Access Med Lab');
          }
          this.getBillingList();
          this.modelChargeInvoiceClose();
        },
        (err: any) => {
          this.getBillingList();
          this.toastr.error(err.error?.errors[0].message, 'Access Med Lab');
          this.modelChargeInvoiceClose()
        }
      );
  }
  public dataStateChange(state: DataStateChangeEvent): void {
    // call Filter and Soring Function
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);

    this.state = state;
    this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
    this.requestPayload.Filters = RequestData.Filters;
    this.requestPayload.Page = (state.skip + state.take) / state.take;
    if (RequestData.Filters !== null && RequestData.Filters.length > 0) {
      this.requestPayload.Filters = RequestData.Filters.map((filter: any) => {
        if (filter.Field === 'PaymentDueDate' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        if (filter.Field === 'CreatedDate' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        if (filter.Field === 'PaymentDate' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        return filter;
      });
    }
    this.getBillingList();
  }
  getInvoice(id: string) {
    //console.log(id,"id")
    this.selectedId = id;
    this.api
      .callApi(
        this.constant.commonBillingInvoice +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
      
          this.invoiceDetail = res;
     
          this.pendingAmount = res?.PendingAmount;
          this.paidAmount = res?.PaidAmount;
          this.paymentDueDate = res?.PaymentDueDate;
          this.submittedDate = res?.CreatedDate;
          if (this.ModelType == 'Edit' && res) {
            this.InvoiceForm.reset({
              Amount: res?.Amount?.toFixed(2),
              Status: res?.PaymentStatus,
              PaymentDueDate: new Date(res?.PaymentDueDate),
              CheckNumber: res?.CheckNumber,
              CheckAmount: res?.CheckAmount?.toFixed(2),
            });
          }
        },
        (err: any) => {
          this.invoiceDetail = ''
          this.modelPartialPayClose('Edit');
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  get f() {
    return this.PaymentForm.controls;
  }
  get m() {
    return this.InvoiceForm.controls;
  }
  amountChange() {
    if (this.isSubmitted) {
      this.customvalidation =
        this.PaymentForm.value.AmountToPay > this.pendingAmount
          ? 'Please enter amount less then or equal to pending amount'
          : '';
    }
  }
  amount() {
    if (this.isSubmitted) {
      this.customvalidation =
        this.InvoiceForm.value.Amount < this.paidAmount
          ? 'Please enter amount greater then or equal to paid amount'
          : '';
    }
  }
  CheckAmount() {
    if (this.isSubmitted) {
      this.customvalidation1 =
        this.InvoiceForm.value.CheckAmount > this.pendingAmount
          ? 'Please enter amount less then or equal to pending amount'
          : '';
    }
  }
  updatePaymentDueDate(paymentTerm: any) {
    const target = paymentTerm.target as HTMLInputElement;
    const numberOfDays = parseInt(target?.value);
    const currentDate = new Date(this.submittedDate);
    const newDueDate = new Date(
      currentDate.setDate(currentDate.getDate() + numberOfDays)
    );

    this.InvoiceForm.patchValue({
      PaymentDueDate: newDueDate,
    });
  }

  Submit() {
    this.isSubmitted = true;
    if (this.PaymentForm.value.AmountToPay == '.00' || this.PaymentForm.value.AmountToPay == '.' || this.PaymentForm.value.AmountToPay == '') {
      this.PaymentForm.value.AmountToPay = '0.00';
    }
    this.customvalidation =
      this.PaymentForm.value.AmountToPay > this.pendingAmount
        ? 'Please enter amount less then or equal to pending amount'
        : '';

    if (this.PaymentForm.invalid || this.customvalidation !== '') {
      return;
    } else {
      let body = {
        Id: this.selectedId,
        AmountToPay: this.PaymentForm.value.AmountToPay,
        ConfirmationNumber: this.PaymentForm.value.ConfirmationNumber,
        Comment: this.PaymentForm.value.Comment,
      };
     
      this.api
        .callApi(
          this.constant.BillingInvoicePartialPay,
          body,
          'POST',
          true,
          true
        )
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.toastr.success(resp.Message, 'Access Med Lab');

              this.modelPartialPayClose('PartialPay');
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
  EditSubmit() {
    this.isSubmitted = true;
    if (this.InvoiceForm.value.Amount == '.00' || this.InvoiceForm.value.Amount == '.' || this.InvoiceForm.value.Amount == '') {
      this.InvoiceForm.value.Amount = '0.00';
    }
    if (this.InvoiceForm.value.CheckAmount == '.00' || this.InvoiceForm.value.CheckAmount == '.' || this.InvoiceForm.value.CheckAmount == '') {
      this.InvoiceForm.value.CheckAmount = '0.00';
    }
    this.customvalidation =
      this.InvoiceForm.value.Amount < this.paidAmount
        ? 'Please enter amount greater then or equal to paid amount'
        : '';
     
    if (
      this.InvoiceForm.invalid ||
      this.customvalidation !== '' ||
      this.customvalidation1 !== ''
    ) {

      return;
    }
     else {
      let body = {
        Id: this.selectedId,
        Amount: this.InvoiceForm.value.Amount,
        Status: this.InvoiceForm.value.Status,
        PaymentDueDate: this.datePipe.transform(
          this.InvoiceForm.get('PaymentDueDate').value,
          'MM/dd/yyyy'
        ),
        CheckNumber: this.InvoiceForm.value.CheckNumber,
        CheckAmount: this.InvoiceForm.value.CheckAmount,
        Comment: this.InvoiceForm.value.Comment,
        FileName: this.InvoiceForm.value.FileName,
        FileContentByteData: this.InvoiceForm .value.FileContentByteData,
      };
    
      this.api
        .callApi(this.constant.BillingInvoiceUpdate, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.toastr.success(resp.Message, 'Access Med Lab');
              this.modelPartialPayClose('Edit');
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
  deleteModel(id: string) {
    this.deleteIds.push(id);
    (function ($) {
           $('#delete').modal('show');
       })(jQuery);
  }
  // Delete product
  deleteInvoice() {
    // console.log(this.deleteIds,"Delete")
    this.api
      .callApi(
        this.constant.commonBillingInvoice +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.deleteIds)),
        [],
        'DELETE',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');      
            this.modelDeleteClose();
            this.getBillingList();
          }
        },
        (err: any) => {
          //this.disable = false;
          this.modelDeleteClose();
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }


  modelDeleteClose() {
    this.deleteIds = [];
    (function ($) {
      $('#delete').modal('hide');
    })(jQuery);
  }
}
