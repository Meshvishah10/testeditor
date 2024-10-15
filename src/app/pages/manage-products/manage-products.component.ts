import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import {
  groupBy,
  GroupDescriptor,
  GroupResult,
  State,
} from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { Product, ProductListResponse } from 'src/app/models/Product.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.scss'],
})
export class ManageProductsComponent {
  // Declare common variables
  productList: any;
  uniqueId: any = ''; // Used for editing a specific product
  deleteids: any = [];
  requestPayload: any = {
    // Page: 1,
    // PageSize: 10,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
  };
  public state: State = {
    // skip: 0,
    // take: 10,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  };
  disable: boolean = false; // Disable button while API call is ongoing
  permission: any;
  groups: GroupDescriptor[] = [{ field: 'Category' }];

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
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 40;
    });

    // Load product  list using this function
    if (this.permission.MenuPermission.View == true) {
      this.getProductList();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getProductList() {
    this.api
      .callApi(
        this.constant.productList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: ProductListResponse) => {
          this.productList = {
            data: res.ProductList,
            total: res.Total,
          };
          this.productList.data = groupBy(this.productList.data, this.groups);
          this.productList.data.map((e:any,i:any)=> e.CategorySortorder = res.ProductList.find(ele=>ele.Category===e.value)?.CategorySortorder);
          this.productList.data.sort((a:any, b:any) => a.CategorySortorder - b.CategorySortorder);
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
    // this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
    this.requestPayload.Filters = RequestData.Filters;
    // this.requestPayload.Page = (state.skip + state.take) / state.take;
    this.getProductList();
  }
  search() {
    const state: DataStateChangeEvent = {
      skip: 0,
      take: this.state.take !== undefined ? this.state.take : 10,
      sort: this.state.sort,
      filter: this.state.filter,
    };
    this.dataStateChange(state);
  }
  // Open add/edit product  modal
  addProduct() {
    // console.log('add')
    if (this.permission.MenuPermission.Add == true) {
      this.router.navigate(['/lab/products/add-product']);
    }
  }
  editModel(id: any) {
    if (this.permission.MenuPermission.Edit == true) {
      this.router.navigate([
        `/lab/products/edit-product/` + this.common.EncryptID(id),
      ]);
    }
  }
  // Set product  id for deletion
  deleteModel(id: any) {
    this.deleteids.push(id);
  }

  // Delete product
  deleteProduct() {
    this.api
      .callApi(
        this.constant.product +
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
            // if(this.productList.data.length == this.deleteids.length){
            //   this.state.skip=0;
            //   this.state.take=10;
            //   this.requestPayload.Page = (this.state.skip + this.state.take ) / this.state.take
            // }
            this.modelDeleteClose();
            this.getProductList();
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
    this.productList.data.map((group: any) => 
      group.items.map((item: any) => item.isSelected = false)
  );
    (function ($) {
      $('#deleteProduct').modal('hide');
    })(jQuery);
  }

  isAllSelected(): boolean {
    if (!this.productList?.data.length) {
        return false;
    }

    return this.productList.data.every((group: any) => 
        group.items.every((item: any) => item?.isSelected)
    );
}

onSelectAllChange(event: any): void {
  const checked = event.target.checked;
  
  this.productList.data.forEach((group: any) => {
      group.items.forEach((item: any) => {
          item.isSelected = checked;
          if (checked) {
              this.deleteids.push(item.Id);
          }
      });
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

  // Change product  status (activate/deactivate)
  changeStatus(id: any, status: any) {
    let body = {
      Id: id,
    };
    this.api
      .callApi(this.constant.changeProductStatus, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.disable = false;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.getProductList();
          }
        },
        (err: any) => {
          this.disable = false;
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  addCategory() {
    this.router.navigate(['/lab/products/product-category']);
    // setTimeout(() => {
    //   (function ($) {
    //     $("#addCategory").modal("show");
    //   })(jQuery);
    // }, 200);
  }

  closeModel() {
    (function ($) {
      $('#addCategory').modal('hide');
    })(jQuery);
  }

  dndSortOrderUpdate(body: any) {
    this.api
      .callApi(this.constant.ProductUpdateSortOrder, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.disable = false;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.getProductList();
          }
        },
        (err: any) => {
          this.disable = false;
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  onRowReorder(event: any): void {
    const draggedItem = this.findDataItemByRowIndex(event.draggedRows[0].rowIndex);
    const dropTargetItem = this.findDataItemByRowIndex(event.dropTargetRow.rowIndex);
    // console.log("Getting category", draggedItem , dropTargetItem);
    // Check if the dragged item and drop target item belong to the same category
    if (draggedItem.CategoryId === dropTargetItem.CategoryId) {
        const { groupIndex: draggedGroupIndex, itemIndex: draggedItemIndex } = this.findGroupAndItemIndex(draggedItem);
        const { groupIndex: dropGroupIndex, itemIndex: dropItemIndex } = this.findGroupAndItemIndex(dropTargetItem);

        this.dndSortOrderUpdate({
            ProductId: draggedItem.Id,
            NewSortOrder: dropItemIndex + 1,
        });
    } else {
        // Notify the user that reordering across categories is not allowed
        this.toastr.error("You cannot reorder items across different categories.",'Access Med Lab');
    }
}

  findDataItemByRowIndex(rowIndex: number): any {
    let currentIndex = 0;
    for (const group of this.productList.data) {
      for (const item of group.items) {
        if (currentIndex === rowIndex) {
          return item;
        }
        currentIndex++;
      }
    }
    return undefined;
  }

  findGroupAndItemIndex(item: any): { groupIndex: number; itemIndex: number } {
    for (
      let groupIndex = 0;
      groupIndex < this.productList.data.length;
      groupIndex++
    ) {
      const group = this.productList.data[groupIndex];
      const itemIndex = group.items.findIndex((i: any) => i.Id === item.Id);
      if (itemIndex !== -1) {
        return { groupIndex, itemIndex };
      }
    }
    return { groupIndex: -1, itemIndex: -1 };
  }
}
