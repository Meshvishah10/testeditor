import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-manage-coupon',
  templateUrl: './manage-coupon.component.html',
  styleUrl: './manage-coupon.component.scss'
})
export class ManageCouponComponent {
  permission: any;
  couponList: any;
  isSubmitted:boolean = false;
  Amount: string = 'Amount';  // Define the value for Amount
  Percentage: string = 'Percentage';  // Define the value for Percentage
  uniqueid:string=''
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: null,
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
  statusList: any;
  couponForm: any;
  ProductList: any;
  TypeList: any;
  deleteid: any = []
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
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 69;
    });
    
    if (this.permission.MenuPermission.View == true) {
      this.getCouponeList();
      this.getStatusList()
      this.getProductList()
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
 
    this.couponForm = this.formBuilder.group({ 
      Name: ['', Validators .required],
      Code: ['', Validators.required],
      Value: ['', [Validators.required]],
      ProductId: ['', [Validators.required]],   
      Type:['',[Validators.required]],
      Status:['']
      },{
        validator: this.valueValidator
      });
  }
  
  OnReset() {
    this.requestPayload.Search = null;
    this.couponList = {
      data: [],
      total: 0,
    };
    this.getCouponeList();
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
         
          if (filter.Field === 'TypeText') {
              filter.Field = 'Type';
          }
         
          return filter;
      });
  }
  if (RequestData.Sorts !== null && RequestData.Sorts.length > 0) {
    this.requestPayload.Sorts = RequestData.Sorts.map((Sorts: any) => {
       
        if (Sorts.Field === 'TypeText') {
          Sorts.Field = 'Type';
        }
       
        return Sorts;
    });
}
 
  this.getCouponeList();

  }
  
  valueValidator(formGroup: FormGroup) {
    const typeControl = formGroup?.get('Type');
    const valueControl = formGroup?.get('Value');
    const value = parseFloat(valueControl?.value);
    if (isNaN(value) || !(parseFloat(value.toFixed(2)) >= 0.01)) {      valueControl?.setErrors({ minValue: true });
    }else if (typeControl?.value === 2 && valueControl?.value > 100) {
      valueControl?.setErrors({ maxPercentage: true });
    }else {
      valueControl?.setErrors(null);
    }
  }
  modelAddEditOpen(){
    // this.couponForm.reset();
    this.isSubmitted = false;
    this.uniqueid='';
    (function ($) {
      $("#CouponForm").modal("show");
    })(jQuery);
  }
  limitLength(event: any) {
    const maxLength = 8; // Adjust the maximum length as needed
    const input = event.target.value;
  
    if (input.length > maxLength) {
      event.preventDefault();
      event.target.value = input.slice(0, maxLength);
    }
  }
  modelAddEditClose(){
    (function ($) {
      $("#CouponForm").modal("hide");
    })(jQuery);
    this.uniqueid=''
    this.isSubmitted=false;
    this.couponForm.reset()
    this.getCouponeList();
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
  search() {
    const state: DataStateChangeEvent = {
      skip: 0,
      take: this.state.take !== undefined ? this.state.take : 50,
      sort: this.state.sort,
      filter: this.state.filter,
    };
    this.dataStateChange(state);
  }
  onReset() {
    this.requestPayload.CustomSearch = null;
    this.couponList = {
      data: [],
      total: 0,
    };
    this.getCouponeList();
  }
  getCouponeList() {
    // console.log(this.requestPayload)
    this.api
      .callApi(
        this.constant.CouponeList  +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
     
          this.couponList = {
            data: res.CouponsList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {    
       
          this.statusList = res?.StatusFilterList
          this.TypeList=res?.AffProductCouponTypeList
          // this.pendingStatusList=res?.EmrCentralPendingStage
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
}
delete() {
  this.api
    .callApi(
      this.constant.CommonCoupon +
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
          this.getCouponeList();
        }
      },
      (err: any) => {
       
        this.modelDeleteClose();
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}

getProductList() {
  this.api
    .callApi(this.constant.commonProductList, [], 'GET', true, true)
    .subscribe(
      (res: any) => {    
     
        this.ProductList = res
        // this.pendingStatusList=res?.EmrCentralPendingStage
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}
reidrectView(id:string){
  this.uniqueid = id;
  this.api
  .callApi(
    this.constant.CommonCoupon +
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
      this.couponForm.reset({
        Name:resp.Name,
        Code: resp?.Code,
        Value: resp?.Value.toFixed(2),
        ProductId: resp?.ProductId,
        Type:resp?.Type,
        Status:resp?.Status
      });
      (function ($) {
        $("#CouponForm").modal("show");
      })(jQuery);
    },
    (err: any) => {
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    }
  );
    
}
onSubmit(){
  this.isSubmitted = true;
  if (this.couponForm.value.Value == '.00' || this.couponForm.value.Value == '.' || this.couponForm.value.Value == '') {
    this.couponForm.value.Value = '0.00';
  }
  if (this.couponForm.invalid) {   
    return;
  }
  
  let body:any = {
    Name: this.couponForm.value.Name,
    Code: this.couponForm.value.Code,
    Value: this.couponForm.value.Value,
    ProductId: this.couponForm.value.ProductId,
    Type:this.couponForm.value.Type,
    
  };

  let method = 'POST';
  if (this.uniqueid != '') {
    method = 'PUT';
    body.Id = this.uniqueid;
    body.Status=this.couponForm.value.Status;

  }

    this.api
    .callApi(this.constant.CommonCoupon, body , method, true, true)
    .subscribe(
      (res: any) => {
        var resp = res;
        this.isSubmitted = false;
        this.couponForm.reset();
        this.toastr.success(
          resp.Message,
          'Access Med Lab'
        );
        //this.router.navigate(['/lab/ticket-resolution/npi-request/view', this.common.EncryptID(resp?.Id) ]);
        this.modelAddEditClose()
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}
changeStatus(id: any, status: any) {

  this.api
    .callApi(
      this.constant.CouponChangeStatus,
      {
        Id: id,
      },
      'PUT',
      true,
      true
    )
    .subscribe(
      (res: any) => {
        var resp = res;
        if (resp.Status == 1) {
          this.toastr.success(resp.Message, 'Access Med Lab');
        }
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  // this.getTestSearchesList()
}
get f() { return this.couponForm.controls; }

}
