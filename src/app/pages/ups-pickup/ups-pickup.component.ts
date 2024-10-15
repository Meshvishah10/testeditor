import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { PickupList } from 'src/app/models/UPSPickUp.model';
import { CommentRes } from 'src/app/models/comment.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { UpsPickupLogsComponent } from './ups-pickup-logs/ups-pickup-logs.component';
declare var jQuery: any;
@Component({
  selector: 'app-ups-pickup',
  templateUrl: './ups-pickup.component.html',
  styleUrl: './ups-pickup.component.scss',
})
export class UpsPickupComponent {
  pickUpList: any;
  upsPickupStageList: any;
  commentData!: CommentRes;
  selectedId: any;
  selectedStatus: any;
  startDate: any;
  endDate: any;
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    ConfirmationCode: null,
    Stage: null,
    Accountno: null,
    StartDate: null,
    EndDate: null,
    UpdatedBy: null,
  };
  pickUpDetails = {};
  permission: any = '';
  updateForm: any = FormGroup;
  commentForm: any = FormGroup;
  isSubmitted: any = false;
  comment = '';
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
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 21;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getUpsPickupList();
      this.getMasterDetails();
    }
    this.updateForm = this.formBuilder.group({
      pickupDate: ['', [Validators.required]],
      ePickupTime: ['', [Validators.required]],
      lPickupTime: [''],
      comment: [''],
    });
  }

  getMasterDetails() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.upsPickupStageList = res.UpsPickUpStageList;
        },
        (err: any) => {
          // console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  getUpsPickupList() {
    this.requestPayload.Stage =
      this.requestPayload.Stage === 'null' ? null : this.requestPayload.Stage;
    this.requestPayload.StartDate =
      this.startDate != null
        ? this.datePipe.transform(new Date(this.startDate), 'MM/dd/yyyy')
        : null;
    this.requestPayload.EndDate =
      this.endDate != null
        ? this.datePipe.transform(new Date(this.endDate), 'MM/dd/yyyy')
        : null;
     
    this.api
      .callApi(
        this.constant.upsPickupList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log(res)
          this.pickUpList = {
            data: res.PickupList as PickupList,
            total: res.Total,
          };
        },
        (err: any) => {
          // console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Handle data state change (pagination, sorting, filtering)
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
        if (filter.Field === 'DateSubmitted' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        if (filter.Field === 'PickupDate' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        if (filter.Field === 'ModifiedDate' && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
        return filter;
      });
    }
    this.getUpsPickupList();
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
  statusChangeModal(id: string, stage: string) {
    this.selectedId = id;
    this.selectedStatus = stage;
    this.modelStatusOpen();
  }

  modelStatusOpen() {
    (function ($) {
      $('#updateStatus').modal('show');
    })(jQuery);
  }

  // Get form controls for validation
  get f() {
    return this.updateForm.controls;
  }

  // Get form controls for validation
  get cf() {
    return this.commentForm.controls;
  }

  //close update status modal
  modelUpdateStatusClose() {
    this.selectedId = '';
    this.selectedStatus = '';
    (function ($) {
      $('#updateStatus').modal('hide');
    })(jQuery);
    this.isSubmitted = false;
    this.getUpsPickupList();
  }

  modelUpdateOpen(id: string) {
    (function ($) {
      $('#update').modal('show');
    })(jQuery);
    this.getPickupDetails(id);
  }

  modelUpdateClose() {
    (function ($) {
      $('#update').modal('hide');
    })(jQuery);
    this.pickUpDetails = {};
    this.selectedId = null;
    this.isSubmitted = false;
    this.getUpsPickupList();
  }

  modelCommentOpen(id: string) {
    (function ($) {
      $('#comments').modal('show');
    })(jQuery);
    this.getComments(id);
  }

  modelCommentClose() {
    (function ($) {
      $('#comments').modal('hide');
    })(jQuery);
    this.selectedId = null;
    // this.getUpsPickupList();
  }

  statusChange() {
    this.OrderStatusChange();
    this.modelUpdateStatusClose();
    this.getUpsPickupList();
  }

  //order status list
  OrderStatusChange() {
    let body = {
      Id: this.selectedId,
      Stage: this.selectedStatus,
    };
    this.api
      .callApi(this.constant.upsPickupStatusChange, body, 'PUT', true, true)
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
    this.getUpsPickupList();
  }

  //reset method
  OnReset() {
    this.requestPayload.ConfirmationCode = null;
    this.requestPayload.Accountno = null;
    this.requestPayload.StartDate = null;
    this.requestPayload.EndDate = null;
    this.requestPayload.Stage = null;
    this.requestPayload.UpdatedBy = null;
    this.startDate = null;
    this.endDate = null;
    this.pickUpList = {
      data: [],
      total: 0,
    };
    this.getUpsPickupList();
  }

  submit() {
    this.isSubmitted = true;
    if (this.updateForm.invalid) {
      return;
    } else {
      const body = {
        Id: this.selectedId,
        PickupDate: this.datePipe.transform(
          new Date(this.updateForm.value.pickupDate),
          'MM/dd/yyyy'
        ),
        EarliestTime: this.datePipe.transform(
          new Date(this.updateForm.value.ePickupTime),
          'HH:mm'
        ),
        LatestTime: this.datePipe.transform(
          new Date(this.calculateLatestTime(this.updateForm.value.ePickupTime)),
          'HH:mm'
        ),
        SpecialInstruction: this.updateForm.value.comment,
      };
      this.api
        .callApi(this.constant.upsPickup, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            // console.log(res);
            this.isSubmitted = false;
            this.updateForm.reset();
            this.modelUpdateClose();
            this.toastr.success(res.Message, 'Access Med Lab');
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  getPickupDetails(id: string) {
    this.selectedId = id;
    this.api
      .callApi(
        this.constant.upsPickup +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.pickUpDetails = res;
          this.updateForm.reset({
            pickupDate: new Date(res.PickupDate),
            ePickupTime: new Date(
              res.PickupDate.split('T')[0] + 'T' + res.EPickupTime
            ),
            lPickupTime: new Date(
              res.PickupDate.split('T')[0] + 'T' + res.LPickupTime
            ),
            comment: res.Comments,
          });
        },
        (err: any) => {
          // console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  public disabledDates = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  getComments(id: string) {
    this.selectedId = id;
    this.api
      .callApi(
        this.constant.GetPickupCommentList +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: CommentRes) => {
          this.commentData = res;
        },
        (err: any) => {
          // console.log(err);
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  submitComment() {
    if (this.comment == '') {
      return;
    } else {
      const body = {
        UpspickupId: this.selectedId,
        Comment: this.comment,
      };

      this.api
        .callApi(this.constant.AddPickupComment, body, 'POST', true, true)
        .subscribe(
          (res: any) => {
            this.comment = '';
            this.getComments(this.selectedId);
            this.toastr.success(res.Message, 'Access Med Lab');
          },
          (err: any) => {
            // console.log(err);
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  calculateLatestTime(earliestTime: Date): Date {
    const latestTime = new Date(earliestTime);
    latestTime.setHours(latestTime.getHours() + 2);
    return latestTime;
  }

  upsPickUpLogs(id: any){
    const modalRef = this.modalService.open(UpsPickupLogsComponent, { centered: true ,  size: 'xl' , windowClass: 'custom-modal-class'  });
    modalRef.componentInstance.UpsId = id;
    modalRef.result.then(
      (result:any) => {
        
      },
      () => {
        // Modal dismissed
       
      }
    );
  }
}
