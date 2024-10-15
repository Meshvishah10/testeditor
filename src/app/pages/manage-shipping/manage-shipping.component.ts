import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { State } from '@progress/kendo-data-query';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { Shipping, ShippingListData } from 'src/app/models/ManageShipping.model';

@Component({
  selector: 'app-manage-shipping',
  templateUrl: './manage-shipping.component.html',
  styleUrls: ['./manage-shipping.component.scss']
})
export class ManageShippingComponent {

  // Declare Common Variables
  Shippinglist: any;
  shippingfrm: any = FormGroup;
  isSubmitted: any = false;
  requestpayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: ''
  };
  public state: State = {
    skip: 0,
    take: 50,
    sort: [],
    // Initial filter descriptor
    filter: {
      logic: "and",
      filters: [],
    },
  };

  permission: any = '';
  uniqueid: any = '';
  modelDisplay: any = 'none';
  disable: boolean = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService
  ) {}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => { return item.Type == 39 });

    // Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.getShippingList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }

    // Create FormControls for add/edit department
    this.shippingfrm = this.formBuilder.group({
      name: ['', [Validators.required]],
      amount: ['', [Validators.required]],
    });
  }

  getShippingList() {
    this.api.callApi(
      this.constant.getAllShipping + '?inputRequest=' + encodeURIComponent(this.common.Encrypt(this.requestpayload)),
      [],
      "GET",
      true,
      true
    ).subscribe((res: ShippingListData) => {
      // console.log(res);
      this.Shippinglist = {
        data: res.ShippingsList,
        total: res.Total
      };
    }, (err: any) => {
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    });
  }

  getShippingById(id: Shipping) {
    this.uniqueid = id;
    this.api.callApi(
      this.constant.commonShipping + '?inputRequest=' + encodeURIComponent(this.common.Encrypt(id)),
      [],
      "GET",
      true,
      true
    ).subscribe((res: any) => {
      var resp = res;
      this.modelDisplay = 'block';
      this.shippingfrm.reset({
        name: resp.ShippingName,
        amount: resp.Amount.toFixed(2)
      });
    }, (err: any) => {
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    });
  }

  // Call Function when data state changes, user click on next page or order
  public dataStateChange(state: DataStateChangeEvent): void {
    // Call Filter and Sorting Function
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);

    this.state = state;
    this.requestpayload.PageSize = state.take;
    this.requestpayload.Sorts = RequestData.Sorts;
    this.requestpayload.Filters = RequestData.Filters;
    this.requestpayload.Page = (state.skip + state.take) / state.take;
    this.getShippingList();
  }

  limitLength(event: any) {
    const maxLength = 9; // Adjust the maximum length as needed
    const input = event.target.value;
  
    if (input.length > maxLength) {
      event.preventDefault();
      event.target.value = input.slice(0, maxLength);
    }
  }

  // Check form Validation
  get f() { return this.shippingfrm.controls; }

  onUpdate() {
    this.isSubmitted = true;
    if (this.shippingfrm.value.amount == '.00' || this.shippingfrm.value.amount == '.' || this.shippingfrm.value.amount == '') {
      this.shippingfrm.value.amount = '0.00';
    }
    if (this.shippingfrm.invalid) {
      return;
    } else {
      let body = {
        Type: this.uniqueid,
        Amount: this.shippingfrm.value.amount,
      };

      this.disable = true;

      this.api.callApi(
        this.constant.commonShipping,
        body,
        "PUT",
        true,
        true
      ).subscribe((res: any) => {
        var resp = res;
        this.disable = false;

        if (resp.Status == 1) {
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.CancelbtnClick();
          this.getShippingList();
        } else {

        }
      }, (err: any) => {
        this.disable = false;
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      });
    }
  }

  CancelbtnClick() {
    this.uniqueid = '';
    this.modelDisplay = 'none';
    this.isSubmitted = false;
    this.shippingfrm.reset();
  }
}
