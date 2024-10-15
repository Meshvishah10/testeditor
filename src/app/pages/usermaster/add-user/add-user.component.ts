import { Component, OnInit , ViewChild , ElementRef, AfterViewInit} from '@angular/core';
import {Router , ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators ,FormControl} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { PhoneFormatPipe } from 'src/app/shared/phone-format.pipe';
import { OrderByKeysPipe } from 'src/app/shared/orderkey.pipe';
import { orderByKeysRemoveSpacePipe } from 'src/app/shared/orderPipeAndremovespace.pipe';
import { raw } from 'body-parser';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit , AfterViewInit {
    
// Declare common Variable
userfrm:any=FormGroup;
isSubmitted:any= false;
profileresp:any;
profileImage:any='';
//Common Dropdown Lists
departmentlist:any=[];
fileName:any='';
fileByteData:any='';
PermissionList:any=[];
FinalArray:any=[];
disable:boolean=false;
generatedPassword:any='';

permission: any = '';

visible :any = 'fa fa-eye';
dashboardPermission:any;
selecteddbPermission:any;

constructor(private router: Router,private api: ApiService,private constant: ConstantService,private http:HttpClient,public activatedRoute: ActivatedRoute,  private formBuilder: FormBuilder,private common:CommonService,private toastr: ToastrService,private datePipe: DatePipe,public phoneFormat:PhoneFormatPipe,public OrderKeyPipe: OrderByKeysPipe,public OrderKeyandRemoveSpace : orderByKeysRemoveSpacePipe){}

  ngOnInit(): void {
    this.isSubmitted=false;
    var passregex: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$/;
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
      this.permission = permissions.find((item: any) => {
        return item.Type == 45;
      });
      // console.log("Getting Permission", this.permission.MenuPermission);
      //Load Department Using this function
      if (this.permission.MenuPermission.Add == true) {
            // Create Profile Form and Declare Controllers of Form
            this.userfrm= this.formBuilder.group({
              username: ['',[Validators.required,Validators.minLength(3)]],
              firstname: ['',[Validators.required]],
              lastname: [''],
              email: ['',[Validators.required,Validators.pattern(emailregex)]],
              deptid: ['',[Validators.required]],
              password: ['',[Validators.required,Validators.pattern(passregex)]],
              tokenExpirationMins: [null,[Validators.required,Validators.min(5),Validators.max(50000)]]
            })  // call MasterDetails Function
            this.getMasterDetails();
            // Ensure generated password matches the regex
            do {
              this.generatedPassword = this.generateRandomPassword();
            } while (!passregex.test(this.generatedPassword||''));
      }else{
        this.router.navigate(['/lab/dashboard']);
      }
  }

  generateRandomPassword(){
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#?!@$%^&*-';
    const passwordLength = Math.floor(Math.random() * (10 - 8 + 1)) + 8; // Random length between 8 and 10

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    return password;
  }

  ngAfterViewInit(){
    //set email masking
    // Inputmask({ alias: 'email' }).mask(this.emailInput?.nativeElement);
  }

    // Get Master Details like roles , Department and Location Details
    getMasterDetails(){
      this.api.callApi(
        this.constant.MasterDetails,
        [],
        "GET",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        this.departmentlist = resp.NCDepartmentsList;
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
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


      // Validate selected Image and bytedata
      ChangeProfile(e:any){
        let filename=e.target.files[0].name;
        let lstindex=filename.lastIndexOf(".") + 1;
        let extfile= filename.substr(lstindex,filename.length).toLowerCase();
        if (extfile=="jpg" || extfile=="jpeg" || extfile=="png"){
          let size=e.target.files[0].size;
          if(size <= 2097152){
            const readerFile = new FileReader();

            readerFile.onload = (e: any) => {
              // console.log(e.target.result);
              this.profileImage = e.target.result;
            };
      
            readerFile.readAsDataURL(e.target.files[0]);

            const reader = new FileReader();
            reader.onload = () => {
              // The result property contains the file's data as a data URL
              const arrayBuffer = reader.result as ArrayBuffer;
              const bytearray = new Uint8Array(arrayBuffer);
              // convert data in array format 
              const base64String = Array.from(bytearray);
              // set the request body
                this.fileName=e.target.files[0].name,
                this.fileByteData=base64String
            };
          // // Read the file as an array buffer
          reader.readAsArrayBuffer(e.target.files[0]);
          }else{
            this.toastr.error("Image size shouldn't be more than 2 MB!",'Access Med Lab');
          }
        }else{
            this.toastr.error("Only jpg/jpeg and png files are allowed!",'Access Med Lab');
        } 
    }

    changeDepartment(){
      this.PermissionList=[];
      if(this.userfrm.value.deptid != ''){
          this.api.callApi(
            this.constant.getUserMenuPermission+'?inputRequest='+encodeURIComponent(this.common.Encrypt(this.userfrm.value.deptid)),
            [],
            "GET",
            true,
            true
            ).subscribe((res:any)=>{
              res.MenuPermissions.forEach((element:any)=>{
                element.MenuPermission = this.OrderKeyPipe.transform(element.MenuPermission)
              })
              this.loadDbPermission();
              this.PermissionList=this.convertToNestedTree(res.MenuPermissions);
          },(err:any)=>{
            this.PermissionList=[];
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          })
        }
    }

    convertToNestedTree(flatArray: any[]): any[] {
      const tree: any[] = [];
      const map = new Map();
      flatArray.sort((a, b) => a.SortOrder - b.SortOrder);
      flatArray.forEach(item => {
            map.set(item.Id, { ...item , children: [] });
      });
  
      flatArray.forEach(item => {
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
        MenuId:item.Id,
        Action:item.MenuPermission
      })
      if (item.children && item.children.length > 0) {
        this.flattenData(item.children);
      }
      });
    }

    get f() { return this.userfrm.controls; }
    onInputChange(): void {
   
      const rawValue = this.f.username.value;
      const trimmedValue = rawValue.trim().replace(/\s+/g, ''); // Remove all spaces
      this.f.username.setValue(trimmedValue); 
      }
    
    async onSubmit(){
      this.FinalArray=[];
      this.isSubmitted=true;
      if(this.userfrm.invalid){
        return;
      }else{
       
        await this.flattenData(this.PermissionList);
        this.FinalArray.forEach((res:any)=>{
          res.Action =  this.OrderKeyandRemoveSpace.transform(res.Action);
        })
        let body={
          UserName:this.userfrm.value.username,
          FirstName:this.userfrm.value.firstname,
          LastName:this.userfrm.value.lastname,
          Email:this.userfrm.value.email,
          NCDepartmentId:this.userfrm.value.deptid,
          Password:this.userfrm.value.password,
          UserMenuPermissions:this.FinalArray,
          NCDashboardId:this.selecteddbPermission,
          TokenExpirationMins:parseInt(this.userfrm.value.tokenExpirationMins)
        }
        //console.log("Getting Body===", body);

        this.api.callApi(
          this.constant.commonUser,
          body,
          "POST",
          true,
          true
        ).subscribe((res:any)=>{
          var resp=res;
          this.disable=false;
          if(resp.Status == 1){        
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.userfrm.reset();
          this.router.navigate(['/lab/user']);
          }else{
    
          }
        },(err:any)=>{
          this.disable=false;
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        })
      }
    }

    changeicon(){
      this.visible = this.visible == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
   }

}
