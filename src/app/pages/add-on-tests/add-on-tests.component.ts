import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { AddOnStatusBody, AddOnTestResponse } from 'src/app/models/AddOnTest.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-add-on-tests',
  templateUrl: './add-on-tests.component.html',
  styleUrl: './add-on-tests.component.scss'
})
export class AddOnTestsComponent {
  addOnTestList:any;
  statusList:any;
  selectedId:string='';
  selectedStatus:string='';
  commentDetail:any
  comment:string=''
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
  
    CustomerName: null,
    FromDate: null,
    ToDate: null,
    AccountNo:null,
  };
  Fromdate:any;
  todate:any;
  public state: State = {
    skip: 0,
    take: 50,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  };
  permission: any = '';
  constructor( private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe){
  }
  ngOnInit() {
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));

    this.permission = permissions.find((item: any) => {
      return item.Type == 19;
    });
    
    if (this.permission.MenuPermission.View == true) {
      this.getStatusList()
      this.getAddOnTestList()     
    } else{
      this.router.navigate(['/lab/dashboard']);
  }
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
          if (filter.Field === 'Createddate' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
          if (filter.Field === 'Dob' && filter.Value instanceof Date) {
            filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
        }
          if (filter.Field === 'Status') {
            filter.Field = 'StatusText';
        }
          return filter;
      });}
    this.getAddOnTestList()
   
  }
  OnReset() {
    this.requestPayload.CustomerName ='';
    this.requestPayload.FromDate=null;
    this.requestPayload.ToDate=null;
    this.requestPayload.AccountNo=null;
    this.Fromdate=null;
    this.todate=null;

    this.addOnTestList = {
      data: [],
      total: 0,
    };
    this.getAddOnTestList()
  }
  getAddOnTestList(){
     
          this.requestPayload.FromDate = this.Fromdate ?this.datePipe.transform(new Date(this.Fromdate),'MM/dd/yyyy'):null;
          this.requestPayload.ToDate = this.todate ?this.datePipe.transform(new Date(this.todate),'MM/dd/yyyy'):null;
     
        this.api
          .callApi(
            this.constant.addOnTestList +
              '?inputRequest=' +
              encodeURIComponent(this.common.Encrypt(this.requestPayload)),
            [],
            'GET',
            true,
            true
          )
          .subscribe(
            (res: AddOnTestResponse) => {
             this.addOnTestList = {
              data: res?.NCAddOnTestsList,
              total: res?.Total,
            };
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      
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
    reDirectView(Id:any): void {
      this.router.navigate(['/lab/add-on-test/detail/', this.common.EncryptID(Id) ]);
    }
    //status list
    getStatusList() {
          this.api
            .callApi(this.constant.MasterDetails, [], 'GET', true, true)
            .subscribe(
              (res: any) => {
                this.statusList = res?.AddOnTestsStatus  
              },
              (err: any) => {
                this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
              }
      );
    }
    statusChangeModal(id:any,Status:any){
      this.selectedId=id,
      this.selectedStatus=Status
      this.modelStatusOpen()
    }
    modelStatusOpen(){
      (function ($) {
        $("#updateStatus").modal("show");
      })(jQuery);
    }
    modelUpdateStatusClose() {
      this.selectedId='',
      this.selectedStatus='',
      (function ($) {
        $("#updateStatus").modal("hide");
      })(jQuery);
      this.getAddOnTestList()
    }
    statusChange(){
      let body:AddOnStatusBody ={
        Id: this.selectedId,
        Stage:this.selectedStatus,
      }
      this.api
            .callApi(this.constant.addOnTestStatusChange,body, 'PUT', true, true)
            .subscribe(
              (res: any) => {
                  var resp = res;
                  if(resp.Status ==1){
                  this.modelUpdateStatusClose()
                  this.toastr.success(resp.Message,'Access Med Lab');
                  }
              },
              (err: any) => {
                this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
              }
            );
    }
    viewAddModel(id:any){
      this.selectedId = id
      this.getCommentList() 
     }
    getCommentList() {
      this.api
        .callApi(this.constant.addOnTestCommentList +
              '?inputRequest=' +
              encodeURIComponent(this.common.Encrypt(this.selectedId)), [], 'GET', true, true)
        .subscribe(
          (res: any) => {
          this.commentDetail=res
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
    modelViewClose() {
      this.selectedId='',  
       (function ($) {
         $("#viewAdd").modal("hide");
       })(jQuery);
    }
    onAddComment() {
      if (this.comment == '') {
        return;
      } else {
        let body = {
          AddOnTestId: this.selectedId,
          Comment: this.comment,
        };
        this.api
          .callApi(this.constant.addOnTestAddComment, body, 'POST', true, true)
          .subscribe(
            (res: any) => {
              var resp = res;
              this.toastr.success(resp.Message, 'Access Med Lab');
              this.comment = '';
              
              this.getCommentList()
            },
            (err: any) => {
              
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
    }
}
