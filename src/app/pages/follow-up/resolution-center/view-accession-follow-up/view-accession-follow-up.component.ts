import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { AutoCompleteComponent, MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { delay, from, map, switchMap, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
declare var jQuery: any;

@Component({
  selector: 'app-view-accession-follow-up',
  templateUrl: './view-accession-follow-up.component.html',
  styleUrl: './view-accession-follow-up.component.scss'
})
export class ViewAccessionFollowUpComponent {
  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;
  
  //custom variable declare
  autoPrint:boolean=true;
  uniqueId: any;
  isResolve:boolean=false
  formValuesKeys:any
  permission: any
  details: any = [];
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
  departmentresp: any = [];
  userresp: any = []
  response:any;
  ticketId:any=[];
  editResp:any
  isEditForm:boolean=false

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
    this.uniqueId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 32;
    });
    if (this.permission.MenuPermission.View == true) {
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/follow-up/resolution-center']);
        return
      }
      this.getCommonList()
      this.getTicketDetail()
      this.getDepartmentList();
      this.getUserList();
    } else{
        this.router.navigate(['/lab/dashboard']);
    }
 
    this.ticketEditForm = this.formBuilder.group({});
    //.editModel()
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
   
  }
  
  
  printDiv(number: any) {
    const printContent = document.getElementById('contentToExport')!;
    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

    html2canvas(printContent, { scale: 3 }).then(canvas => {
      var imgData = canvas.toDataURL('image/png');
      var imgWidth = 210; 
      var pageHeight = 297;  
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

  
  

 
  //delete 
  deleteTicket() {
    this.ticketId.push(this.uniqueId)
    this.api
      .callApi(this.constant.commonAccession +
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
  modelEditOpen() {
    this.editModel();
    (function ($) {
      $('#editTicket').modal('show');
    })(jQuery);
  
  }

  //ticket details
  getTicketDetail() {
    this.api
      .callApi(this.constant.viewAccession +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.uniqueId)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.details = res
          this.response=res?.GetNewAccessionFollowUpDetailModel
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
  getCommonList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.status = res?.NewAccessionStageList
          this.servityList = res?.SeverityList
          //this.TicketTypeList = res?.TicketsTypeList
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  editModel() {
    this.api
      .callApi(
        this.constant.commonAccession +
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
        
          this.editResp = res
          const formValues: any = {};
        formValues['AccessionNumber'] = res['AccessionNumber'];
        formValues['Billtype'] = res['Billtype'];
        formValues['DatecollectedDate'] = res['DatecollectedDate'];
        formValues['DepartmentIdList'] = res['DepartmentIdList'];
        formValues['Isuser'] = res['Isuser'];
        formValues['Isdepartment'] = res['Isdepartment'];
        formValues['UserIdList'] = res['UserIdList'];
        formValues['Id'] = res['Id'];
        formValues['Other'] = res['Other'];
        formValues['Runcbc'] = res['Runcbc'];
        formValues['Runpt'] = res['Runpt'];
        formValues['Runua'] = res['Runua'];
        formValues['SpecimenType'] = res['SpecimenType'];
        formValues['Title'] = res['Title'];
        formValues['Type'] = res['Type'];
        formValues['Stage'] = res['Stage'];
        formValues['Severity'] = res['Severity'];

        Object.keys(res).forEach(key => {
          const checkboxKey = key + 'check';
          if (res.hasOwnProperty(checkboxKey) && res[checkboxKey]) {
            formValues[key] = res[key];
          }
        });
        if (res['Patientdob']) {
          formValues['Patientdob'] = new Date(res['Patientdob']);
        }
        if (res['Datecollected']) {
          formValues['Datecollected'] =  new Date(res['Datecollected']);
        }
  
        this.editResp=formValues
      
        Object.keys(formValues).forEach(key => {
          
          if (!this.ticketEditForm.get(key)) {
            this.ticketEditForm.addControl(key, new FormControl(formValues[key]));
          } else {
            this.ticketEditForm.get(key)?.setValue(formValues[key]);
          }  
          
        });
        
       
        // Update other properties or UI elements based on the response
        this.selectedUser = res.UserIdList;
        this.selectedDepartment = res.DepartmentIdList;
        this.userdropdownflag = res.Isdepartment ? 'none' : 'inline-block';
          this.selectedUser = resp.UserIdList;
          this.selectedDepartment = resp.DepartmentIdList;
          this.userdropdownflag = resp.Isdepartment == true ? 'none' : 'inline-block';
          this.isEditForm = true
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

    this.department?.filterChange
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

    this.userdropdown?.filterChange
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
  
  }
  showUser(id:any){
    // console.log("Getting Id", id);
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
  Resolvesubmit(){
    this.isResolve=true
    this.submit()
    this.isResolve=false
  }
  submit() {
    let body:any = {}
    
    Object.keys(this.ticketEditForm.controls).forEach(key => {
      // Check if the control is not null or undefined and assign its value to the body object 
        body[key] = this.ticketEditForm.get(key)?.value;
    });
    body.DepartmentIdList = this.selectedDepartment;
    body.UserIdList = this.selectedUser;
    body.Patientdob = this.datePipe.transform(this.ticketEditForm.get('Patientdob')?.value, 'MM/dd/yyyy');
    body.Datecollected = this.datePipe.transform(this.ticketEditForm.get('Datecollected')?.value, 'MM/dd/yyyy')
    const fieldsToRemove = [
      'AccessionNumber',
      'Billtype',
      'Other',
      'Runcbc',
      'Runpt',
      'Runua',
      'SpecimenType',
      'Title',
      'Type'
    ];
    
    // Remove specified fields from the body
    fieldsToRemove.forEach(field => delete body[field]);
  
    if(this.isResolve){
      const resolvedItem = this.status.find((item:any) => item.Value === 'Resolved');
      if (resolvedItem) {
        body.Stage = resolvedItem.Key;
      }
    }
      this.api
      .callApi(this.constant.commonAccession,body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          if (res.Status == 1) {
            this.ticketEditForm.reset();
            this.isSubmitted=false;
            this.getTicketDetail();
            this.closeModal('editTicket');
            this.isEditForm=false
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
    .callApi(this.constant.callLogAccession,body, 'POST', true, true)
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
}
