import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import {
  ProductCategoryListResponse,
  productCategory,
} from 'src/app/models/ProductCategory.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-manage-product-categories',
  templateUrl: './manage-product-categories.component.html',
  styleUrls: ['./manage-product-categories.component.scss'],
})
export class ManageProductCategoriesComponent {
  // Declare common variables
  productCategoryList: any;
  productCategoryForm: any = FormGroup;
  isSubmitted: any = false;
  uniqueId: any = ''; // Used for editing a specific productCategory
  deleteids: any = [];
  requestPayload: any = {
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
  modelDelete: any = 'none'; // Display control for delete confirmation modal
  permission: any;

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
    this.isSubmitted = false;
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 41;
    });

    // Load product category list using this function
    if (this.permission.MenuPermission.View == true) {
      this.getProductCategoryList();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }

    if (this.permission.MenuPermission.Add == true) {
      // Create FormControls for add/edit product category
      this.productCategoryForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        description: [''],
      });
    }
  }

  getProductCategoryList() {
    this.api
      .callApi(
        this.constant.productCategoryList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.productCategoryList = {
            data: res.ProductCategoryList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Handle data state change (pagination, sorting, filtering)
  public dataStateChange(state: DataStateChangeEvent): void {
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);

    this.state = state;
    this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
    this.requestPayload.Filters = RequestData.Filters;
    this.requestPayload.Page = (state.skip + state.take) / state.take;
    this.getProductCategoryList();
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
  // Edit product category data by Id
  editModel(id: any) {
    this.uniqueId = id;
    this.productCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      sortOrder: ['', [Validators.required]],
    });
    this.api
      .callApi(
        this.constant.productCategory +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: productCategory) => {
          var resp = res;
          this.productCategoryForm.reset({
            name: resp.Name,
            description: resp.Description,
            sortOrder: resp.Sortorder,
          });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Set product category id for deletion
  deleteModel(id: any) {
    this.deleteids.push(id);
  }

  isAllSelected(): boolean {
    return this.productCategoryList?.data.length !== 0
      ? this.productCategoryList?.data.every((item: any) => item?.isSelected)
      : false;
  }

  onSelectAllChange(event: any): void {
    const checked = event.target.checked;
    this.productCategoryList.data.forEach((item: any) => {
      item.isSelected = checked;
      if (checked) {
        this.deleteids.push(item.Id);
      }
    });
    if (!checked) {
      this.deleteids = [];
    }
  }

  onCheckboxChange(dataItem: any): void {
    if (dataItem.isSelected) {
      this.deleteids.push(dataItem.Id);
    } else {
      this.deleteids.splice(
        this.deleteids.findIndex((i: any) => dataItem.Id.includes(i)),
        1
      );
    }
  }

  // Delete product category
  deleteProductCategory() {
    this.api
      .callApi(
        this.constant.productCategory +
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
            this.toastr.success(resp.Message, 'Access Med Lab');
            if (this.productCategoryList.data.length == this.deleteids.length) {
              this.state.skip = 0;
              this.state.take = 50;
              this.requestPayload.Page =
                (this.state.skip + this.state.take) / this.state.take;
            }
            this.modelDeleteClose();
            this.getProductCategoryList();
          }
        },
        (err: any) => {
          this.modelDeleteClose();
          this.disable = false;
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Close delete modal
  modelDeleteClose() {
    this.deleteids = [];
    this.productCategoryList.data.map((e: any) => (e.isSelected = false));
    (function ($) {
      $('#deleteCategory').modal('hide');
    })(jQuery);
  }

  // Get form controls for validation
  get f() {
    return this.productCategoryForm.controls;
  }

  // Save product category data
  onSubmit() {
    this.isSubmitted = true;

    if (this.productCategoryForm.invalid) {
      return;
    } else {
      if (this.permission.MenuPermission.Add == true) {
        let body = {
          Name: this.productCategoryForm.value.name,
          Description: this.productCategoryForm.value.description,
        };
        this.disable = true;
        this.api
          .callApi(this.constant.productCategory, body, 'POST', true, true)
          .subscribe(
            (res: any) => {
              var resp = res;
              this.disable = false;
              if (resp.Status == 1) {
                this.toastr.success(resp.Message, 'Access Med Lab');
                this.uniqueId = '';
                this.isSubmitted = false;
                this.closeModel();
                this.productCategoryForm.reset();
                this.getProductCategoryList();
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

  // Update product category data
  onUpdate() {
    this.isSubmitted = true;
    if (this.productCategoryForm.invalid) {
      return;
    } else {
      let body = {
        Id: this.uniqueId,
        Name: this.productCategoryForm.value.name,
        Description: this.productCategoryForm.value.description,
        SortOrder: this.productCategoryForm.value.sortOrder,
      };
      this.disable = true;
      this.api
        .callApi(this.constant.productCategory, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.disable = false;
            if (resp.Status == 1) {
              this.toastr.success(resp.Message, 'Access Med Lab');
              this.uniqueId = '';
              this.isSubmitted = false;
              this.productCategoryForm.reset();
              this.closeModel();
              this.getProductCategoryList();
            }
          },
          (err: any) => {
            this.disable = false;
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  // Change product category status (activate/deactivate)
  changeStatus(id: any, status: any) {
    let body = {
      Id: id,
    };
    this.api
      .callApi(
        this.constant.changeProductCategoryStatus,
        body,
        'PUT',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          this.disable = false;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.getProductCategoryList();
          }
        },
        (err: any) => {
          this.disable = false;
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Close add/edit model
  CancelbtnClick() {
    this.uniqueId = '';
    this.isSubmitted = false;
    this.productCategoryForm.reset();
  }

  closeModel() {
    this.productCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
    });
    (function ($) {
      $('#addCategory').modal('hide');
    })(jQuery);
  }

  onRowReorder(event: any): void {
    const draggedRowIndex = event.draggedRows[0].rowIndex;
    const dropTargetRowIndex = event.dropTargetRow.rowIndex;
    const movedItem = this.productCategoryList.data.splice(draggedRowIndex,1)[0];
    this.productCategoryList.data.splice(dropTargetRowIndex, 0, movedItem);
    // console.log({
    //   Id: event.draggedRows[0].dataItem.Id,
    //   prevIndex: draggedRowIndex,
    //   currentIndex: dropTargetRowIndex,
    // });
    // call api and on success callback list api
    this.dndSortOrderUpdate({
      CategoryId: event.draggedRows[0].dataItem.Id,
      NewSortOrder: dropTargetRowIndex + 1,
    });
  }

  dndSortOrderUpdate(body: any) {
    this.api
      .callApi(
        this.constant.ProductCategoryUpdateSortOrder,
        body,
        'PUT',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          this.disable = false;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.getProductCategoryList();
          }
        },
        (err: any) => {
          this.disable = false;
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
