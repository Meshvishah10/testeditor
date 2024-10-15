import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-add-billing-cycle',
  templateUrl: './add-billing-cycle.component.html',
  styleUrl: './add-billing-cycle.component.scss',
})
export class AddBillingCycleComponent {
  @Input() sampleFileLink!: String;

  //InvoiceDate* , BillingFromDate* , BillingToDate* , FileName* , FileContentByteData*
  billingCycleForm: any = FormGroup;
  isSubmitted: any = false;
  permission: any;

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private common: CommonService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public datePipe: DatePipe
  ) {}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 55;
    });
    if (this.permission.MenuPermission.Add !== true) {
      this.router.navigate(['/lab/dashboard']);
    }

    this.billingCycleForm = this.formBuilder.group({
      InvoiceDate: ['', Validators.required],
      BillingFromDate: ['', Validators.required],
      BillingToDate: ['', Validators.required],
      FileName: ['', Validators.required],
      FileContentByteData: ['', Validators.required],
    });
  }

  get f() {
    return this.billingCycleForm.controls;
  }

  onCancelAddCycleForm() {
    this.activeModal.close('No');
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.billingCycleForm.invalid) {
      return;
    }
    const body = {
      InvoiceDate: this.datePipe.transform(
        new Date(this.billingCycleForm.value.InvoiceDate),
        'MM/dd/yyyy'
      ),
      BillingFromDate: this.datePipe.transform(
        new Date(this.billingCycleForm.value.BillingFromDate),
        'MM/dd/yyyy'
      ),
      BillingToDate: this.datePipe.transform(
        new Date(this.billingCycleForm.value.BillingToDate),
        'MM/dd/yyyy'
      ),
      FileName: this.billingCycleForm.value.FileName,
      FileContentByteData: this.billingCycleForm.value.FileContentByteData,
    };
    this.api
      .callApi(this.constant.BillingCycle, body, 'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.billingCycleForm.reset();
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.activeModal.close('Yes');
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  onFileSelect(e: any) {
    let filename = e.target.files[0].name;
    let lstindex = filename.lastIndexOf('.') + 1;
    let extfile = filename.substr(lstindex, filename.length).toLowerCase();
    if (extfile === 'csv') {
      // let size = e.target.files[0].size;
      // if (size <= 1024 * 1024 * 5) {
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
        this.billingCycleForm.get('FileName')?.setValue(e.target.files[0].name);
        this.billingCycleForm
          .get('FileContentByteData')
          ?.setValue(base64String);
      };
      // This line is missing in your original code
      reader.readAsArrayBuffer(e.target.files[0]);
      // } else {
      //   this.toastr.error(
      //     "PDF size shouldn't be more than 5 MB!",
      //     'Access Med Lab'
      //   );
      // }
    } else {
      this.toastr.error('Only CSV files are allowed!', 'Access Med Lab');
    }
  }
}
