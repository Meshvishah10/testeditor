import { Component, OnInit , ViewChild , ElementRef, AfterViewInit, Input, Output, EventEmitter , ChangeDetectorRef } from '@angular/core';
import {Router , ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators ,FormControl} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
declare var jQuery: any;

@Component({
  selector: 'app-add-edit-clientuser',
  templateUrl: './add-edit-clientuser.component.html',
  styleUrls: ['./add-edit-clientuser.component.scss']
})
export class AddEditClientuserComponent implements OnInit  {

  AddEditForm:any=FormGroup;
  isSubmitted:any= false;
  generatedPassword:any='';
  profileImage:any='';
  MenuPermission:any=[];
  covidPermission:any=[];
  visible :any = 'fa fa-eye';

  @Input() EditUserId:any = '';

  @Input() ClientId: any = '';

  @Output() dataToParentEvent = new EventEmitter<string>();

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,private http:HttpClient,public activatedRoute: ActivatedRoute,  private formBuilder: FormBuilder,private common:CommonService,private toastr: ToastrService,private datePipe: DatePipe,private cdr: ChangeDetectorRef,private sanitizer: DomSanitizer){  }

  ngOnInit(): void {
    this.isSubmitted=false;
    var passregex: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$/;
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const phonemask = /^\(\d{3}\)-\d{3}-\d{4}$/;
      // Create Member Form and Declare Controllers of Form
    
  
      this.AddEditForm= this.formBuilder.group({
        UserName: ['', [Validators.required, Validators.minLength(3)]],
        FirstName: ['',[Validators.required]],
        LastName: [''],
        Email1: ['',[Validators.required,Validators.pattern(emailregex)]],
        Password:this.EditUserId == '' ? 
        ['', [Validators.required, Validators.pattern(passregex)]] : 
        ['',[Validators.required]],
        FileName:[''],
        FileContentByteData : [''],
      })
      // Ensure generated password matches the regex
             do {
              this.generatedPassword = this.generateRandomPassword();
            } while (!passregex.test(this.generatedPassword||''));

      this.getMenuList();    
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

  getSanitizedHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  async getUserDetails(id:string){
    // await this.getMenuList();
    // await this.getStateList();
    if(id != ''){
      this.AddEditForm.get('Password').clearValidators();
      this.AddEditForm.get('Password').setValidators([
            Validators.required,
      ]);
      this.api
      .callApi(
        this.constant.getClientUserById +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          // console.log(res);
          var resp = res;
          this.AddEditForm.reset({
            UserName: resp.UserName,
            FirstName: resp.FirstName,
            LastName: resp.LastName,
            Email1: resp.Email1,
            Password: resp.Password
          });
          this.profileImage = resp.Logo;
          this.MenuPermission.forEach((e: any) => {
            const isSelected = resp.ClientUserMenuPermissions.includes(e.Id);
            e.selected = isSelected;
          });
          this.covidPermission.forEach((e: any) => {
            const isSelected = resp?.ClientUserCovid19ProductPermissions?.includes(e.ProductId);
            e.selected = isSelected;
          });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }
    this.cdr.detectChanges();
  }



  getMenuList(){
    this.api
        .callApi(this.constant.getMenusListClientUser, [], 'GET', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            // var finalarray=[...resp.ClientUserMenus,...resp.ClientUserCovid19Products]
            resp.ClientUserMenus.map((e: any) => (e.selected = false));
            resp.ClientUserCovid19Products.map((e: any)=> (e.selected = false));
            this.MenuPermission = resp.ClientUserMenus;
            this.covidPermission = resp.ClientUserCovid19Products;
            // console.log("Getting res", this.MenuPermission);
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
  }

  ChangeProfile(e:any){
    let filename=e.target.files[0].name;
    let lstindex=filename.lastIndexOf(".") + 1;
    let extfile= filename.substr(lstindex,filename.length).toLowerCase();
    if (extfile=="jpg" || extfile=="jpeg" || extfile=="png"){
      let size=e.target.files[0].size;
      if(size <= 2097152){
        if(this.EditUserId == ''){
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
          this.AddEditForm.get('FileName')?.setValue(e.target.files[0].name);
          this.AddEditForm.get('FileContentByteData')?.setValue(base64String);
            // this.fileName=e.target.files[0].name,
            // this.fileByteData=base64String
        };
      // // Read the file as an array buffer
      reader.readAsArrayBuffer(e.target.files[0]);
        }else{
          this.uploadImage(e.target.files[0]);
        }
      }else{
        this.toastr.error("Image size shouldn't be more than 2 MB!",'Access Med Lab');
      }
    }else{
        this.toastr.error("Only jpg/jpeg and png files are allowed!",'Access Med Lab');
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
        Id: this.EditUserId,
        FileName: file.name,
        FileContentByteData: base64String,
      };
      // console.log('Getting ', body);
      this.api
        .callApi(this.constant.updateClientUserProfile, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            // console.log('Getting Upload Image', resp);
            this.profileImage = resp.FileURL;
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    };
    // // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
  }

  get f() { return this.AddEditForm.controls; }
  onInputChange(): void {
    const rawValue = this.f.UserName.value;
    const trimmedValue = rawValue.trim().replace(/\s+|[_\.]/g, '');// Remove all spaces, underscores, and periods
    this.f.UserName.setValue(trimmedValue); 
  }
  async onSubmit(){
    this.isSubmitted=true;
    if(this.AddEditForm.invalid){
      return;
    }else{      
      const selectedPermission = this.MenuPermission.filter((e: any) => e.selected === true);
      const selectedIds = selectedPermission.map((e: any) => e.Id);
      const selectedCovidPermission = this.covidPermission.filter((e:any) => e.selected === true);
      const selectedCovid = selectedCovidPermission.map((e:any) => e.ProductId)
      if(selectedIds.length != 0 || selectedCovid.length !== 0){
        let body={
          ClientId:this.ClientId,
          UserName:this.AddEditForm.value.UserName,
          FirstName:this.AddEditForm.value.FirstName,
          LastName:this.AddEditForm.value.LastName,
          Email1:this.AddEditForm.value.Email1,
          Password:this.AddEditForm.value.Password,
          MenusPermission:selectedIds,
          Covid19ProductsPermission:selectedCovid,
          FileName:this.AddEditForm.value.FileName,
          FileContentByteData:this.AddEditForm.value.FileContentByteData,
        }
       
        // console.log("Getting Body===", body);
  
        this.api.callApi(
          this.constant.addClientUser,
          body,
          "POST",
          true,
          true
        ).subscribe((res:any)=>{
          var resp=res;
          if(resp.Status == 1){  
          this.isSubmitted=false;      
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.CloseModel('Success');
          }else{
    
          }
        },(err:any)=>{
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        })
      }else{
        this.toastr.error("Please Select User's Features!","Access Med Lab");
      }
    }
  }

  async onUpdate(){
    this.isSubmitted=true;
    if(this.AddEditForm.invalid){
      return;
    }else{      
      const selectedPermission = this.MenuPermission.filter((e: any) => e.selected === true);
      const selectedIds = selectedPermission.map((e: any) => e.Id);
      const selectedCovidPermission = this.covidPermission.filter((e:any) => e.selected === true);
      const selectedCovid = selectedCovidPermission.map((e:any) => e.ProductId)
      if(selectedIds.length != 0 || selectedCovid.length !== 0){
        let body={
          Id:this.EditUserId,
          UserName:this.AddEditForm.value.UserName,
          FirstName:this.AddEditForm.value.FirstName,
          LastName:this.AddEditForm.value.LastName,
          Email1:this.AddEditForm.value.Email1,
          Password:this.AddEditForm.value.Password,
          MenusPermission:selectedIds,
          Covid19ProductsPermission:selectedCovid,
          // FileName:this.AddEditForm.value.FileName,
          // FileContentByteData:this.AddEditForm.value.FileContentByteData,
        }
        // console.log("Getting Body===", body);
  
        this.api.callApi(
          this.constant.updateClientUser,
          body,
          "PUT",
          true,
          true
        ).subscribe((res:any)=>{
          var resp=res;
          if(resp.Status == 1){   
          this.isSubmitted=false;     
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.CloseModel('Success');
          }else{
    
          }
        },(err:any)=>{
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        })
      }else{
        this.toastr.error("Please Select User's Features!","Access Med Lab");
      }
    }
  }

  changeicon(){
    this.visible = this.visible == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
  }

  CloseModel(data?:any){
    this.EditUserId='';
    this.profileImage='';
    this.isSubmitted=false;
    var passregex: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$/;
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    this.AddEditForm= this.formBuilder.group({
      UserName: ['',[Validators.required]],
      FirstName: ['',[Validators.required]],
      LastName: [''],
      Email1: ['',[Validators.required,Validators.pattern(emailregex)]],
      Password: ['',[Validators.required,Validators.pattern(passregex)]],
      FileName:[''],
      FileContentByteData : [''],
    })

           // Ensure generated password matches the regex
           do {
            this.generatedPassword = this.generateRandomPassword();
          } while (!passregex.test(this.generatedPassword||''));
    this.MenuPermission.map((e: any) => (e.selected = false));
    this.covidPermission.map((e: any) => (e.selected = false));
    this.dataToParentEvent.emit(data);
    (function ($) {
      $("#AddUser").modal("hide");
    })(jQuery);
  }
}
