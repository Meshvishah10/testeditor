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
  selector: 'app-view-tickets',
  templateUrl: './view-tickets.component.html',
  styleUrl: './view-tickets.component.scss'
})
export class ViewTicketsComponent implements OnInit , AfterViewInit {
  @ViewChild("department") public department!: MultiSelectComponent;
  @ViewChild("userdropdown") public userdropdown!: MultiSelectComponent;
  
  //custom variable declare
  autoPrint:boolean=true;
  uniqueId: any;
  permission: any
  details: any = [];
  ticketType: any;
  apiEndPoint: any;
  ticketId: any[] = [];
  ticketEditForm: any  = FormGroup;
  showUserFrm :any = FormGroup;
  isSubmitted: any = false;
  departmentList: any;
  userList: any;
  servityList: any;
  status: any;
  approvalStatus: any;
  callLogAddForm:any = FormGroup;
  selectedDepartment: any = [];
  selectedUser: any = [];
  userdropdownflag: any = 'none';
  customvalidation: string = '';
  ticket_number:any='';
  departmentresp: any = [];
  userresp: any = []

  detailapiendpoint:any='';
  addCallAPiEndPoint:any='';
  customArrayField: any[] = [];
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
      other:['']
    });

    this.callLogAddForm = this.formBuilder.group({
      Ticketcentralid: this.uniqueId,
      note: ['', [Validators.required]],
    });

    this.showUserFrm = this.formBuilder.group({
      username: new FormControl({ value: '', disabled: true }, Validators.required),
      fullname: new FormControl({ value: '', disabled: true }, Validators.required),
      email: new FormControl({ value: '', disabled: true }, [Validators.required]),
      deptid: new FormControl({ value: '', disabled: true }, Validators.required),
      createddate: new FormControl({ value: '', disabled: true }, Validators.required),
    })

     // Subscribe to changes in the 'Title' control
    this.ticketEditForm.get('Title').valueChanges.subscribe((value:any) => {
      // Check if 'Title' is 'other' and set 'other' control as required accordingly
      if (value?.toLowerCase() === 'other') {
        this.ticketEditForm.get('other').setValidators([Validators.required]);
      } else {
        // If 'Title' is not 'other', remove the 'required' validator from 'other' control
        this.ticketEditForm.get('other').clearValidators();
      }
      // Update the validation status of 'other' control
      this.ticketEditForm.get('other').updateValueAndValidity();
    });


    this.uniqueId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';
    this.ticketType = this.activatedRoute.snapshot.params['type'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['type']) : '';
    this.ticket_number = this.activatedRoute.snapshot.params['number'] !== undefined ? this.activatedRoute.snapshot.params['number'] : '';
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Title == this.ticketType;
    });
    if (this.permission?.MenuPermission.View == true) {
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/ticket-resolution']);
        return
      }
      this.setApiEndPoint();
      this.getTicketDetail();
      this.getDepartmentList();
      this.getUserList();
      this.getStateAndTicketTypeList();
      
    }else{
    
        this.router.navigate(['/lab/dashboard']);
   
    }
  }

  setApiEndPoint(){
    //set global details array
    this.customArrayField = [
      { key: 'Title', value: this.details?.NCTicketCentralDetailModel?.Title },
      { key: 'Account', value: this.details?.NCTicketCentralDetailModel?.Account },
      { key: 'Contact', value: this.details?.NCTicketCentralDetailModel?.Contactname },
      { key: 'Assigned To', value: this.details?.NCTicketCentralDetailModel?.AssignedBy},
      { key: 'Severity', value: this.details?.NCTicketCentralDetailModel?.SeverityText },
      { key: 'Status', value: this.details?.NCTicketCentralDetailModel?.StageText},
      { key: 'Submitted User ID', value: this.details?.NCTicketCentralDetailModel?.SubmittedBy},
      { key: 'Log Call', value: this.details?.NCTicketCentralDetailModel?.LogCall },
      { key: 'Logged Date', value: this.details?.NCTicketCentralDetailModel?.LoggedDate !== undefined? this.datePipe.transform(new Date(this.details?.NCTicketCentralDetailModel?.LoggedDate) , 'MM/dd/yyyy') : ''},      
    ];

    switch (this.ticketType) {
      case 'Complaints':
        this.apiEndPoint = this.constant.commonComplaints;
        this.detailapiendpoint = this.constant.getComplaintDetails;
        this.addCallAPiEndPoint = this.constant.ComplaintCallLog;
        // this.ticketEditForm.addControl('ApprovalStatus', this.formBuilder.control('', Validators.required));
       
        break;

      case 'IT/EMR Issues':
        this.apiEndPoint = this.constant.commonITIssue;
        this.detailapiendpoint = this.constant.getITIssueDetails;
        this.addCallAPiEndPoint = this.constant.ITIssueCallLog;
        break;

      case 'Client Billing/Account Billing Ticket':
        this.apiEndPoint = this.constant.commonClientBilling;
        this.detailapiendpoint = this.constant.getClientBillingDetails;
        this.addCallAPiEndPoint = this.constant.ClientBillingCallLog;
        break;

      case 'Patient Question':
        this.apiEndPoint = this.constant.commonPatientQuestion;
        this.detailapiendpoint = this.constant.getPatientQuestionDetails;
        this.addCallAPiEndPoint = this.constant.PatientQuestionCallLog;
        break;

      case 'Sales Calls':
        this.apiEndPoint = this.constant.commonSalesCall;
        this.detailapiendpoint = this.constant.getSalesCallDetails;
        this.addCallAPiEndPoint = this.constant.SaleCallLog;
        break;

      case 'Nationals Calls':
        this.apiEndPoint = this.constant.commonNationalCall;
        this.detailapiendpoint = this.constant.getNationalCallDetails;
        this.addCallAPiEndPoint = this.constant.NationalCallLog;
        break;

      case 'Centrifuge Issues':
        this.apiEndPoint = this.constant.commonCentrifugeIssue;
        this.detailapiendpoint = this.constant.getCentrifugeIssueDetails;
        this.addCallAPiEndPoint = this.constant.CentrifugeIssueCallLog;
        break;

      case 'Lab Technical Questions':
        this.apiEndPoint = this.constant.commonLabTechnical;
        this.detailapiendpoint = this.constant.LabTechnicalDetails;
        this.addCallAPiEndPoint = this.constant.LabTechnicalCallLog;
        break;

      case 'EMR Request':
        this.apiEndPoint = this.constant.commonEMRRequest;
        this.detailapiendpoint = this.constant.EMRRequestDetails;
        this.addCallAPiEndPoint = this.constant.EMRRequestCallLog;
        this.ticketEditForm.addControl('ApprovalStatus', this.formBuilder.control('', Validators.required));
        this.customArrayField.push(
          { key: 'Approval Status', value: this.details?.NCTicketCentralDetailModel?.ApprovalStatusText},
          { key: 'Client Account Number', value: this.details?.NCTicketCentralDetailModel?.Clientaccontnumber },
          { key: 'Demographic Bridge', value: this.details?.NCTicketCentralDetailModel?.Demographicbridge },
          { key: 'Insurance Table Needed', value: this.details?.NCTicketCentralDetailModel?.Insurancetableneeded },
          { key: 'Laboratory Contact Email', value: this.details?.NCTicketCentralDetailModel?.Laboratorycontactemail },
          { key: 'Laboratory Contact Name', value: this.details?.NCTicketCentralDetailModel?.Laboratorycontactname },
          { key: 'Laboratory Contact Phone', value: this.details?.NCTicketCentralDetailModel?.Laboratorycontactphone },
          { key: 'Logged Date', value: this.details?.NCTicketCentralDetailModel?.LoggedDate },
          { key: 'Multiple Practice Location', value: this.details?.NCTicketCentralDetailModel?.Multiplepracticelocation },
          { key: 'Office Manager Email', value: this.details?.NCTicketCentralDetailModel?.Officemanageremail },
          { key: 'Office Manager Name', value: this.details?.NCTicketCentralDetailModel?.Officemanagername },
          { key: 'Office Manager Phone', value: this.details?.NCTicketCentralDetailModel?.Officemanagerphone },
          { key: 'Orders and Results', value: this.details?.NCTicketCentralDetailModel?.Ordersandresults },
          { key: 'Physician Name and Client Number', value: this.details?.NCTicketCentralDetailModel?.Physiciannameandclientnumber },
          { key: 'Physicians in Practice', value: this.details?.NCTicketCentralDetailModel?.Physiciansinpractice },
          { key: 'Practice Address', value: this.details?.NCTicketCentralDetailModel?.Practiceaddress },
          { key: 'Practice Location', value: this.details?.NCTicketCentralDetailModel?.Practicelocation },
          { key: 'Practice Name', value: this.details?.NCTicketCentralDetailModel?.Practicename },
          { key: 'Practice Office Hours', value: this.details?.NCTicketCentralDetailModel?.Practiceofficehours },
          { key: 'Practice Office Informed', value: this.details?.NCTicketCentralDetailModel?.Practiceofficeinformed },
          { key: 'Practice Phone', value: this.details?.NCTicketCentralDetailModel?.Practicephone },
          { key: 'Quote Needed', value: this.details?.NCTicketCentralDetailModel?.Quoteneeded },
          { key: 'Requested By', value: this.details?.NCTicketCentralDetailModel?.Requestedby },
          { key: 'Requested Date', value: this.details?.NCTicketCentralDetailModel?.Requesteddate },
          { key: 'Results Only Default', value: this.details?.NCTicketCentralDetailModel?.Resultsonlydefault },
          { key: 'Technical Contact Email', value: this.details?.NCTicketCentralDetailModel?.Technicalcontactemail },
          { key: 'Technical Contact Person', value: this.details?.NCTicketCentralDetailModel?.Technicalcontactperson },
          { key: 'Technical Contact Phone', value: this.details?.NCTicketCentralDetailModel?.Technicalcontactphone },
          { key: 'Type ID', value: this.details?.NCTicketCentralDetailModel?.TypeId },
          { key: 'Vendor Contact', value: this.details?.NCTicketCentralDetailModel?.Vendorcontact },
          { key: 'Vendor Email', value: this.details?.NCTicketCentralDetailModel?.Vendoremail },
          { key: 'Vendor Name', value: this.details?.NCTicketCentralDetailModel?.Vendorname },
          { key: 'Vendor Phone', value: this.details?.NCTicketCentralDetailModel?.Vendorphone },
          { key: 'Quote needed?', value: this.details?.NCTicketCentralDetailModel?.Quoteneeded },
          { key: 'Results only DEFAULT (Uni-directional)', value: this.details?.NCTicketCentralDetailModel?.Resultsonlydefault },
          { key: 'Orders & results (Bi-Directional)', value: this.details?.NCTicketCentralDetailModel?.Ordersandresults },
          { key: 'Demographic Bridge', value: this.details?.NCTicketCentralDetailModel?.Demographicbridge },
          { key: 'Has the practice office been informed that Comtron will be contacting them?', value: this.details?.NCTicketCentralDetailModel?.Practiceofficeinformed },
          { key: 'How many physicians are in the practice?', value: this.details?.NCTicketCentralDetailModel?.Physiciansinpractice },
          { key: 'Is an insurance translation table needed? (For Insurance bill accounts)', value: this.details?.NCTicketCentralDetailModel?.Insurancetableneeded },
          { key: 'Are there multiple practice locations? If so how many?', value: this.details?.NCTicketCentralDetailModel?.Practicelocation },
        );
        
        this.customArrayField = this.customArrayField.filter((field: any) => {
          return field.key !== 'Contact' && field.key !== 'Log Call' && field.key !== 'Account';
        });
        
     
        break;

      case 'COMP Request':
        this.apiEndPoint = this.constant.commonCompRequest;
        this.detailapiendpoint = this.constant.CompRequestDetails;
        this.addCallAPiEndPoint = this.constant.CompRequestCallLog;
        this.ticketEditForm.addControl('ApprovalStatus', this.formBuilder.control('', Validators.required));
        this.customArrayField.push(
          { key: 'Approval Status', value: this.details?.NCTicketCentralDetailModel?.ApprovedStatusText },
          { key: 'Comp Type', value: this.details?.NCTicketCentralDetailModel?.CompTypeText },
          )

          this.customArrayField = this.customArrayField.map(field=> {   if (field.key === 'Contact') {
            // Replace 'Contact' key with 'Account Name'
            return { key: 'Account Name', value: field.value };
          } else {
            // Keep other fields as is
            return field;
          } });
            // console.log("Getting arrray", this.customArrayField);
        break;

      default:
        break;
    }
  }

  //list ticket details
  getTicketDetail() {
    this.api
      .callApi(this.detailapiendpoint +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.uniqueId)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.details = res
          this.setApiEndPoint();
          if(this.details.NCTicketCentralDetailModel.Miscoption){
            this.customArrayField.push({key: 'Other Value' , value: this.details.NCTicketCentralDetailModel.Miscoption});
          }
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
      .callApi(this.apiEndPoint +
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
            this.router.navigate([`/lab/ticket-resolution`])
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
        this.apiEndPoint +
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
            ApprovalStatus: resp?.ApprovalStatus,
            other : resp?.Miscoption
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
          this.servityList = res?.SeverityList
            ,
            this.status = res?.TicketStageList
          this.approvalStatus = res?.TicketApprovalStatusList;
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
        Severity:  this.ticketEditForm.value.Severity,
        Stage:  this.ticketEditForm.value.Stage,
        ApprovalStatus:  this.ticketEditForm?.value?.ApprovalStatus,
        Miscoption: this.ticketEditForm?.value?.other
      };
      this.api
      .callApi(this.apiEndPoint,body, 'PUT', true, true)
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
      Ticketcentralid: this.uniqueId,
      note: this.callLogAddForm.value.note, 
    };
    this.api
    .callApi(this.addCallAPiEndPoint,body, 'POST', true, true)
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
      doc.save(`ticket_${number}.pdf`);

    });
  }
}
