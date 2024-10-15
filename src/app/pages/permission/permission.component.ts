// Import necessary modules and services
import {  Component, OnInit   } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'src/app/models/PermissionManagement.model';
import { OrderByKeysPipe } from 'src/app/shared/orderkey.pipe';
import { orderByKeysRemoveSpacePipe } from 'src/app/shared/orderPipeAndremovespace.pipe';

// Declare the jQuery variable
declare var jQuery: any;

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss'],
})
export class PermissionComponent {
  // Declare Common Variables
  PermissionList: any = [];
  departmentid: any = '';
  FinalArray: any = [];
  DepartmentName:string='';
  editPermission:boolean= false;
  permission: any;
  
  dashboardPermission:any;
  selecteddbPermission:any;

  AssociatUser:boolean=false;
  // Constructor to inject dependencies
  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public OrderKeyPipe: OrderByKeysPipe,public OrderKeyandRemoveSpace : orderByKeysRemoveSpacePipe
  ) {}

  // Lifecycle hook - ngOnInit
  ngOnInit(): void {
    // Get department ID from the route parameters
    this.departmentid = this.common.DecryptID(this.activatedRoute.snapshot.params['id']);
    // console.log('Getting Department', this.departmentid);
    // Load permissions for the department
 
    if (this.activatedRoute.snapshot.params['id'] && !this.departmentid) {

      this.toastr.error('Invalid Request.');
      this.router.navigate(['/lab/department']);
      return
    }
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 47;
    });
    this.editPermission=this.permission.MenuPermission.Edit;
    this.loadPermissions();
    this.loadDbPermission(); 
  }

  // Method to load permissions for the department
  loadPermissions() {
    this.api
      .callApi(
        this.constant.getManuPermission +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.departmentid)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res:any) => {
          this.DepartmentName= res.DepartmentName;
          this.selecteddbPermission=res.NCDashboardId;
          res.MenuPermissions.forEach((element:any)=>{
            element.MenuPermission = this.OrderKeyPipe.transform(element.MenuPermission)
          })
          // Convert flat array to nested tree structure
          this.PermissionList = this.convertToNestedTree(res.MenuPermissions);
           //console.log("Getting Permission", this.PermissionList);
        
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  loadDbPermission(){
    this.api
    .callApi(
      this.constant.commonDashboardlist,
      [],
      'GET',
      true,
      true
    )
    .subscribe(
      (res:any) => {
        this.dashboardPermission=res;
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }

  // Method to convert flat array to nested tree structure
  convertToNestedTree(flatArray: any[]): any[] {
    const tree: any[] = [];
    const map = new Map();
    flatArray.sort((a, b) => a.SortOrder - b.SortOrder);
    flatArray.forEach((item) => {
      map.set(item.Id, { ...item, children: [] });
    });

    flatArray.forEach((item) => {
      const parent = map.get(item.ParentId);
      if (parent && parent != undefined) {
        parent.children.push(map.get(item.Id));
      } else {
        tree.push(map.get(item.Id));
      }
    });

    return tree;
  }
  // Method to handle permission changes
  changePermission(data: any, permission: any) {
    // console.log("Getting data", data , permission.MenuPermission);
    if ((data.key === 'Add' || data.key === 'Edit' || data.key === 'Delete' || data.key == 'Generate Invoice' || data.key == 'View Invoice' || data.key === 'Update Card And Ach Info' || data.key == 'Manage Free Supplies' || data.key == 'Charge Invoice') && data.value) {
      permission.MenuPermission.forEach((element:any)=>{
        if(element.key == 'View'){
          element.value=true;
        }
      })
    }
    else if(data.key === 'View' && data.value === false){
      permission.MenuPermission.forEach((element:any)=>{
        // if(element.key == 'View'){
          element.value=false;
        // }
      })
    }
  }

  // Method to flatten the nested tree structure into a flat array
  flattenData(data: any[]): void {  
    data.forEach((item) => {
      const { children, ...itemWithoutChildren } = item;
      this.FinalArray.push({
        MenuId: item.Id,
        Action: item.MenuPermission,
      });
      if (item.children && item.children.length > 0) {
        this.flattenData(item.children);
      }
    });
  }

  AssociateUserConfirm(){
    (function ($) {
      $("#changeStatus").modal("show");
    })(jQuery);
  }

  modelStatusClose(){
    (function ($) {
      $("#changeStatus").modal("hide");
    })(jQuery);
  }

  // Method to handle form submission
  async onSubmit() {
    this.FinalArray = [];
    await this.flattenData(this.PermissionList);
    this.FinalArray.forEach((res:any)=>{
      res.Action =  this.OrderKeyandRemoveSpace.transform(res.Action);
    })
    if (this.FinalArray.length != 0) {
      let body: any = {
        NCDepartmentId: this.departmentid,
        MenuPermissions: this.FinalArray,
        NCDashboardId: this.selecteddbPermission,
        UpdateAssociatedUsers: this.AssociatUser
      };
      this.api
        .callApi(this.constant.updateMenuPermission, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if(resp.Status ==1){
             this.modelStatusClose();
             this.AssociatUser=false;
            this.toastr.success(resp.Message,'Access Med Lab');
            this.loadPermissions();
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }
}
