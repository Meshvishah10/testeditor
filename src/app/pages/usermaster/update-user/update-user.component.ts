import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { PhoneFormatPipe } from 'src/app/shared/phone-format.pipe';
import { UserDataWithPermissions } from 'src/app/models/UserMaster.model';
import { MasterDetails } from 'src/app/models/Profile.model';
import { OrderByKeysPipe } from 'src/app/shared/orderkey.pipe';
import { orderByKeysRemoveSpacePipe } from 'src/app/shared/orderPipeAndremovespace.pipe';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss'],
})
export class UpdateUserComponent implements OnInit, AfterViewInit {
  // Declare common Variable
  userfrm: any = FormGroup;
  isSubmitted: any = false;
  profileresp: any;
  profileImage: any = '';
  //Common Dropdown Lists
  departmentlist: any = [];
  fileName: any = '';
  fileByteData: any = '';
  PermissionList: any = [];
  FinalArray: any = [];
  disable: boolean = false;
  userid: any = '';

  permission: any = '';

  visible :any = 'fa fa-eye';

  dashboardPermission:any;
  selecteddbPermission:any;

  @ViewChild('emailInput', { static: false }) emailInput!: ElementRef;

  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    private http: HttpClient,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    public phoneFormat: PhoneFormatPipe,
    public OrderKeyPipe: OrderByKeysPipe,
    public OrderKeyandRemoveSpace : orderByKeysRemoveSpacePipe,
  ) {}

  ngOnInit(): void {
    this.isSubmitted = false;
    this.userid = this.common.DecryptID(this.activatedRoute.snapshot.params['id']);
    var passregex: RegExp =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$/;
    const emailregex: RegExp =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

      let permissions = this.common.Decrypt(localStorage.getItem('permission'));
      this.permission = permissions.find((item: any) => {
        return item.Type == 45;
      });
      // console.log("Getting Permission", this.permission.MenuPermission);
      //Load Department Using this function
    
      if (this.permission.MenuPermission.Edit == true) {
        
          // Create Profile Form and Declare Controllers of Form
          this.userfrm = this.formBuilder.group({
            username: ['', [Validators.required,Validators.minLength(3)]],
            firstname: ['', [Validators.required]],
            lastname: [''],
            email: ['', [Validators.required, Validators.pattern(emailregex)]],
            deptid: ['', [Validators.required]],
            password: ['', [Validators.required]],
            tokenExpirationMins: [null,[Validators.required,Validators.min(5),Validators.max(50000)]]
          });
          // call MasterDetails Function
          this.getMasterDetails();
          //Get UserDetails

      }else{
        this.router.navigate(['/lab/dashboard']);
      }
  }

  ngAfterViewInit() {
    //set email masking
    // Inputmask({ alias: 'email' }).mask(this.emailInput?.nativeElement);
  }

  getUserById() {
    this.PermissionList = [];
    if (this.activatedRoute.snapshot.params['id'] && !this.userid) {
      this.toastr.error('Invalid Request.');
      return
  }
    this.api
      .callApi(
        this.constant.commonUser +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.userid)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: UserDataWithPermissions) => {
          // console.log("Getting res", res);
          var resp = res;
          this.profileresp = res;
          const matchingDepartment = this.departmentlist.find((department:any) => department.Key === res.NCDepartmentId);
          if(!matchingDepartment){
            resp.NCDepartmentId = '';
          }
          this.userfrm.reset({
            username: resp.UserName,
            firstname: resp.FirstName,
            lastname: resp.LastName,
            email: resp.Email,
            deptid: resp.NCDepartmentId,
            password: resp.Password,
            tokenExpirationMins:  resp.TokenExpirationMins,
          });
          this.profileImage = resp.Logo;
          this.selecteddbPermission= resp.NCDashboardId;
          if(resp.NCDepartmentId !== ''){
            resp.UserMenuPermissionsList.forEach((res:any)=>{
              res.MenuPermission =  this.OrderKeyPipe.transform(res.MenuPermission);
            })
            
          this.loadDbPermission();
          this.PermissionList = this.convertToNestedTree(
            resp.UserMenuPermissionsList
          );
        }else{
           res.UserMenuPermissionsList=[];
        }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }


  // Get Master Details like roles , Department and Location Details
  getMasterDetails() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: MasterDetails) => {
          var resp = res;
          this.departmentlist = resp.NCDepartmentsList;
          this.getUserById();
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Validate selected Image and bytedata
  ChangeProfile(e: any) {
    let filename = e.target.files[0].name;
    let lstindex = filename.lastIndexOf('.') + 1;
    let extfile = filename.substr(lstindex, filename.length).toLowerCase();
    if (extfile == 'jpg' || extfile == 'jpeg' || extfile == 'png') {
      let size = e.target.files[0].size;
      if (size <= 2097152) {
        this.uploadImage(e.target.files[0]);
      } else {
        this.toastr.error(
          "Image size shouldn't be more than 2 MB!",
          'Access Med Lab'
        );
      }
    } else {
      this.toastr.error(
        'Only jpg/jpeg and png files are allowed!',
        'Access Med Lab'
      );
    }
  }

  // make api call for upload image on the server
  uploadImage(file: any) {
    // console.log('Getting ', file);
    const reader = new FileReader();
    reader.onload = () => {
      // The result property contains the file's data as a data URL
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytearray = new Uint8Array(arrayBuffer);
      // convert data in array format
      const base64String = Array.from(bytearray);
      // set the request body
      let body = {
        Id: this.userid,
        FileName: file.name,
        FileContentByteData: base64String,
      };
      // console.log('Getting ', body);
      this.api
        .callApi(this.constant.UploadUserProfileImage, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            // console.log('Getting Upload Image', resp);
            this.profileImage = resp.FileURL;
            // this.cc.CC_UpdateUser({userId: this.profileresp.Id, userName: this.profileresp.FirstName + (this.profileresp.LastName ? ' ' + this.profileresp.LastName : ''), userAvatar: this.profileImage});
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    };
    // // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
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

  changeDepartment() {
    this.PermissionList = [];
    if (this.userfrm.value.deptid != '') {
      this.api
        .callApi(
          this.constant.getUserMenuPermission +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(this.userfrm.value.deptid)),
          [],
          'GET',
          true,
          true
        )
        .subscribe(
          (res: any) => {
            res.MenuPermissions.forEach((res:any)=>{
              res.MenuPermission =  this.OrderKeyPipe.transform(res.MenuPermission);
            })  
            this.loadDbPermission();
            this.PermissionList = this.convertToNestedTree(res.MenuPermissions);
          },
          (err: any) => {
            this.PermissionList = [];
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

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

  changePermission(data: any, permission: any) {
    if ((data.key === 'Add' || data.key === 'Edit' || data.key === 'Delete' || data.key == 'Generate Invoice' || data.key == 'View Invoice' || data.key === 'Update Card And Ach Info' || data.key == 'Manage Free Supplies' || data.key == 'Charge Invoice') && data.value) {
      permission.MenuPermission.forEach((element:any)=>{
        if(element.key == 'View'){
          element.value=true;
        }
      })
    }
    else if(data.key === 'View' && data.value === false){
      permission.MenuPermission.forEach((element:any)=>{
        element.value=false;
      })
    }
  }

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

  get f() {
    return this.userfrm.controls;
  }

  async onSubmit() {
    this.FinalArray=[];
    this.isSubmitted = true;
    if (this.activatedRoute.snapshot.params['id'] && !this.userid) {
      this.toastr.error('Invalid Request.');
      return ;
  }
    this.FinalArray = [];
    if (this.userfrm.invalid) {
      return;
    } else {
      await this.flattenData(this.PermissionList);
      this.FinalArray.forEach((res:any)=>{
        res.Action =  this.OrderKeyandRemoveSpace.transform(res.Action);
      }) 
      // console.log("Getting Permission List", this.FinalArray);
      let body = {
        Id: this.userid,
        UserName: this.userfrm.value.username,
        FirstName: this.userfrm.value.firstname,
        LastName: this.userfrm.value.lastname,
        Email: this.userfrm.value.email,
        NCDepartmentId: this.userfrm.value.deptid,
        Password: this.userfrm.value.password,
        UserMenuPermissions: this.FinalArray,
        NCDashboardId: this.selecteddbPermission,
        TokenExpirationMins:parseInt(this.userfrm.value.tokenExpirationMins)
      };
      // this.UpdatePermission();
      this.api
        .callApi(this.constant.commonUser, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.disable = false;
            if (resp.Status == 1) {
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
              this.userfrm.reset();
              this.FinalArray = [];
              this.router.navigate(['/lab/user']);
              // this.UpdatePermission();
              // this.cc.CC_UpdateUser({userId: body.Id, userName: body.FirstName + (body.LastName ? ' ' + body.LastName : ''), userAvatar: this.profileImage});
            } else {
            }
          },
          (err: any) => {
            this.disable = false;
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  changeicon(){
    this.visible = this.visible == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
 }
}
