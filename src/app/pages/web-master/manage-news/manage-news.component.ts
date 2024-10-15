import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { NewsResponse } from 'src/app/models/webMasterNews.model';

import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-manage-news',
  templateUrl: './manage-news.component.html',
  styleUrl: './manage-news.component.scss'
})
export class ManageNewsComponent {
  permission: any;
  newsList: any;
  isSubmitted:boolean = false;
  Amount: string = 'Amount';  // Define the value for Amount
  Percentage: string = 'Percentage';  // Define the value for Percentage
  uniqueid:string='';
  status:string='';
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
  newsForm: any;
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
      return item.Type == 73;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getNewsList();
      this.getStatusList()
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
    this.newsForm = this.formBuilder.group({ 
      Title: ['', Validators.required],
      PublishDate : ['' , Validators.required],
      Link: ['', Validators.required],
    });
  }
   OnReset() {
    this.requestPayload.Search = null;
    this.newsList = {
      data: [],
      total: 0,
    };
    this.getNewsList();
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
        if (filter.Field === "PublishDate" && filter.Value instanceof Date) {
          filter.Value =
            this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
          return filter;
      });
  }
  this.getNewsList();
  }
  modelAddEditOpen(){
    (function ($) {
      $("#newsForm").modal("show");
    })(jQuery);
  }
  modelAddEditClose(){
    (function ($) {
      $("#newsForm").modal("hide");
    })(jQuery);
    this.uniqueid=''
    this.isSubmitted=false;
    this.newsForm.reset()
    this.getNewsList();
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
    this.newsList = {
      data: [],
      total: 0,
    };
    this.getNewsList();
  }
  getNewsList() {
    this.api
      .callApi(
        this.constant.NewsList  +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: NewsResponse) => {
          this.newsList = {
            data: res.NewsList,
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
          this.statusList = res?.StatusFilterList;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  delete() {
    this.api
      .callApi(
        this.constant.CommonNews +
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
            this.getNewsList();
          }
        },
        (err: any) => {
        
          this.modelDeleteClose();
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  EditNews(id:string){
    this.uniqueid = id;
    this.api
    .callApi(
      this.constant.CommonNews +
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
    
        this.newsForm.reset({
          Title:resp.Title,
          Link: resp?.Link,
          PublishDate: new Date(resp?.PublishDate),
        });
        this.status = resp?.Status
        this.modelAddEditOpen()
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
      
  }
  onSubmit(){
    this.isSubmitted = true;
    if (this.newsForm.invalid) {   
      return;
    }
    let body:any = {
      Title: this.newsForm.value.Title,
      Link: this.newsForm.value.Link,
      PublishDate: this.datePipe.transform(this.newsForm.get('PublishDate').value, 'MM/dd/yyyy'),
    };
    let method = 'POST';
    if (this.uniqueid != '') {
      method = 'PUT';
      body.Id = this.uniqueid;
      body.Status = this.status;
    }
      this.api
      .callApi(this.constant.CommonNews, body , method, true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.newsForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
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
        this.constant.NewsChangeStatus,
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
  get f() { return this.newsForm.controls; }

}
