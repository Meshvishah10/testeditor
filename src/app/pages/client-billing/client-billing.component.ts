import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup ,Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { BillingCommentBody, ClientBillingResponse } from 'src/app/models/ClientBilling.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-client-billing',
  templateUrl: './client-billing.component.html',
  styleUrl: './client-billing.component.scss'
})
export class ClientBillingComponent {
  statusList:any
  billingList:any
  permission: any = '';
  TypeList:any
  comment:string=''
  commentList:any
  invoiceDetail:any
  paymentStatusList:any
  submittedDateTo:any
  submittedDateFrom:any
  paymentDueDateTo:any
  paymentDueDateFrom:any
  selectedId:string=''
  selectedStatus:any
  invoiceId:string=''
  name:any
  clientId:any
  accountNumber:string=''
  physicianName:string=''
  InvoiceForm:any = ''
  isSubmitted:boolean = false
  editStatusList:any = []
  customvalidation:any = ''
  paymentDueDate:any
  submittedDate:any
  ModelType:any = ''
  customvalidation1:any = ''
  deleteid: any = [];
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    InvoiceNo:null,
    SubmittedDateFrom:null,
    SubmittedDateTo:null,
    Status:'',
    AmountFrom: null,
    AmountTo: null,
    PaymentDueDateFrom: null,
    PaymentDueDateTo: null,
    ClientId:null
    
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

  SuppliesForm:any=FormGroup;
  memberId:any='';
  supplies: any=[];
  freqList: any=[];
  
  constructor( 
   private api: ApiService,
   private constant: ConstantService,
   public activatedRoute: ActivatedRoute,
   private common: CommonService,
   private toastr: ToastrService,
   public formBuilder: FormBuilder,
   public FilterAndSortingService: FilterAndSortingService,
   private router: Router,
   private datePipe: DatePipe){
 }
  ngOnInit() {
    const decimalRegex =  /^\d+(\.\d{1,2})?$/;
     // Create FormControls for add/edit Supplies
     this.SuppliesForm = this.formBuilder.group({
      NeedlesButterflyQty: [''],
      NeedlesSafetyQty : [''],
    });
    this.InvoiceForm = this.formBuilder.group({
      Amount: ['', [Validators.required , Validators.pattern(decimalRegex)]],
      Status: ['', Validators.required],
      PaymentDueDate: ['', Validators.required],
      CheckNumber: [''],
      CheckAmount: [null],
      Comment: ['', Validators.required],
      FileName:[''],
      FileContentByteData:[''],
    });

    // Get permissions from local storage
    this.clientId =  this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : null;

    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    if(this.clientId !== '' && this.clientId !== null){
      this.accountNumber =  this.activatedRoute.snapshot.params['accountNumber'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['accountNumber']) : '';
      this.physicianName =  this.activatedRoute.snapshot.params['physicianName'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['physicianName']) : '';
    
      this.permission = permissions.find((item: any) => {
        
        return item.Type == 44;
       
      });
    
      if (this.permission.MenuPermission.ViewInvoice == true) {  
        this.getStatusList()   
         
        this.requestPayload.ClientId=this.clientId
        this.getBillingList() 
      }
      else{
          this.router.navigate(['/lab/dashboard']);
      }
    }else{
      this.permission = permissions.find((item: any) => {
        return item.Type == 36;
      });
  
    if (this.permission.MenuPermission.View == true) {  
      this.getStatusList()   
      this.getBillingList()    
    }
    else{
        this.router.navigate(['/lab/dashboard']);
    }
    }
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
  }
  modelEditClose() {
    this.selectedId = '';
    this.isSubmitted = false;
    this.customvalidation = '';
    this.customvalidation1 = '';
    const paymentTermIds = ['paymentTerm10', 'paymentTerm15', 'paymentTerm20'];
    paymentTermIds.forEach(id => {
      const radioElement = document.getElementById(id);
      if (radioElement) {
        (radioElement as HTMLInputElement).checked = false;
      }
    });
    this.InvoiceForm.reset();
    (function ($) {
      $(`#Edit`).modal('hide');
    })(jQuery);
    this.getBillingList();
  }
  
