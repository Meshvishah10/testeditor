import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-create-sales',
  templateUrl: './create-sales.component.html',
  styleUrls: ['./create-sales.component.scss'],
})
export class CreateSalesComponent {
  // Declare common variables
  salesForm: any = FormGroup;
  isSubmitted: any = false;
  permission: any;

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
    this.permission = permissions.find((item: any) => {
      return item.Type == 57;
    });
    // console.log(permissions);
    if (this.permission.MenuPermission.Add == true) {
         // Create Profile Form and Declare Controllers of Form
    this.salesForm = this.formBuilder.group({
      NumberOfCalls: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
      NumberOfVisits: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
      NumberOfNewlyAquiredAccounts: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
      NumberOfSpecimensYesterday: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
      NumberOfSpecimensToday: new FormControl({ value: '', disabled: false }),
      PersonalGoals: new FormControl({ value: '', disabled: false }),
      Suggestions: new FormControl({ value: '', disabled: false }),
    });
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.salesForm.invalid) {
      return;
    } else {
      let body = {
        NumberOfCalls: this.salesForm.value.NumberOfCalls,
        NumberOfVisits: this.salesForm.value.NumberOfVisits,
        NumberOfNewlyAquiredAccounts:this.salesForm.value.NumberOfNewlyAquiredAccounts,
        NumberOfSpecimensYesterday:this.salesForm.value.NumberOfSpecimensYesterday,
        NumberOfSpecimensToday: this.salesForm.value.NumberOfSpecimensToday==''?'':this.salesForm.value.NumberOfSpecimensToday,
        PersonalGoals: this.salesForm.value.PersonalGoals,
        Suggestions: this.salesForm.value.Suggestions,
      };

      // console.log("Getting body", body);
      this.api
        .callApi(this.constant.commmonSales, body, 'POST', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.isSubmitted = false;
            this.toastr.success(
              resp.Message,
              'Access Med Lab'
            );
            this.CancelbtnClick();
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
  // Check form Validation
  get f() {
    return this.salesForm.controls;
  }
  // Cancel button click event
  CancelbtnClick() {
    this.salesForm.reset();
    this.router.navigate(['/lab/salescentral']);
  }
}
