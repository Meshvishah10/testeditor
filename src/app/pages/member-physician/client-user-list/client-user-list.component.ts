import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { State } from '@progress/kendo-data-query';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { UsersResponse } from 'src/app/models/UserMaster.model';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { AddEditClientuserComponent } from '../add-edit-clientuser/add-edit-clientuser.component';
declare var jQuery: any;

@Component({
  selector: 'app-client-user-list',
  templateUrl: './client-user-list.component.html',
  styleUrls: ['./client-user-list.component.scss']
})
export class ClientUserListComponent {
  //Declare Common Variable
  userlist: any;
  deleteids:any=[];
  // common payload for get userlist
  requestpayload: any = {
    ClientId:null,
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
  editUserid:any = '';
  practiceName:any='';
  @ViewChild(AddEditClientuserComponent, { static: false }) childComponent!: AddEditClientuserComponent;

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,public activatedRoute: ActivatedRoute,private common:CommonService,private toastr: ToastrService,public FilterAndSortingService:FilterAndSortingService){}

  ngOnInit() {
    this.uniqueId = this.common.DecryptID(this.activatedRoute.snapshot.params['id']);
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 44;
    });

    //Load UserList Using this function
    this.requestpayload.ClientId = this.common.DecryptID(this.activatedRoute.snapshot.params['id']);
    this.practiceName =  this.common.DecryptID(this.activatedRoute.snapshot.params['name']);
    if (this.permission.MenuPermission.View == true) {
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/memberphysician']);
        return
      }
      this.getUserList();
    }
  }

  getUserList() {
    this.api
      .callApi(
        this.constant.getClientUser +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.requestpayload)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log("Getting users", res);
          this.userlist = {
            data: res.MPClientUsersList,
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

  receiveDataFromChild(data: string) {
    this.editUserid='';
    if(data && data != ''){
    this.getUserList();
    }
  }

  editUser(id?: any) {
    this.editUserid=id == undefined?'':id;
    if (this.childComponent) {
      // this.childComponent.ngOnInit();
      this.childComponent.getUserDetails(this.editUserid);
    }
    (function ($) {
      $("#AddUser").modal("show");
    })(jQuery);
    // this.router.navigate(['/memberphysician/edit-user/' + this.common.EncryptID(id)]);
  }

  // User Click on delete icon than model will display and set id in uniqueid variable
  deleteModel(id: any) {
    this.deleteids.push(id);
  }

  // If user click on yes than call below function and call api for delete department
  deleteUser() {
    this.api
      .callApi(
        this.constant.deleteClientUser +
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
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  isAllSelected(): boolean {
    // return this.userlist?.data.length !== 0 ? this.userlist?.data.every((item:any)=> !item.IsPrimary && item?.isSelected) : false;
    const nonAdminUsers = this.userlist?.data.filter((item: any) => !item.IsPrimary);
    
    return nonAdminUsers?.length !== 0 ?
      nonAdminUsers?.every((item: any) => item.isSelected) :
      false;
  }

  onSelectAllChange(event: any): void {
    const checked = event.target.checked;
    this.userlist.data.forEach((item:any) => {
      if (!item.IsPrimary) {
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

  CloseUserModel(){
    this.editUserid='';
    (function ($) {
      $("#AddUser").modal("hide");
    })(jQuery);
  }

  changeStatus(id: any, status: any) {
    let body = {
      Id: id,
    };
    this.api
      .callApi(this.constant.changeStatusClientUser, body, 'PUT', true, true)
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