  getFiles(id: string, type: number) { 
    this.api
      .callApi(
        this.constant.clientBillingFile,
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
          const binaryString = atob(res.FilePath);
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
              if (res.FileName.endsWith('.htm') || res.FileName.endsWith('.html')) {
  
                  pdfWindow.document.write(`
                      <html>
                          <head>
                              <style>
                                  body { margin: 0; }
                              </style>
                          </head>
                          <body>
                              <iframe width='100%' height='100%' srcdoc='${binaryString}'></iframe>
                          </body>
                      </html>
                  `);
              } else if (res.FileName.endsWith('.pdf')) {
                  // If the file is a PDF
                  pdfWindow.document.write(`
                      <html>
                          <head>
                              <style>
                                  body { margin: 0; }
                              </style>
                          </head>
                          <body>
                              <embed width='100%' height='100%' src='${blobUrl}' type='application/pdf' />
                          </body>
                      </html>
                  `);
              }
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
  modelChargeInvoiceOpen(id: string) {
    this.invoiceId=id,
    (function ($) {
      $('#charge-invoice-modal').modal('show');
    })(jQuery); 
  }
  modelChargeInvoiceClose() {
    (function ($) {
      $('#charge-invoice-modal').modal('hide');
    })(jQuery);
    this.invoiceId = '';
    // this.getBillingList();
  }
  onPayInvoice() {
    this.api
      .callApi(
        this.constant.clientBillingChargeInvoice +
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
          this.modelChargeInvoiceClose()
        },
        (err: any) => {
          this.getBillingList();
          this.toastr.error(err.error?.errors[0].message, 'Access Med Lab');
          this.modelChargeInvoiceClose()
        }
      );
  }
CheckAmount() {
  if (this.isSubmitted) {
    this.customvalidation1 =
      this.InvoiceForm.value.CheckAmount > this.invoiceDetail.PendingAmount
        ? 'Please enter amount less then or equal to pending amount'
        : '';
  }
}
  getBillingList(){
 
//console.log(this.requestPayload)
   
      this.requestPayload.SubmittedDateFrom = this.submittedDateFrom ? this.datePipe.transform(new Date(this.submittedDateFrom), 'MM/dd/yyyy') : null;
      this.requestPayload.SubmittedDateTo = this.submittedDateTo ? this.datePipe.transform(new Date(this.submittedDateTo), 'MM/dd/yyyy') : null;
      this.requestPayload.PaymentDueDateFrom = this.paymentDueDateFrom ? this.datePipe.transform(new Date(this.paymentDueDateFrom), 'MM/dd/yyyy') : null;
      this.requestPayload.PaymentDueDateTo = this.paymentDueDateTo ? this.datePipe.transform(new Date(this.paymentDueDateTo), 'MM/dd/yyyy') : null;
    
    this.api
      .callApi(
        this.constant.clientBillingList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res:ClientBillingResponse) => {
          // console.log(res)
          this.billingList = {
            data: res.ClientBillingList,
            total: res.Total,
          };

        
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
      filter: this.state.filter 
    };
    this.dataStateChange(state);
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
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
          if (filter.Field === 'CreatedDate' && filter.Value instanceof Date) {
            filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
          return filter;
      });}
    this.getBillingList()
  }
  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
           this.statusList = res?.ClientBillingApprovalStage
           this.paymentStatusList=res?.ClientBillingPaymentStage
           this.editStatusList =  res?.BillingInvoicesEditPaymentStage
           this.freqList = res?.ClientProductFreeSupplyFrequencyList
          },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  reidrectView(Id:any): void {
    // Navigate to another route with the ticketNumber as a parameter
    //EncryptID
    this.router.navigate(['/lab/follow-up/discard-specimen/view', this.common.EncryptID(Id) ]);
  }
 
  OnReset() {
    this.requestPayload.InvoiceNo=null,
    this.requestPayload.SubmittedDateFrom=null,
    this.requestPayload.SubmittedDateTo=null,
    this.requestPayload.Status='',
    this.requestPayload.AmountFrom= null,
    this.requestPayload.AmountTo = null,
    this.submittedDateFrom=null,
    this.submittedDateTo=null,
    this.requestPayload.PaymentDueDateFrom= null,
    this.requestPayload.PaymentDueDateTo= null,
    this.paymentDueDateFrom= null,
    this.paymentDueDateTo= null
    this.billingList = {
      data: [],
      total: 0,
    };
    this.getBillingList();
  }
  modelCommentOpen(id: string) {
    this.selectedId=id,
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
    this.comment = '';
    this.getBillingList();
  }
  getComments(id: string) {
    this.selectedId = id;
    this.api
      .callApi(
        this.constant.clientBillingCommentList +
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
      const body:BillingCommentBody = {
        ClientBillingId: this.selectedId,
        Comment: this.comment,
      };
  
      this.api
        .callApi(this.constant.clientBillingAddComment, body, 'POST', true, true)
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
  statusChangeModal(id:any,Status:any){
    this.selectedId=id,
    this.selectedStatus=Status
    this.modelStatusOpen()
  }
  modelStatusOpen(){
    (function ($) {
      $("#updateStatus").modal("show");
    })(jQuery);
  }
  modelUpdateStatusClose() {
    this.selectedId='',
    this.selectedStatus='',
  
    (function ($) {
      $("#updateStatus").modal("hide");
    })(jQuery);
    this.getBillingList()
  }
  statusChange(){
    let body:any ={
      Id: this.selectedId,
      Stage:this.selectedStatus,
    }
   
    this.api
          .callApi(this.constant.clientBillingStatusChange,body, 'PUT', true, true)
          .subscribe(
            (res: any) => {
                var resp = res;
                if(resp.Status ==1){
                this.modelUpdateStatusClose()
                this.toastr.success(resp.Message,'Access Med Lab');
                }
            },
            (err: any) => {
              this.modelUpdateStatusClose()
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }
  modelInvoiceOpen(id: string,type: string) {
    this.selectedId=id,
    this.ModelType = type,
    (function ($) {
      $(`#${type}`).modal('show');
    })(jQuery);
    this.getInvoice(id);
  }

  modelInvoiceClose() {
    (function ($) {
      $('#invoice').modal('hide');
    })(jQuery);
    this.selectedId = '';
    this.ModelType = '';
    this.paymentDueDate = ''
    this.getBillingList();
  }
  getInvoice(id: string) {
    this.selectedId = id;
    this.api
      .callApi(
        this.constant.commonBilling +
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
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  get m() {
    return this.InvoiceForm.controls;
  }
  amount() {
    if (this.isSubmitted) {
      this.customvalidation =
        this.InvoiceForm.value.Amount < this.invoiceDetail.paidAmount
          ? 'Please enter amount greater then or equal to paid amount'
          : '';
    }
  }
  limitLength(event: any) {
    const maxLength = 9; // Adjust the maximum length as needed
    const input = event.target.value;
  
    if (input.length > maxLength) {
      event.preventDefault();
      event.target.value = input.slice(0, maxLength);
    }
  }
   // get Free Suplies Details and configure in Form
   getFreeSuplies(id:any){
    this.memberId=id;
    this.api
    .callApi(
      this.constant.GetFreeSupliesClientBilling +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(id)),
      [],
      'GET',
      true,
      true
    )
    .subscribe(
      (res: any) => {
        var resp = res;

        this.supplies = res.ClientProductFreeSupplies;
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
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
  EditSubmit() {
    this.isSubmitted = true;
    if (this.InvoiceForm.value.Amount == '.00' || this.InvoiceForm.value.Amount == '.' || this.InvoiceForm.value.Amount == '') {
      this.InvoiceForm.value.Amount = '0.00';
    }
    if (this.InvoiceForm.value.CheckAmount == '.00' || this.InvoiceForm.value.CheckAmount == '.' || this.InvoiceForm.value.CheckAmount == '') {
      this.InvoiceForm.value.CheckAmount = '0.00';
    }
    this.customvalidation =
      this.InvoiceForm.value.Amount < this.invoiceDetail.PaidAmount
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
        CheckAmount: this.InvoiceForm.value.CheckAmount || null,
        Comment: this.InvoiceForm.value.Comment,
        FileName: this.InvoiceForm.value.FileName,
        FileContentByteData: this.InvoiceForm .value.FileContentByteData,
      };
      
      this.api
        .callApi(this.constant.clientBillingUpdate, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.toastr.success(resp.Message, 'Access Med Lab');
              this.modelEditClose();
            }
          },
          (err: any) => {
           
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
   //Update Free Supplies Details
   UpdateFreeSupplies(){
    if(this.memberId != ''){
      let body = {
        Id: this.memberId,
        ClientProductFreeSupplies: this.supplies.map((supply:any) => ({
          FreeSuppliesTypeId: supply.FreeSuppliesTypeId,
          Quantity : supply.Quantity ,
          Frequency : supply.Frequency , 
         
        }))
      };
      this.api
        .callApi(this.constant.UpdateFreeSupliesClientBilling, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
              this.modelSuppliesClose();
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }else{
      this.toastr.error('Something wrong Please try again!','Access Med Lab')
    }
  }

  modelSuppliesClose(){
    this.memberId = '';
    this.SuppliesForm.reset();
    (function ($) {
      $("#ManageFreeSupplies").modal("hide");
    })(jQuery);
  }

  modelDeleteOpen(id:any){
    (function ($) {
      $("#delete").modal("show");
    })(jQuery);
  
    this.deleteid.push(id)
  
  }
  modelDeleteClose(){
    (function ($) {
      $("#delete").modal("hide");
    })(jQuery);
    this.deleteid=[]
 
  
  }

  delete() {
    this.api
      .callApi(
        this.constant.commonBilling +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.deleteid)),
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
         
          this.modelDeleteClose();
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}


  