import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-add-charge-invoice',
  templateUrl: './add-charge-invoice.component.html',
  styleUrl: './add-charge-invoice.component.scss'
})
export class AddChargeInvoiceComponent {
 chargeInvoiceForm: any = FormGroup;
 isSubmitted: any = false;
 permission: any;
 transactionPer: any;

 constructor(
   private router: Router,
   private api: ApiService,
   private constant: ConstantService,
   private common: CommonService,
   private formBuilder: FormBuilder,
   private toastr: ToastrService,
   public datePipe: DatePipe,
 ) {}

 ngOnInit() {
   let permissions = this.common.Decrypt(localStorage.getItem('permission'));
   this.permission = permissions.find((item: any) => {
     return item.Type == 67;
   });
   if (this.permission.MenuPermission.Add !== true) {
     this.router.navigate(['/lab/dashboard']);
   }
   const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

   this.chargeInvoiceForm = this.formBuilder.group({
     ClientNumber: ['', Validators.required],
     FirstName: ['', Validators.required],
     LastName: ['', Validators.required],
     CardNumber: ['', Validators.required],
     CardCVV: ['', Validators.required],
     CardExpirationMonth: ['', Validators.required],
     CardExpirationYear: ['', Validators.required],
     Amount: ['', Validators.required],
     TotalAmount:[{ value: '0.00', disabled: true }],
     ZipCode: [''],
     Email: ['',Validators.pattern(emailregex)],
     Description: [''],
   });
   this.getMasterList();
 }

 get f() {
   return this.chargeInvoiceForm.controls;
 }

 changeAmount(){
  let Percentage = this.transactionPer;
  let amount = this.chargeInvoiceForm.value.Amount;
  let totalAmount = (amount * Percentage) / 100;
  let newTotalAmount = Number(amount) + Number(totalAmount);
  // Use patchValue to update the form control
  this.chargeInvoiceForm.patchValue({ TotalAmount: newTotalAmount.toFixed(2) });
}

getMasterList() {
  this.api
    .callApi(this.constant.MasterDetails, [], 'GET', true, true)
    .subscribe(
      (res: any) => {
        // Assuming `safeCollectForm` is your FormGroup and `processing` is the FormControl
        this.transactionPer = res.TransactionPercentage;
      },
      (err: any) => {
        // this.stateList = [];
        // show error toast
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}
 onSubmit() {
   this.isSubmitted = true;
   if (this.chargeInvoiceForm.value.Amount == '.00' || this.chargeInvoiceForm.value.Amount == '.' || this.chargeInvoiceForm.value.Amount == '') {
    this.chargeInvoiceForm.value.Amount = '0.00';
  }
   if (this.chargeInvoiceForm.invalid) {
     return;
   }
   const body = {
    ClientNumber: this.chargeInvoiceForm.value.ClientNumber,
    FirstName: this.chargeInvoiceForm.value.FirstName,
    LastName: this.chargeInvoiceForm.value.LastName,
    CardNumber: this.chargeInvoiceForm.value.CardNumber,
    CardCVV: this.chargeInvoiceForm.value.CardCVV,
    CardExpirationMonth: this.chargeInvoiceForm.value.CardExpirationMonth,
    CardExpirationYear: this.chargeInvoiceForm.value.CardExpirationYear,
    Amount: this.chargeInvoiceForm.value.Amount,
    ZipCode: this.chargeInvoiceForm.value.ZipCode,
    Email: this.chargeInvoiceForm.value.Email==''?null:this.chargeInvoiceForm.value.Email,
    Description: this.chargeInvoiceForm.value.Description
   };
   this.api
     .callApi(this.constant.AddChargeInvoice, body, 'POST', true, true)
     .subscribe(
       (res: any) => {
         var resp = res;
         this.isSubmitted = false;
         if(resp.Status == 1 || resp.Status == 2){
         this.chargeInvoiceForm.reset();
         this.toastr.success(resp.Message, 'Access Med Lab');
         this.router.navigate(['/lab/access-auto-bill/charge-invoice'])
         }else{
          this.toastr.error(resp.Message, 'Access Med Lab');
         }
       },
       (err: any) => {
         this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
       }
     );
 }
}
