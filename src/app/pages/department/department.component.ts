import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { process, State } from '@progress/kendo-data-query';
import { DataStateChangeEvent, MultipleSortSettings } from '@progress/kendo-angular-grid';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { DepartmentsData, SpecificDepartment } from 'src/app/models/DepartmentManagement.model';
declare var jQuery: any;

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
})
export class DepartmentComponent {
  // Declare common variables
  departmentlist: any;
  departmentfrm: any = FormGroup;
  isSubmitted: any = false;
  uniqueid: any = ''; // Used for editing a specific department
  deleteids:any=[];
  // modelDisplay: any = 'none'; // Display control for add/edit department modal
  requestpayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
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
  disable: boolean = false; // Disable button while API call is ongoing
  permission: any;
  statusDepartmentId = '';
  deleteMessage:any='Are you sure want to delete?';
  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    private http: HttpClient,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    public FilterAndSortingService: FilterAndSortingService
  ) {}

  ngOnInit() {
    this.isSubmitted = false;

    // Get permissions from local storage
   
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 47;
    });
  
    // Load department list using this function
    if (this.permission.MenuPermission.View == true) {
      this.getDeparmentList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }

    // Create FormControls for add/edit department
    this.departmentfrm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
    });
  }

  isAllSelected(): boolean {
    return this.departmentlist?.data.length !== 0 ? this.departmentlist?.data.every((item:any) => item?.isSelected) : false;
  }

  onSelectAllChange(event: any): void {
    const checked = event.target.checked;
    this.departmentlist.data.forEach((item:any) => {
        item.isSelected = checked;
        if(checked){
        this.deleteids.push(item.Id);
        }
    });
    if(!checked){
      this.deleteids=[];
    }
  }

  onCheckboxChange(dataItem: any): void {
    if(dataItem.isSelected){
      this.deleteids.push(dataItem.Id)
    }else{
      this.deleteids.splice(
        this.deleteids.findIndex((i:any) => dataItem.Id.includes(i)),
        1
        );
      }
  }

  // Get department list
  getDeparmentList() {
    this.api
      .callApi(
        this.constant.getAllDepartment +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: DepartmentsData) => {
          this.departmentlist = {
            data: res.NCDepartmentsList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Redirect to Permission Page
  redirectPermission(id: any) {
    this.router.navigate(['/lab/department/permission/' + this.common.EncryptID(id)]);
  }

  // Handle data state change (pagination, sorting, filtering)
  public dataStateChange(state: DataStateChangeEvent): void {
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);

    this.state = state;
    this.requestpayload.PageSize = state.take;
    this.requestpayload.Sorts = RequestData.Sorts;
    this.requestpayload.Filters = RequestData.Filters;
    this.requestpayload.Page = (state.skip + state.take) / state.take;
    this.getDeparmentList();
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
  // Edit department data by Id
  editModel(id: any) {
    this.uniqueid = id;
    this.api
      .callApi(
        this.constant.commonDepartment +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: SpecificDepartment) => {
          var resp = res;
          this.departmentfrm.reset({
            name: resp.Name,
            description: resp.Description,
          });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Set department id for deletion
  deleteModel(id: any,count:any) {
    if(count > 0){
      this.deleteMessage='Department is associated with one or more users, if department is delete then associated users will not able to login in system, Are you sure you want to delete?';
    }else{
      this.deleteMessage='Are you sure want to delete?';
    }
    this.deleteids.push(id);
  }
  

  // Delete department
  deleteDepartment() {
    this.api
      .callApi(
        this.constant.commonDepartment +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.deleteids)),
        [],
        'DELETE',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(
              resp.Message,
              'Access Med Lab'
            );
            if(this.departmentlist.data.length == this.deleteids.length){
              this.state.skip=0;
              this.state.take=50;
              this.requestpayload.Page = (this.state.skip + this.state.take ) / this.state.take
            }
            this.modelDeleteClose();
            this.getDeparmentList();
          }
        },
        (err: any) => {
          this.disable = false;
          this.modelDeleteClose();
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Close delete modal
  modelDeleteClose() {
    this.deleteids = [];
    this.deleteMessage='Are you sure want to delete?';
    this.departmentlist.data.map((e: any) => (e.isSelected = false));
    (function ($) {
      $("#deleteDepartment").modal("hide");
    })(jQuery);
  }

  // Get form controls for validation
  get f() {
    return this.departmentfrm.controls;
  }

  // Save department data
  onSubmit() {
    this.isSubmitted = true;
    if (this.departmentfrm.invalid) {
      return;
    } else {
      if (this.permission.MenuPermission.Add == true) {
        let body = {
          Name: this.departmentfrm.value.name,
          Description: this.departmentfrm.value.description,
        };
        this.disable = true;
        this.api
          .callApi(this.constant.commonDepartment, body, 'POST', true, true)
          .subscribe(
            (res: any) => {
              var resp = res;
              this.disable = false;
              if (resp.Status == 1) {
                this.toastr.success(
                  resp.Message,
                  'Access Med Lab'
                );
                this.uniqueid = '';
                this.isSubmitted = false;
                this.closeModel();
                this.departmentfrm.reset();
                // console.log("res", res);
                this.redirectPermission(res.Id)
                // this.getDeparmentList();
              }
            },
            (err: any) => {
              this.disable = false;
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
    }
  }

  // Update department data
  onUpdate() {
    this.isSubmitted = true;
    if (this.departmentfrm.invalid) {
      return;
    } else {
      let body = {
        Id: this.uniqueid,
        Name: this.departmentfrm.value.name,
        Description: this.departmentfrm.value.description,
      };
      this.disable = true;
      this.api
        .callApi(this.constant.commonDepartment, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.disable = false;
            if (resp.Status == 1) {
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
              this.uniqueid = '';
              this.isSubmitted = false;
              this.closeModel();
              this.departmentfrm.reset();
              this.getDeparmentList();
            }
          },
          (err: any) => {
            this.disable = false;
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  // Change department status (activate/deactivate)
  changeStatus(id:any, status: boolean, userCount: number) {
    this.statusDepartmentId = id;
    if(status && userCount > 0){
      this.modelStatusOpen();
      return;
    } else {
      this.changeStatusApi()
    }
  }
  
  changeStatusApi(){
    let body = {
      Id: this.statusDepartmentId,
    };
    this.api
      .callApi(this.constant.changeDepartmentStatus, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.disable = false;
          if (resp.Status == 1) {
            this.toastr.success(
              resp.Message,
              'Access Med Lab'
            );
          }
          this.getDeparmentList();
          this.modelStatusClose();
          this.statusDepartmentId = ''
        },
        (err: any) => {
          this.disable = false;
          this.getDeparmentList();
          this.modelStatusClose();
          this.statusDepartmentId = ''
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Close add/edit model
  CancelbtnClick() {
    this.uniqueid = '';
    this.isSubmitted = false;
    this.departmentfrm.reset();
  }

  closeModel(){
    (function ($) {
      $("#AddDepartment").modal("hide");
    })(jQuery);
  }

  modelStatusOpen(){
    (function ($) {
      $("#changeStatus").modal("show");
    })(jQuery);
  }

  modelStatusClose(){
    (function ($) {
      $("#changeStatus").modal("hide");
    })(jQuery);
    this.getDeparmentList();
  }
}
