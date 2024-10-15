import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { AutoCompleteComponent } from '@progress/kendo-angular-dropdowns';
import { delay, from, map, switchMap, tap } from 'rxjs';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { DecimalFormatPipe } from 'src/app/shared/decimal-format.pipe';

@Component({
  selector: 'app-add-edit-recurring-order',
  templateUrl: './add-edit-recurring-order.component.html',
  styleUrl: './add-edit-recurring-order.component.scss'
})
export class AddEditRecurringOrderComponent implements OnInit , AfterViewInit {
  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;
  @ViewChild('errorMessageDiv') errorMessageDiv!: ElementRef;
  // Declare common Variable
  orderfrm:any=FormGroup;
  isSubmitted:any= false;
  orderresp:any=[];
  StateList:any=[];
  UserList:any=[];
  permission: any = '';
  uniqueid:any='';
  //Common Dropdown Lists
  userlist:any=[];
  physicianresp:any=[];
  physicianlist:any=[];
  disable:boolean=false;
  selectedAccount:any='';
  selectedUserid:any='';
  Message:any='';
  TotalAMount:any=0;
  ProductTotal:any=0;
  selectedRadio:any='';
  Frequencylist:any;
  DaysList:any=[];
  selectedDays:any=[]
  CustomDate: any = [new Date()];
  errMessage:any='';
  minStartDate: Date = new Date();
  minEndDate:any;
  CustomStartDateValidation:Date =new Date();

  CustomEndDateValidation:any= null 
  selectedClient:any={
    "AccountName": "",
    "Account": "",
    "AccountType": 0,
    "AccountTypeName": "",
    "Address1": "",
    "Address2": "",
    "City": "",
    "StateId": "",
    "CountryId": 0,
    "Zip": "",
    "PhysicianName": "",
    "ClientId": ""
  };


  // Array of month days (1 to 31)
  monthDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  productDetails:any='';
  productName:any='';
  physicianId:any='';


  constructor(private router: Router,private api: ApiService,private constant: ConstantService,private http:HttpClient,public activatedRoute: ActivatedRoute,  private formBuilder: FormBuilder,private common:CommonService,private toastr: ToastrService,private datePipe: DatePipe,public decimalpipe:DecimalFormatPipe){}

  ngOnInit(): void {
    this.uniqueid = this.activatedRoute.snapshot.params['id']!=undefined?this.common.DecryptID(this.activatedRoute.snapshot.params['id']):'';
    this.physicianId = this.activatedRoute.snapshot.params['pid']!=undefined?this.common.DecryptID(this.activatedRoute.snapshot.params['pid']):'';
    // console.log("Getting Physician" , this.physicianId);
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
      this.permission = permissions.find((item: any) => {
        return item.Type == 66;
      });

      this.orderfrm = this.formBuilder.group({
        ClientId: ['',[Validators.required]],
        address1: ['',[Validators.required]],
        State: ['',[Validators.required]],
        City: ['',[Validators.required]],
        Zip: ['',[Validators.required]],
        Startdate:['',[Validators.required]],
        Enddate:[''],
        Frequency:[null,[Validators.required]],
      })
      
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueid) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/logistic-central/recurring-order']);
    }
      if(this.uniqueid == ''){
        if (this.permission.MenuPermission.Add == true) {
          this.getNationalOrder();
          this.getPhysicianList();
          this.getUserList();
          this.getCommonData()
          if (this.physicianId !== '') {
            // console.log("Getting Value", this.physicianId);
            this.orderfrm.get('ClientId').setValue(this.physicianId);
            this.selectedAccount= this.physicianId;
            // this.accountchange();
          }
        }else{
          this.router.navigate(['/lab/dashboard']);
        }
      }else{
       
        if (this.permission.MenuPermission.Edit == true) {
          this.getCommonData()
          this.getPhysicianList();
          this.getUserList();
          this.getEditOrder();
        
        
        }else{
          this.router.navigate(['/lab/dashboard']);
        }
      }
     
      this.orderfrm.get('Startdate')?.valueChanges.subscribe((value:any) => {
        if (value) {
          this.minEndDate = value; 
          this.CustomStartDateValidation=this.orderfrm.get('Startdate').value
          if (this.CustomDate && this.CustomDate.length > 0) {
            this.CustomDate[0] = value; 
          }
        }
      });
     
          this.orderfrm.get('Enddate')?.valueChanges.subscribe((value:any) => {
            if (value) {
              
              this.CustomEndDateValidation =this.orderfrm.get('Enddate').value
            }
          });
  
  }
  onCustomDateChange(date: Date, index: number): void {
    // Update the minimum end date if the frequency is '4'
    
    if (this.orderfrm.get('Frequency').value == '4') {
      this.CustomEndDateValidation =this.orderfrm.get('Enddate').value
    this.CustomStartDateValidation=this.orderfrm.get('Startdate').value
    }
    else if(this.orderresp.Frequency == '4' && this.uniqueid !== ''){
    
      this.CustomStartDateValidation = this.orderresp.Startdate
      this.CustomEndDateValidation = this.orderresp.Enddate
    }
  }
  onStartDate(newDate: any) {
    if (newDate) {
        // this.minEndDate = this.CustomStartDateValidation = newDate;
        if (this.CustomEndDateValidation && newDate > this.CustomEndDateValidation) {
          this.CustomEndDateValidation = null;
          this.orderresp.Enddate='';
      }
        this.CustomDate = [newDate, ...(new Array(this.CustomDate.length - 1).fill(''))];
    }
}

