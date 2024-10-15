import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';

import { ToastrService } from 'ngx-toastr';
import { delay, from, switchMap, tap ,map } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
declare var jQuery: any;
@Component({
  selector: 'app-view-specimen',
  templateUrl: './view-specimen.component.html',
  styleUrl: './view-specimen.component.scss'
})
export class ViewSpecimenComponent implements OnInit , AfterViewInit {

  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;

  uniqueId: any;
  callLogAddForm:any;
    permission: any
    details: any = [];
    specimenId: any[] = [];
    ticketEditForm: any  = FormGroup;
    showUserFrm :any = FormGroup;
    isSubmitted: any = false;
    departmentList: any;
    userList: any;
    selectedUser:any;
    selectedDepartment:any
    userresp:any
    userdropdownflag: any = 'none';
    customvalidation: string = '';
    departmentresp:any
    constructor(
      public activatedRoute: ActivatedRoute,
      private common: CommonService,
      private api: ApiService,
      private constant: ConstantService,
      private toastr: ToastrService,
      public formBuilder: FormBuilder,
      public FilterAndSortingService: FilterAndSortingService,
      private router: Router,
      private datePipe: DatePipe
    ) { }

    ngOnInit(): void {
      this.ticketEditForm = this.formBuilder.group({
        Id: [''],
        Title: ['', [Validators.required]],
        Isdepartment: true,
        Isuser: false,
        Note: [''],
        Miscoption:[''],
      });
      this.callLogAddForm = this.formBuilder.group({
        Id: this.uniqueId,
        Note: ['', [Validators.required]],
      });
      this.showUserFrm = this.formBuilder.group({
        username: new FormControl({ value: '', disabled: true }, Validators.required),
        fullname: new FormControl({ value: '', disabled: true }, Validators.required),
        email: new FormControl({ value: '', disabled: true }, [Validators.required]),
        deptid: new FormControl({ value: '', disabled: true }, Validators.required),
        createddate: new FormControl({ value: '', disabled: true }, Validators.required),
      })
      this.uniqueId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : ''; 
      let permissions = this.common.Decrypt(localStorage.getItem('permission'));
      this.permission = permissions.find((item: any) => {
        return item.Type == 34;
      });
      if (this.permission?.MenuPermission.View == true) {
        if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
          this.toastr.error('Invalid Request.');
          this.router.navigate(['/lab/follow-up/discard-specimen']);
          return
        }
        this.getSpecimenDetail();
        this.getDepartmentList();
        this.getUserList();
      }else{
        this.router.navigate(['/lab/dashboard']);
    }
    }
    getSpecimenDetail() {
      this.api
        .callApi(this.constant.SpecimenDetail +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.uniqueId)), [], 'GET', true, true)
        .subscribe(
          (res: any) => {
            // console.log(res)
            this.details = res
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
  
          }
        );
    }
    deleteSpecimen() {
      this.specimenId.push(this.uniqueId)
      this.api
        .callApi(this.constant.Specimen +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.specimenId)), [], 'DELETE', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            if (resp.Status == 1) {
              this.closeModal('deleteTicket');
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
              this.router.navigate([`/lab/follow-up/discard-specimen`])
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
  
          }
        );
  
    }
    closeModal(modalId: string) {
      this.userdropdownflag='none';
      this.selectedDepartment=[];
      this.selectedUser=[];
      this.isSubmitted=false;
      (function ($) {
        $(`#${modalId}`).modal("hide");
      })(jQuery);
    }
    
    // Edit data by Id
    editModel() {
        this.api
          .callApi(
            this.constant.Specimen +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(this.uniqueId)),
            [],
            'GET',
            true,
            true
          )
          .subscribe(
            (res: any) => {      
              var resp = res;
              this.ticketEditForm.reset({
                Id: resp.Id,
                Title: resp.Title,
                Isdepartment: resp.Isdepartment,
                Isuser: resp.Isuser,
                Severity: resp.Severity,
                Stage: resp.Stage,
                Miscoption:resp?.Miscoption,
                Note:resp?.Note
                // ApprovalStatus: resp?.ApprovalStatus,
                // other : resp?.Miscoption
              });
           
              this.selectedUser = resp.UserIdList;
              this.selectedDepartment = resp.DepartmentIdList;
              this.userdropdownflag = resp.Isdepartment == true ? 'none' : 'inline-block';
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
    }
      get f() {
        return this.ticketEditForm.controls; 
      }
      get m() {
        return this.callLogAddForm.controls;
      }
          // //User list
    getUserList() {
      this.api
        .callApi(this.constant.getNCUserlist, [], 'GET', true, true)
        .subscribe(
          (res: any) => {
            this.userresp = res;
            this.userList= this.userresp.length != 0 ? this.userresp.slice() : this.userresp;
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
    // //Department list
    getDepartmentList() {
      this.api
        .callApi(this.constant.commonDepartmentlist, [], 'GET', true, true)
        .subscribe(
          (res: any) => {
            this.departmentresp = res;
            this.departmentList= this.departmentresp.length != 0 ? this.departmentresp.slice() : this.departmentresp;
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
    ngAfterViewInit() {
      // filter dropdown deprtment list
      const deptcontains = (value:any) => (s:any) => s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  
      this.department.filterChange
        .asObservable()
        .pipe(
          switchMap((value:any) =>
            from([this.departmentresp]).pipe(
              tap(() => (this.department.loading = true)),
              delay(100),
              map((data:any) => data.filter(deptcontains(value)))
            )
          )
        )
        .subscribe((x) => {
          this.departmentList = x;
          this.department.loading = false;
        });
  
  
      // filter user dropdown list
      const usercontains = (value:any) => (s:any) => s.Value.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  
      this.userdropdown.filterChange
        .asObservable()
        .pipe(
          switchMap((value:any) =>
            from([this.userresp]).pipe(
              tap(() => (this.userdropdown.loading = true)),
              delay(100),
              map((data:any) => data.filter(usercontains(value)))
            )
          )
        )
        .subscribe((x) => {
          this.userList = x;
          this.userdropdown.loading = false;
        });
      
    }
    onRadioChange() {
      // Implement logic to load data based on the selected radio button
      this.ticketEditForm.get('Isuser').value = this.ticketEditForm.get('Isdepartment').value ? false : true
      this.ticketEditForm.value.Isuser = this.ticketEditForm.value.Isdepartment == true ? false : true;
      this.userdropdownflag = this.ticketEditForm.value.Isdepartment == true ? 'none' : 'inline-block';
      this.selectedDepartment = this.ticketEditForm.value.Isdepartment != true ? [] : this.selectedDepartment;
      this.selectedUser = this.ticketEditForm.value.Isuser != true ? [] : this.selectedUser;
      if (this.isSubmitted) {
        this.customvalidation = this.ticketEditForm.value.Isdepartment
          ? this.selectedDepartment.length <= 0 ? "Please select Department" : ''
          : this.ticketEditForm.value.Isuser
            ? this.selectedUser.length <= 0 ? "Please select User" : ''
            : '';
      }
    }
    showUser(id:any){   
      this.api
        .callApi(
          this.constant.commonUser +
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
            
            this.showUserFrm.reset({
              username: resp.UserName,
              fullname: resp.FullName,
              email: resp.Email,
              deptid: resp.NCDepartmentId,
              createddate: resp?.CreatedDate !== null?this.datePipe.transform(resp?.CreatedDate,'MM/dd/yyyy'):'',
            });;
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
    addSubmit(){
      this.isSubmitted=true
      if (this.callLogAddForm.invalid){  
       return;
     }
     else{
       let body = {
         Id: this.uniqueId,
         Note: this.callLogAddForm.value.Note, 
       };
       this.api
       .callApi(this.constant.SpecimenCallLog,body, 'POST', true, true)
       .subscribe(
         (res: any) => {
           if (res.Status == 1) {
             this.closeModal('createCallLog');
             this.callLogAddForm.reset();
             this.isSubmitted=false;
             this.getSpecimenDetail();
             this.toastr.success(
               res.Message,
               'Access Med Lab'
             );
           }
         },
         (err: any) => {
           this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
         }
       )
       
     }
    }
      
    submit() {
      this.isSubmitted = true;
      this.customvalidation = this.ticketEditForm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : '': this.ticketEditForm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
      // console.log("Getting customeValidation", this.customvalidation , this.selectedDepartment);
      if (this.ticketEditForm.invalid || this.customvalidation !== ''){  
        return;
      }
      else{
        let body = {
          Id: this.ticketEditForm.value.Id,
          Title: this.ticketEditForm.value.Title,
          Isdepartment: this.ticketEditForm.value.Isdepartment,
          Isuser:  this.ticketEditForm.value.Isuser,
          DepartmentIdList:  this.selectedDepartment,
          UserIdList:  this.selectedUser,
          Note: this.ticketEditForm?.value?.Note,
          Miscoption: this.ticketEditForm?.value?.Miscoption
        };
      
        this.api
        .callApi(this.constant.Specimen,body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            if (res.Status == 1) {
              this.ticketEditForm.reset();
              this.isSubmitted=false;
              this.getSpecimenDetail();
              this.closeModal('editTicket');
              this.customvalidation =''
              this.toastr.success(
                res.Message,
                'Access Med Lab'
              );
            }
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        )
        
      }
    }
}
