import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { TestSearchesListResponse } from 'src/app/models/TestSearches.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { ConfirmationModalComponent } from 'src/app/utils/confirmationmodel.component';

@Component({
  selector: 'app-test-searches',
  templateUrl: './test-searches.component.html',
  styleUrl: './test-searches.component.scss',
})
export class TestSearchesComponent {
  permission: any;
  testSearchList: any;
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
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {}
  ngOnInit() {
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));

    this.permission = permissions.find((item: any) => {
      return item.Type == 71;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getTestSearchesList();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  onReset() {
    this.requestPayload.CustomSearch = null;
    this.testSearchList = {
      data: [],
      total: 0,
    };
    this.getTestSearchesList();
  }
  public dataStateChange(state: DataStateChangeEvent): void {
    // call Filter and Soring Function
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);

    this.state = state;
    this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
    this.requestPayload.Filters = RequestData.Filters;
    this.requestPayload.Page = (state.skip + state.take) / state.take;
    this.getTestSearchesList();
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
  getTestSearchesList() {
    this.api
      .callApi(
        this.constant.TestGetAllList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: TestSearchesListResponse) => {
          this.testSearchList = {
            data: res.TestsList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  //order status list
  changeStatus(id: any, status: any) {
    // console.log({ id, status });
    this.api
      .callApi(
        this.constant.TestChangeStatus,
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

  add() {
    this.router.navigate(['/lab/web-master/test-searches/add']);
  }
  edit(id: any) {
    this.router.navigate([`/lab/web-master/test-searches/edit/${this.common.EncryptID(id.toString())}`]);
  }
  deleteModel(id: any) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.title = '';
    modalRef.componentInstance.message = 'Are you sure you want to Delete?';

    modalRef.result.then(
      (result: any) => {
        if (result === 'Yes') {
          this.deleteTestSearch(id);
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  deleteTestSearch(id: any) {
    this.api
      .callApi(
        this.constant.Test +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt([id])),
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
            this.getTestSearchesList();
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
