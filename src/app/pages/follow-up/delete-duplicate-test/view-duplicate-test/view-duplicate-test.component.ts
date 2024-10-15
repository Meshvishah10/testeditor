import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { ToastrService } from 'ngx-toastr';
import { delay, from, map, switchMap, tap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
declare var jQuery: any;
@Component({
  selector: 'app-view-duplicate-test',
  templateUrl: './view-duplicate-test.component.html',
  styleUrl: './view-duplicate-test.component.scss'
})
export class ViewDuplicateTestComponent implements OnInit , AfterViewInit {
  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;
  
  //custom variable declare
  autoPrint:boolean=true;
  uniqueId: any;
  permission: any
  details: any = [];
  ticketType: any;
  ticketId: any[] = [];
  ticketEditForm: any  = FormGroup;
  showUserFrm :any = FormGroup;
  isSubmitted: any = false;
  departmentList: any;
  userList: any;
  servityList: any;
  status: any;
  callLogAddForm:any = FormGroup;
  selectedDepartment: any = [];
  selectedUser: any = [];
  userdropdownflag: any = 'none';
  customvalidation: string = '';
  ticket_number:any='';
  departmentresp: any = [];
  userresp: any = []
  isResolve:boolean=false
 
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
      Severity: [''],
      Stage: [''],

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
    // this.ticketType = this.activatedRoute.snapshot.params['type'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['type']) : '';
    // this.ticket_number = this.activatedRoute.snapshot.params['number'] !== undefined ? this.activatedRoute.snapshot.params['number'] : '';
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 61;
    });
    
    if (this.permission.MenuPermission.View == true) {
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/follow-up/resolution-center']);
        return
      }
      this.getTicketDetail();
      this.getDepartmentList();
      this.getUserList();
      this.getStateAndTicketTypeList();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
    
  }

  getTicketDetail() {
    this.api
      .callApi(this.constant.detailDuplicateReq +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.uniqueId)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.details = res
          // console.log("Getting details", this.details);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  deleteTicket() {
    this.ticketId.push(this.uniqueId)
    this.api
      .callApi(this.constant.commonDuplicateReq +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.ticketId)), [], 'DELETE', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.closeModal('deleteTicket');
            this.toastr.success(
              resp.Message,
              'Access Med Lab'
            );
            this.router.navigate([`/lab/follow-up/resolution-center`])
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
  
  // Edit product category data by Id
  editModel() {
    this.api
      .callApi(
        this.constant.commonDuplicateReq +
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
  //User list
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
  //Department list
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

  //State and Ticket Type List
  getStateAndTicketTypeList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.status = res?.NewAccessionStageList
          this.servityList = res?.SeverityList
        
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
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
  Resolvesubmit(){
    this.isResolve=true
    this.submit()
    this.isResolve=false
  }

  submit() {
    this.isSubmitted = true;
    this.customvalidation = this.ticketEditForm.value.Isdepartment ? this.selectedDepartment.length <= 0 ? "Please select Department" : '': this.ticketEditForm.value.Isuser ? this.selectedUser.length <= 0 ? "Please select User" : '': '';
     //console.log("Getting customeValidation", this.customvalidation , this.selectedDepartment);
    if (this.ticketEditForm.invalid || this.customvalidation !== ''){  
      //console.log(this.ticketEditForm,"body")
      return;
    }
    else{
      let body = {
        Id: this.ticketEditForm.value.Id,
   
        Isdepartment: this.ticketEditForm.value.Isdepartment,
        Isuser:  this.ticketEditForm.value.Isuser,
        DepartmentIdList:  this.selectedDepartment,
        UserIdList:  this.selectedUser,
        Severity:  this.ticketEditForm.value.Severity,
        Stage:  this.ticketEditForm.value.Stage,
       
      };
      if(this.isResolve){
        const resolvedItem = this.status.find((item:any) => item.Value === 'Resolved');
        if (resolvedItem) {
          body.Stage = resolvedItem.Key;
        }
      }
      this.api
      .callApi(this.constant.commonDuplicateReq,body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          if (res.Status == 1) {
            this.ticketEditForm.reset();
            this.isSubmitted=false;
            this.getTicketDetail();
            this.closeModal('editTicket');
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
    .callApi(this.constant.callLogDuplicateReq,body, 'POST', true, true)
    .subscribe(
      (res: any) => {
        if (res.Status == 1) {
          this.closeModal('createCallLog');
          this.callLogAddForm.reset();
          this.isSubmitted=false;
          this.getTicketDetail();
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

  showUser(id:any){
    //console.log("Getting Id", id);
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
          // console.log(res);
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
printDiv(number: any) {
  const printContent = document.getElementById('contentToExport')!;
  const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

  html2canvas(printContent, { scale: 3 }).then(canvas => {
    var imgData = canvas.toDataURL('image/png');
    var imgWidth = 210; 
    var pageHeight = 295;  
    var imgHeight = canvas.height * imgWidth / canvas.width;
    var heightLeft = imgHeight;
    var doc = new jsPDF('p', 'mm');
    var position = 10; // give some top padding to first page
    
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position += heightLeft - imgHeight; // top padding for other pages
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    doc.save(`follow_${number}.pdf`);

  });
}
}
