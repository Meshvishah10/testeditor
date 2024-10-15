import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import {
  TestStabilitiesListResponse,
  TestStability,
} from 'src/app/models/TestSearches.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { ConfirmationModalComponent } from 'src/app/utils/confirmationmodel.component';

@Component({
  selector: 'app-stability-search',
  templateUrl: './stability-search.component.html',
  styleUrl: './stability-search.component.scss',
})
export class StabilitySearchComponent {
  permission: any;
  testSearchList: TestStability | any;
  uniqueId: any;
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: null,
    TestId: null,
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
    this.uniqueId =
      this.activatedRoute.snapshot.params['id'] !== undefined
        ? this.common.DecryptID(this.activatedRoute.snapshot.params['id'])
        : '';
    if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
      this.toastr.error('Invalid Request.');
    }
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));

    this.permission = permissions.find((item: any) => {
      return item.Type == 71;
    });
    if (this.permission.MenuPermission.View == true) {
      this.requestPayload.TestId = this.uniqueId;
      this.getTestStabilitySearchesList();
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
    this.getTestStabilitySearchesList();
  }
  public dataStateChange(state: DataStateChangeEvent): void {
    // call Filter and Soring Function
    var RequestData = this.FilterAndSortingService.prepareRequestPayload(state);

    this.state = state;
    this.requestPayload.PageSize = state.take;
    this.requestPayload.Sorts = RequestData.Sorts;
    this.requestPayload.Filters = RequestData.Filters;
    this.requestPayload.Page = (state.skip + state.take) / state.take;
    this.getTestStabilitySearchesList();
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
  getTestStabilitySearchesList() {
    this.api
      .callApi(
        this.constant.TestGetTestStabilitiesList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: TestStabilitiesListResponse) => {
          this.testSearchList = {
            data: res.TestStabilitiesList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  add() {
    this.router.navigate([
      `/lab/web-master/test-searches/stability/${this.common.EncryptID(
        this.uniqueId.toString()
      )}/add`,
    ]);
  }
  edit(id: any) {
    this.router.navigate([
      `/lab/web-master/test-searches/stability/${this.common.EncryptID(
        this.uniqueId.toString()
      )}/edit/${this.common.EncryptID(id.toString())}`,
    ]);
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
          this.deleteTestStabilitySearch(id);
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  deleteTestStabilitySearch(id: any) {
    this.api
      .callApi(
        this.constant.TestDeleteTestStabilityDetails +
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
            this.getTestStabilitySearchesList();
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
