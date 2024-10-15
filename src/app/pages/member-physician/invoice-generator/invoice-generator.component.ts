
import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
declare var jQuery: any;
@Component({
  selector: 'app-invoice-generator',
  templateUrl: './invoice-generator.component.html',
  styleUrl: './invoice-generator.component.scss'
})
export class InvoiceGeneratorComponent {
  invoiceGenerateForm:any
  isSubmitted:boolean=false
  permission:any
  @Input() PhysicianId:any;
   @Input() PhysicianName:any;
   @Input() InvoiceAutoPayList:any ;
  constructor(
    public activeModal: NgbActiveModal,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,

  ) {}
  ngOnInit(): void {
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    
    this.invoiceGenerateForm = this.formBuilder.group({     
      ClientId: [this.PhysicianName || '', Validators.required],
      FileName: ['',Validators.required],
      FileContentByteData:['',Validators.required],
      TotalAmount: ['',[Validators.required,Validators.pattern(decimalRegex)]],
      AutoPay: [1,Validators.required],
      Comment : [''],
    });

   if (  this.PhysicianName ==undefined || this.InvoiceAutoPayList ==undefined  || !this.InvoiceAutoPayList?.length) {
    this.Close();
  }
  } 

  get f() { return this.invoiceGenerateForm.controls; }
   // It's use for close delete model
   Close() {
    this.isSubmitted=false
    this.invoiceGenerateForm.reset();
    this.activeModal.close('No');
  }

 
  onSubmit(){
    this.isSubmitted = true;
    if (this.invoiceGenerateForm.value.TotalAmount == '.00' || this.invoiceGenerateForm.value.TotalAmount == '.' || this.invoiceGenerateForm.value.TotalAmount == '') {
      this.invoiceGenerateForm.value.TotalAmount = '0.00';
    }
    if (this.invoiceGenerateForm.invalid) {   
      return;
    }
   
  let body = {
      ClientId: this.PhysicianId,
      FileName: this.invoiceGenerateForm.value.FileName,
      FileContentByteData: this.invoiceGenerateForm.value.FileContentByteData,
      TotalAmount: this.invoiceGenerateForm.value.TotalAmount,
      AutoPay: this.invoiceGenerateForm.value.AutoPay,
      Comment: this.invoiceGenerateForm.value.Comment,
     
    };
 
      this.api
      .callApi(this.constant.generateInvoice, body , 'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.invoiceGenerateForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
         this.Close()
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
  onFileSelect(e: any) {
  
     if(e.target.files.length > 0){

      let filename = e.target.files[0].name;
      let lstindex = filename.lastIndexOf('.') + 1;
      let extfile = filename.substr(lstindex, filename.length).toLowerCase();
      if (extfile === 'pdf' || extfile === 'htm' || extfile == 'html') {
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
        
          this.invoiceGenerateForm.get('FileName')?.setValue(e.target.files[0].name);
          this.invoiceGenerateForm
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
      this.invoiceGenerateForm.get('FileName')?.setValue('');
      this.invoiceGenerateForm
        .get('FileContentByteData')
        ?.setValue('');
     }
   
    
  }
}
