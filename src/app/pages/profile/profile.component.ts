// Import necessary Angular modules and services
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import Inputmask from 'inputmask';
import { MasterDetails, UserProfile } from 'src/app/models/Profile.model';
import { ProfileDataService } from 'src/app/services/profiledata.service';
import { CometChatService } from 'src/app/services/cometchat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, AfterViewInit {
  // Declare common variables
  profilefrm: any = FormGroup;
  isSubmitted: any = false;
  isEdit: boolean = true;
  profileresp: any;
  profileImage: string = '';
  // Common Dropdown Lists
  rolelist: any = [];
  departmentlist: any = [];
  locationslist: any = [];

  @ViewChild('emailInput') emailInput!: ElementRef;

  // Constructor to inject services and modules
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
    private dataservice : ProfileDataService,
    private cc: CometChatService,
  ) {}

  // Angular lifecycle hook - OnInit
  ngOnInit(): void {
    this.isSubmitted = false;
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    // Create Profile Form and Declare Controllers of Form
    this.profilefrm = this.formBuilder.group({
      username: new FormControl({ value: '', disabled: true }, Validators.required),
      firstname: new FormControl({ value: '', disabled: true }, Validators.required),
      lastname: new FormControl({ value: '', disabled: true }),
      email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.pattern(emailregex)]),
      deptid: new FormControl({ value: '', disabled: true }, Validators.required),
    });
    // Call MasterDetails Function
    this.getMasterDetails();
    // Call Profile Data Function
    this.getMyProfileData();
  }

  // Angular lifecycle hook - AfterViewInit
  ngAfterViewInit() {
    // Set email masking
    Inputmask({ alias: 'email' }).mask(this.emailInput.nativeElement);
  }

  // Get Master Details like roles, Department, and Location Details
  getMasterDetails() {
    this.api.callApi(this.constant.MasterDetails, [], 'GET', true, true).subscribe(
      (res: MasterDetails) => {
        var resp = res;
        this.rolelist = resp.NCLevelsList;
        this.departmentlist = resp.NCDepartmentsList;
        this.locationslist = resp.CompanyLocationsList;
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }

  // Get Profile data of logged-in user
  getMyProfileData() {
    this.api.callApi(this.constant.GetProfile, [], 'GET', true, true).subscribe(
      (res: UserProfile) => {
        this.profileresp = res;
        // console.log(this.profileresp);
        this.profileImage = this.profileresp.Logo;
        if (this.profileresp.BirthDate != null) {
          this.profileresp.BirthDate = new Date(this.profileresp.BirthDate);
        }
        var profiledata={
          'LogoURL': this.profileImage,
          'FullName': this.profileresp.FirstName+'  '+this.profileresp.LastName
        }
        this.dataservice.setProfileData(profiledata);
        // Set response in Form
        this.profilefrm.reset({
          username: this.profileresp.UserName,
          firstname: this.profileresp.FirstName,
          lastname: this.profileresp.LastName,
          email: this.profileresp.Email,
          deptid: this.profileresp.NCDepartmentId,
        });
      },
      (err: any) => {
        // Show error toast
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }

  // Make all form controls editable using this function
  changeEdit() {
    this.isEdit = false;
    this.profilefrm.enable();
    this.profilefrm.get('deptid').disable();
  }

  // Validate selected Image and byte data
  ChangeProfile(e: any) {
    let filename = e.target.files[0].name;
    let lstindex = filename.lastIndexOf('.') + 1;
    let extfile = filename.substr(lstindex, filename.length).toLowerCase();
    if (extfile == 'jpg' || extfile == 'jpeg' || extfile == 'png') {
      let size = e.target.files[0].size;
      if (size <= 2097152) {
        this.uploadImage(e.target.files[0]);
      } else {
        this.toastr.error("Image size shouldn't be more than 2 MB!", 'Access Med Lab');
      }
    } else {
      this.toastr.error('Only jpg/jpeg and png files are allowed!', 'Access Med Lab');
    }
  }

  // Make API call for uploading image on the server
  uploadImage(file: any) {
    const reader = new FileReader();
    reader.onload = () => {
      // The result property contains the file's data as a data URL
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytearray = new Uint8Array(arrayBuffer);
      // Convert data in array format
      const base64String = Array.from(bytearray);
      // Set the request body
      let body = {
        FileName: file.name,
        FileContentByteData: base64String,
      };
      this.api.callApi(this.constant.UploadProfileImage, body, 'PUT', true, true).subscribe(
        (res: { FileURL: string }) => {
          var resp = res;
          this.profileImage = resp.FileURL;
          var profiledata={
            'LogoURL': this.profileImage,
            'FullName': this.profileresp.FirstName+'  '+this.profileresp.LastName
          }
          this.dataservice.setProfileData(profiledata);
          this.cc.CC_UpdateUser({userId: this.profileresp.Id, userName: this.profileresp.FirstName + (this.profileresp.LastName ? ' ' + this.profileresp.LastName : ''), userAvatar: this.profileImage});
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    };
    // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
  }

  // Check form Validation
  get f() {
    return this.profilefrm.controls;
  }

  // Update profile data using this function.
  onSubmit() {
    this.isSubmitted = true;
    if (this.profilefrm.invalid) {
      return;
    } else {
      let body = {
        UserName: this.profilefrm.value.username,
        FirstName: this.profilefrm.value.firstname,
        LastName: this.profilefrm.value.lastname,
        Email: this.profilefrm.value.email,
        // Logo: this.profileImage,
        NCDepartmentId: this.profilefrm.value.deptid,
      };
      this.api.callApi(this.constant.UpdateMyProfile, body, 'PUT', true, true).subscribe(
        (res: any) => {
          var resp = res;
          this.isEdit = true;
          this.isSubmitted = false;
          this.profilefrm.disable();
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.getMyProfileData();
          this.cc.CC_UpdateUser({userId: this.profileresp.Id, userName: body.FirstName + (body.LastName ? ' ' + body.LastName : ''), userAvatar: this.profileImage});
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }
  }

  // Cancel button click event
  CancelbtnClick() {
    this.isEdit = true;
    this.getMyProfileData();
    this.profilefrm.disable();
  }
}
