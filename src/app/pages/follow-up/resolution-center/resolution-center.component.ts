import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
  selector: 'app-resolution-center',
  templateUrl: './resolution-center.component.html',
  styleUrl: './resolution-center.component.scss'
})
export class ResolutionCenterComponent {
  followUpList: any;
  UserList: any;
  DepartmentList:any;
  StageList: any;
  StatusList:any;
  TicketTypeList: any;
  Severity:any;
  selectedId:any;
  comment:string=''
  commentList:any
  Type:any
  addCommentApiEndPoint:string=''
  getCommentApiEndPoint:string=''
  requestPayload: any = {
    Page: 1,
    PageSize: 50,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    UserId: '',
    TicketNumber: null,
    Stage: '',
    AccountNumber: null,
    AccessionNumber: null,
    PatientName: null,
    DepartmentId: ''
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
  permission: any = '';

  
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
      return item.Type == 31;
    });
   
    if (this.permission.MenuPermission.View == true) {
      this.getUserList();
      this.getFollowUpList();
      this.getCommonList();
    } else{
        this.router.navigate(['/lab/dashboard']);
    }
  }

  getFollowUpList() {
    
   
    this.api
      .callApi(
        this.constant.ResolutionCenter +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestPayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          //console.log(res)
          this.followUpList = {
            data: res.newAccessionFollowsList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  //get userlist
  getUserList() {
    this.api
      .callApi(this.constant.getNCUserlist, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.UserList = res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );

      this.api.callApi(
        this.constant.commonDepartmentlist,
        [],
        "GET",
        true,
        true
      ).subscribe((res:any)=>{
   
        this.DepartmentList= res;
      },(err:any)=>{
        this.DepartmentList=[];
        // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
  }
  getCommonList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
        
          this.StageList = res?.NewAccessionStageList
          this.Severity = res?.SeverityList
          this.TicketTypeList = res?.TicketsTypeList
          this.StatusList=res?.FollowUpGridStageList
        },
        (err: any) => {
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
          if (filter.Field === 'Createddate' && filter.Value instanceof Date) {
              filter.Value = this.datePipe.transform(filter.Value, 'MM/dd/yyyy') || '';
          }
          if (filter.Field === 'Status') {
            filter.Field = 'StatusText';
        }
        
          return filter;
      });
    } 
  
    this.getFollowUpList();
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
  //reset method
  OnReset() {
    this.requestPayload.UserId = '';
    this.requestPayload.Stage = '';
    this.requestPayload.TicketNumber = null;
    this.requestPayload.AccountNumber = null;
    this.requestPayload.AccessionNumber=null;
    this.requestPayload.PatientName=null;
    this.requestPayload.DepartmentId='';
    this.followUpList = {
      data: [],
      total: 0,
    };
    this.getFollowUpList();
  }
  redirectView(ticketId:any,Type:number): void {
 
    if(Type==12){
      this.router.navigate(['/lab/follow-up/resolution-center/accession/view/', this.common.EncryptID(ticketId)]);
    }
    else if(Type==13){
      this.router.navigate(['/lab/follow-up/resolution-center/add-on/view/', this.common.EncryptID(ticketId)])
    }
    else if(Type==15){
      this.router.navigate(['/lab/follow-up/resolution-center/correspondence/view/', this.common.EncryptID(ticketId)])
    }
    else if(Type==17){
      this.router.navigate(['/lab/follow-up/resolution-center/duplicate-test/view/', this.common.EncryptID(ticketId)])
    }
    
  }
  // redirectView(ticketId:any,Type:number) {
  //   console.log(this.common.EncryptID(ticketId),"type")
  //   this.router.navigate(['/lab/ticket-resolution'])
  // }

  modelCommentOpen(id: string,Type:number) {
    (function ($) {
      $('#viewAdd').modal('show');
    })(jQuery);
    this.getComments(id,Type);
  }

  modelCommentClose() {
    (function ($) {
      $('#viewAdd').modal('hide');
    })(jQuery);
    this.selectedId = null;
    this.Type= null;
    this.getFollowUpList();
  }
  getComments(id: string,Type:number) {
    this.selectedId = id;
    this.Type=Type
    // console.log(Type)
    switch (Type) {
      case 12:
          this.getCommentApiEndPoint = this.constant.commentListAccession;
          this.addCommentApiEndPoint=this.constant.addCommentAccession;
          break;
      case 13:
        this.getCommentApiEndPoint = this.constant.commentListAddon
        this.addCommentApiEndPoint=this.constant.addCommentAddon
        break;
      case 15:
        this.getCommentApiEndPoint = this.constant.commentListCorrespondence
        this.addCommentApiEndPoint=this.constant.commentAddCorrespondence
        break;
      case 17:
        this.getCommentApiEndPoint = this.constant.commentListDuplicateReq
        this.addCommentApiEndPoint=this.constant.commentAddDuplicateReq
        break;
      default:
        this.getCommentApiEndPoint = '';
        this.addCommentApiEndPoint=''
  }
    this.api
      .callApi(
        this.getCommentApiEndPoint +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log(res)
          this.commentList = res;
        },
        (err: any) => {
          
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  submitComment() {
    if (this.comment == '') {
      return;
    } else {
      const body = {
        Id: this.selectedId,
        Comment: this.comment,
      };
    
      this.api
        .callApi(this.addCommentApiEndPoint, body, 'POST', true, true)
        .subscribe(
          (res: any) => {         
            this.comment = '';
            this.getComments(this.selectedId,this.Type);
            this.toastr.success(res.Message, 'Access Med Lab');
          },
          (err: any) => {
            // console.log(err);
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
}