onEndDate(newDate: any) {
    if (newDate) {
        this.CustomEndDateValidation = newDate;
    }
}


  
  getEditOrder(){
    this.api.callApi(
      this.constant.EditRecurringOrder+'?inputRequest='+encodeURIComponent(this.common.Encrypt(this.uniqueid)),
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      var resp=res;
      this.orderresp = resp;
      this.orderresp.Startdate = new Date(res.Startdate);
      this.orderresp.Enddate = resp.Enddate!=null?new Date(res.Enddate):null;
      this.isSubmitted=false;
      this.selectedRadio=resp.ShippingType;
      this.Message=resp.Message;
      if (this.orderresp.Frequency == '2') {
        this.DaysList.forEach((day:any) => {
          day.selected = resp.Days.includes(day.Key);
        });
      }
      else if (this.orderresp.Frequency == '3') {
        this.selectedDays = resp.Days.map((day:any) => parseInt(day)); 
      }
      else if (this.orderresp.Frequency == '4') { 
        this.CustomDate=[];
        this.CustomDate = resp.CustomDates.map((date: any) => new Date(date));
        this.CustomStartDateValidation = this.orderresp.Startdate
        this.CustomEndDateValidation = this.orderresp.Enddate
      }
      
      // this.onStartDate(this.orderresp.Startdate);
      this.onEndDate(this.orderresp.Enddate);
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  setProductDetails(name: string, details: string) {
    this.productDetails = details;
    this.productName = name;
  }


  getNationalOrder(){
    this.api.callApi(
      this.constant.commonRecurringOrder,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      var resp=res;
      this.orderresp = resp;
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  getPhysicianList(){
    this.api.callApi(
      this.constant.commonPhysicianList,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      var resp=res;
      this.physicianresp = resp;
      this.physicianlist=this.physicianresp.length != 0 ? this.physicianresp.slice() : this.physicianresp;
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  getStateList(){
    this.api.callApi(
      this.constant.GetStateList+'?inputRequest='+encodeURIComponent(this.common.Encrypt(this.selectedClient?.CountryId)),
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.StateList=res;
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  getUserList(){
    this.api
      .callApi(
        this.constant.getNCUserlist,
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.UserList=res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  accountchange(){
    // console.log("Getting selectedAccount", this.selectedAccount);
    var clientSelect = this.physicianlist.find((item:any) => item.Account === this.selectedAccount);
    var selectClient = {
      "AccountName": "",
      "Account": "",
      "AccountType": 0,
      "AccountTypeName": "",
      "Address1": "",
      "Address2": "",
      "City": "",
      "StateId": "",
      "CountryId": 0,
      "Zip": "",
      "PhysicianName": "",
      "ClientId": ""
    }
    if(this.selectedAccount == '' || this.selectedAccount == undefined || clientSelect == undefined){
      // console.log("Getting clientselect", this.selectedAccount , clientSelect , this.physicianlist);
      this.autoComplete.value='';
      this.selectedClient=selectClient;
    }else{
    this.selectedClient = clientSelect !== undefined?clientSelect:selectClient;
    this.selectedClient.CountryId =  this.selectedClient.CountryId === 0 ? AppSettingsService.CountryId() : this.selectedClient.CountryId;
    this.selectedClient.StateId = this.selectedClient.StateId == 0 ? '' : this.selectedClient.StateId;
    this.getStateList();
   }
  }

  ngAfterViewInit(): void {
      // filter autocomplete account list
      const contains = (Account:any) => (s:any) => s.Account.toLowerCase().indexOf(Account.toLowerCase()) !== -1;

      this.autoComplete?.filterChange
        .asObservable()
        .pipe(
          switchMap((Account:any) =>
            from([this.physicianresp]).pipe(
              tap(() => (this.autoComplete.loading = true)),
              delay(100),
              map((data:any) => data.filter(contains(Account)))
            )
          )
        )
        .subscribe((x) => {
          this.physicianlist = x;
          this.autoComplete.loading = false;
        });
  }

  get f() { return this.orderfrm.controls; }
  getCommonData(){
    this.api.callApi(
      this.constant.MasterDetails,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      const resp=res;
      this.Frequencylist=resp.RecurringOrderFrequencyList;
      this.DaysList = resp.RecurringorderDayList;
      this.DaysList.map((e: any) => (e.selected = false));
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  toggleSelected(day: number): void {
    const index = this.selectedDays?.indexOf(day);
    if (index === -1) {
      // Day is not selected, so add it to the selectedDays array
      this.selectedDays?.push(day);
   
    } else {
      // Day is already selected, so remove it from the selectedDays array
      this.selectedDays.splice(index, 1);
 
    }
  }

  isSelected(day: number): boolean {
    return this.selectedDays?.includes(day);
    
  }
  
  addMore() {
    const hasBlankDate = this.CustomDate.some((date:any) => !date);
    if (hasBlankDate) {
      this.toastr.error('Please ensure all custom date fields are filled before adding a new one.', 'Access Med Lab');
      return;
    }

    this.CustomDate.push(null);
}

  removeCount(index:number){
    this.CustomDate.splice(index,1);
  }

  onUpdate(){
    let body={};
    let productDetailsFiltered = this.orderresp.Products
    .map((resp: any) => resp.Products.filter((r1: any) => r1.Quantity > 0))
    .flat()
    .map((product: any) => ({ ProductId: product.Id, Quantity: product.Quantity }));
    if (!productDetailsFiltered.length) {
      this.toastr.error('Please enter a quantity greater than 0 for at least one product.', 'Access Med Lab');
      return;
    }
    else if (!this.selectedRadio) {
      this.toastr.error('Please select a shipping method.', 'Access Med Lab');
      return;
    }
    if(this.orderresp.Frequency == '2' && this.isAnyDaySelected() ){
      this.errorMessageDiv.nativeElement.focus();
        this.errorMessageDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.errMessage='Please select at least one day';
      return
    }
    if(this.orderresp.Frequency == '3' && this.selectedDays.length <=0){
      this.errorMessageDiv.nativeElement.focus();
      this.errorMessageDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return
    }
    if(this.orderresp.Frequency == '4' && this.isAnyNullCheck()){
      this.errorMessageDiv.nativeElement.focus();
        this.errorMessageDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.errMessage='Please select Date';
      return
    }
    
      else{
        this.errMessage='';
        
        var days:any=[], customdate:any=[];
        if(this.orderresp.Frequency == '2'){
          days= this.DaysList.filter((day: any) => day.selected).map((day: any) => day.Key);
        
        }
        else if(this.orderresp.Frequency == '3'){
          days = this.selectedDays;
        }
        else if (this.orderresp.Frequency == '4') {
          customdate=this.CustomDate.map((date: any) => this.datePipe.transform(date, 'MM/dd/yyyy'));
        }      
        else{
          days=[];
          customdate=[];
        }
      
      body={
        Id:this.uniqueid,
        Products: productDetailsFiltered,
        ShippingMethod:this.selectedRadio,
        Message:this.Message,
        Days:days,
        CustomDates:customdate,
        Startdate: this.datePipe.transform(this.orderresp.Startdate, 'MM/dd/yyyy'),
        Enddate: this.datePipe.transform(this.orderresp.Enddate, 'MM/dd/yyyy'),
        Frequency: this.orderresp.Frequency,
      }
      // console.log("Getting Body", body);
      this.api
      .callApi(this.constant.updateRecurringOrder, body , 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          //this.salesEMRForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.router.navigate(['/lab/logistic-central/recurring-order']);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }
  }
  isAnyDaySelected(): boolean {
    return !this.DaysList.some((day:any) => day.selected);
  }

  isAnyNullCheck():boolean {
    return this.CustomDate.some((date:any) => date === null || date == '');
  }
  changeFrequance(e:any){
    const fr=e.target.value;
    if(fr == '2' && this.isSubmitted == true){
      this.selectedDays=[];
    }
    else if(fr == '3' && this.isSubmitted == true){
      this.DaysList.map((e: any) => (e.selected = false));
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    let productDetailsFiltered = this.orderresp.ProductDetails
      .map((resp: any) => resp.Products.filter((r1: any) => r1.Quantity > 0))
      .flat()
      .map((product: any) => ({ ProductId: product.Id, Quantity: product.Quantity }));
  
    if (this.isSubmitted && this.f.ClientId?.errors?.required) {
      this.autoComplete.focus();
      return;
    } else if (this.orderfrm.invalid) {
      return;
    }
  
    switch (this.orderfrm.value.Frequency) {
      case '2':
        if (this.isAnyDaySelected()) {
          this.displayError('Please select at least one day');
          return;
        }
        break;
      case '3':
        if (this.selectedDays.length <= 0) {
          this.displayError('');
          return;
        }
        break;
      case '4':
        if (this.isAnyNullCheck()) {
          this.displayError('Please select Date');
          return;
        }
        break;
    }
  
    if (!productDetailsFiltered.length) {
      this.toastr.error('Please enter a quantity greater than 0 for at least one product.', 'Access Med Lab');
      return;
    }
  
    if (!this.selectedRadio) {
      this.toastr.error('Please select a shipping method.', 'Access Med Lab');
      return;
    }
  
    let body = this.prepareRequestBody(productDetailsFiltered);
    this.api.callApi(this.constant.AddRecurringOrder, body, 'POST', true, true)
      .subscribe(
        (res: any) => {
          this.toastr.success(res.Message, 'Access Med Lab');
          this.router.navigate(['/lab/logistic-central/recurring-order']);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  
  displayError(message: string) {
    this.errorMessageDiv.nativeElement.focus();
    this.errorMessageDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.errMessage = message;
  }
  
  prepareRequestBody(productDetailsFiltered: any) {
    let days: any[] = [], customdate: any[] = [];
    switch (this.orderfrm.value.Frequency) {
      case '2':
        days = this.DaysList.filter((day: any) => day.selected).map((day: any) => day.Key);
        break;
      case '3':
        days = this.selectedDays;
        break;
      case '4':
        customdate = this.CustomDate.map((date: any) => this.datePipe.transform(date, 'MM/dd/yyyy'));
        break;
    }
  
    return {
      Products: productDetailsFiltered,
      ShippingMethod: this.selectedRadio,
      Message: this.Message,
      Address1: this.selectedClient.Address1,
      Address2: this.selectedClient.Address2,
      City: this.selectedClient.City,
      CountryId: this.selectedClient.CountryId,
      StateId: this.selectedClient.StateId,
      Salesrepid: this.selectedUserid,
      Zip: this.selectedClient.Zip,
      ClientId: this.selectedClient.ClientId,
      Days: days,
      CustomDates: customdate,
      Startdate: this.datePipe.transform(this.orderfrm.value.Startdate, 'MM/dd/yyyy'),
      Enddate: this.datePipe.transform(this.orderfrm.value.Enddate, 'MM/dd/yyyy'),
      Frequency: this.orderfrm.value.Frequency,
    };
  }
  
}
