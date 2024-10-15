import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { State } from '@progress/kendo-data-query';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { UsersResponse } from 'src/app/models/UserMaster.model';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
declare var jQuery: any;

@Component({
  selector: 'app-usermaster',
  templateUrl: './usermaster.component.html',
  styleUrls: ['./usermaster.component.scss'],
})
export class UsermasterComponent {
  //Declare Common Variable
  userlist: any;
  deleteids:any=[];
  // common payload for get userlist
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
    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: [],
    },
  };

  permission: any = '';
  uniqueId: any = '';

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,public activatedRoute: ActivatedRoute,private common:CommonService,private toastr: ToastrService,public FilterAndSortingService:FilterAndSortingService){}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 45;
    });
    // console.log("Getting Permission", this.permission);
    //Load Department Using this function
    if (this.permission.MenuPermission.View == true) {
      this.getUserList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getUserList() {
    // console.log("Getting request Payload", this.requestpayload);
    this.api
      .callApi(
        this.constant.getAllUser +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: UsersResponse) => {
          // console.log('Getting response', res);
          // this.levellist=res.NCLevelsList;
          this.userlist = {
            data: res.NCUsersList,
            total: res.Total,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Call Function when data state changes , user click on next page or order
  public dataStateChange(state: DataStateChangeEvent): void {
     // call Filter and Soring Function
     var RequestData=this.FilterAndSortingService.prepareRequestPayload(state);

     this.state=state;
     this.requestpayload.PageSize=state.take;
     this.requestpayload.Sorts=RequestData.Sorts;
     this.requestpayload.Filters=RequestData.Filters;
     this.requestpayload.Page = (state.skip + state.take) / state.take;
    this.getUserList();
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

  AddUser() {
    this.router.navigate(['/lab/user/adduser']);
  }

  editUser(id: any) {
    this.router.navigate(['/lab/user/edituser/' + this.common.EncryptID(id)]);
  }

  // User Click on delete icon than model will display and set id in uniqueid variable
  deleteModel(id: any) {
    this.deleteids.push(id);
  }

  // If user click on yes than call below function and call api for delete department
  deleteUser() {
    this.api
      .callApi(
        this.constant.commonUser +
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
          // console.log("Delete Department", resp);
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            if(this.userlist.data.length == this.deleteids.length){
              this.state.skip=0;
              this.state.take=50;
              this.requestpayload.Page = (this.state.skip + this.state.take ) / this.state.take
            }
            this.modelDeleteClose();
            this.getUserList();
          } else {
          }
        },
        (err: any) => {
          this.modelDeleteClose();
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  isAllSelected(): boolean {
    const nonAdminUsers = this.userlist?.data.filter((item: any) => !item.IsAdmin);
    
    return nonAdminUsers?.length !== 0 ?
      nonAdminUsers?.every((item: any) => item.isSelected) :
      false;
  }
  

  onSelectAllChange(event: any): void {
    const checked = event.target.checked;
    this.userlist.data.forEach((item:any) => {
      if (!item.IsAdmin) {
        item.isSelected = checked;
        if(checked){
        this.deleteids.push(item.Id);
        }
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

  // It's use for close delete model
  modelDeleteClose() {
    this.deleteids = [];
    this.userlist.data.map((e: any) => (e.isSelected = false));
    (function ($) {
      $("#deleteUser").modal("hide");
    })(jQuery);
  }

  changeStatus(id: any, status: any) {
    let body = {
      Id: id,
    };
    this.api
      .callApi(this.constant.ChangeUserStatus, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(
              resp.Message,
              'Access Med Lab'
            );
            this.getUserList();
          } else {
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
