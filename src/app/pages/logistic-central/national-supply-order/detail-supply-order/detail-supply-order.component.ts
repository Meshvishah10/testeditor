import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
// import html2canvas from 'html2canvas';
import { OrderDetails, historyDetails } from 'src/app/models/nationalSupplyOrder.model';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import html2canvas from 'html2canvas';
// import { pdf } from '@progress/kendo-drawing';

declare var jQuery: any;
@Component({
  selector: 'app-detail-supply-order',
  templateUrl: './detail-supply-order.component.html',
  styleUrl: './detail-supply-order.component.scss'
})
export class DetailSupplyOrderComponent {
  orderId:any;
  details:any = '';
  clientId:any
  autoPrint:boolean=true;
  message:string = ''
  previousHistory:any = ''
  permission:any
  minStartDate: Date = new Date();
  minEndDate:Date  = new Date();
  CustomStartDateValidation:Date =new Date();

  CustomEndDateValidation:any= null 
  requestPayload: any = {
    Page: 1,
    PageSize: 10,
    Sorts: null,
    Filters: null,
    CustomSearch: '',
    Stage: null,
    Orderno: null,
    Accountno: null,
    orderdate:null,
  };
  public state: State = {
    skip: 0,
    take: 10,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  };

  updateAddress:boolean=false;
  orderfrm:any=FormGroup;
  recurringOrder:any=FormGroup;
  isSubmitted:any= false;
  StateList:any=[];

  DaysList:any=[];
  Frequencylist:any=[];
  selectedDays: number[] = [];
  CustomDate: (Date | null)[] = [new Date()];
  CustomCount:any=0;

  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService,
    private router: Router,
    private datePipe: DatePipe
  ) {}
  ngOnInit(){
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 23;
    });
    this.orderId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : ''
    if (this.permission.MenuPermission.View == true) {
      this.supplyOrderDetail();
      this.getCommonData();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }

    this.orderfrm = this.formBuilder.group({
      address1: ['',[Validators.required]],
      address2: [''],
      State: ['',[Validators.required]],
      City: ['',[Validators.required]],
      Zip: ['',[Validators.required]],
    })

    this.recurringOrder = this.formBuilder.group({
      Startdate:['',[Validators.required]],
      Enddate:[''],
      Frequency:[null,[Validators.required]],
    })
    this.recurringOrder.get('Startdate')?.valueChanges.subscribe((value:any) => {
      if (value) {
        this.minEndDate = value; 
        if (this.CustomDate && this.CustomDate.length > 0) {
          this.CustomDate[0] = value; 
        }
      }
    });
    this.recurringOrder.get('Enddate')?.valueChanges.subscribe((value:any) => {
          if (value) {
            this.CustomEndDateValidation =this.recurringOrder.get('Enddate').value
          }
        });
  }
  onCustomDateChange(date: Date, index: number): void {
    // Update the minimum end date if the frequency is '4'
    if (this.recurringOrder.get('Frequency').value === '4') {
      this.CustomEndDateValidation =this.recurringOrder.get('Enddate').value
    this.CustomStartDateValidation=this.recurringOrder.get('Startdate').value
   
    }
  }
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

  supplyOrderDetail(){
    if (this.activatedRoute.snapshot.params['id'] && !this.orderId) {
      this.toastr.error('Invalid Request.');
      this.router.navigate(['/lab/logistic-central/national-order']);
      return
  }
    this.api
          .callApi(this.constant.orderDetail+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
          .subscribe(
            (res: OrderDetails) => {
          
              this.details = res;
              this.clientId=this.details.ClientId;
              const textarea = document.getElementById('SpecialRequest') as HTMLTextAreaElement;
              textarea.value = this.details.SpecialRequest;
              textarea.style.height = 'auto'; // Reset height to auto
              textarea.style.height = textarea.scrollHeight + 'px'; // Set height to scrollHeight

              const textarea1 = document.getElementById('SpecialMessage') as HTMLTextAreaElement;
              textarea1.value = this.details.Message;
              textarea1.style.height = 'auto'; // Reset height to auto
              textarea1.style.height = textarea1.scrollHeight + 'px'; // Set height to scrollHeight

              const textarea2 = document.getElementById('SpecialRequest1') as HTMLTextAreaElement;
              textarea2.value = this.details.SpecialRequest.trim(); // Remove leading/trailing blank lines
              textarea2.style.height = 'auto'; // Reset height to auto
              textarea2.style.height = textarea2.scrollHeight + 'px'; // Set height to scrollHeight              

              const textarea3 = document.getElementById('SpecialMessage1') as HTMLTextAreaElement;
              textarea3.value = this.details.Message;
              textarea3.style.height = 'auto'; // Reset height to auto
              textarea3.style.height = textarea3.scrollHeight + 'px'; // Set height to scrollHeight
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }

  adjustTextareaHeight(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset height to auto
    textarea.style.height = textarea.scrollHeight + 'px'; // Set height to scrollHeight
  }

  getStateList(){
    this.api.callApi(
      this.constant.GetStateList+'?inputRequest='+encodeURIComponent(this.common.Encrypt(AppSettingsService.CountryId())),
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      //console.log("Getting res", res);
      this.StateList=res;
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  checkboxchange(e:any){
    if (e.target.checked) {
      this.getStateList();
    }
  }
  
  printDiv() {
    // Convert both textareas to divs
    const div1 = this.convertTextareaToDiv();
    const div2 = this.convertTextareaToDiv1();
    
    const printContent = document.getElementById('printContent')!;

    // Capture the content using html2canvas
    html2canvas(printContent, { scale: 2 }).then(canvas => {
        const imageDataUrl = canvas.toDataURL('image/png');
        
        const printWindow = window.open();
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write('<html><head><title>AML OrderDetail</title></head><body>');
            
            // Add custom CSS for print
            printWindow.document.write(`
                <style>
                    @page {
                        size: landscape;
                        margin: 0;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }

                    .content {
                        display: block;
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        text-align: center;
                    }

                    img {
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                        page-break-inside: avoid;
                    }

                    /* Hide empty pages */
                    @media print {
                        html, body {
                            width: 100%;
                            height: auto;
                            overflow: hidden;
                        }
                        body:empty {
                            display: none;
                        }
                    }
                </style>
            `);

            // Add the content image
            printWindow.document.write(`<div class="content"><img src="${imageDataUrl}" /></div>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            // Ensure content is fully loaded before triggering print
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 100);
        }

        // Revert both divs back to textareas
        this.revertDivToTextarea();
        this.revertDivToTextarea1();
    });
}



   
  
  revertDivToTextarea() {
    const textarea = document.getElementById('SpecialRequest1') as HTMLTextAreaElement;
    const div = document.getElementById('printableContent');
    
    // Remove the div and show the textarea again
    if (div) {
      div.remove();
    }
    textarea.style.display = 'block';
  }
  
  revertDivToTextarea1() {
    const textarea = document.getElementById('SpecialMessage1') as HTMLTextAreaElement;
    const div = document.getElementById('printableContent1');
    
    // Remove the div and show the textarea again
    if (div) {
      div.remove();
    }
    textarea.style.display = 'block';
  }
  
  convertTextareaToDiv() {
    // Get the textarea and its content
    const textarea = document.getElementById('SpecialRequest1') as HTMLTextAreaElement;
    const content = textarea.value;
  
    // Create a div to hold the content
    const div = document.createElement('div');
    div.id = 'printableContent';
    div.style.whiteSpace = 'pre-wrap'; // Maintain line breaks and whitespaces
    div.style.width = textarea.style.width;
    div.style.height = textarea.style.height;
    div.style.border = '1px solid grey'; // Add border to the div
    div.style.padding = '10px'; // Optional padding to make it look better
    div.innerText = content;
  
    // Insert the div right after the textarea
    textarea.parentNode?.insertBefore(div, textarea.nextSibling);
  
    // Hide the original textarea
    textarea.style.display = 'none';
  
    return div;
  }
  
  convertTextareaToDiv1() {
    // Get the textarea and its content
    const textarea = document.getElementById('SpecialMessage1') as HTMLTextAreaElement;
    const content = textarea.value;
  
    // Create a div to hold the content
    const div = document.createElement('div');
    div.id = 'printableContent1';
    div.style.whiteSpace = 'pre-wrap'; // Maintain line breaks and whitespaces
    div.style.width = textarea.style.width;
    div.style.height = textarea.style.height;
    div.style.border = '1px solid grey'; // Add border to the div
    div.style.padding = '10px'; // Optional padding to make it look better
    div.innerText = content;
  
    // Insert the div right after the textarea
    textarea.parentNode?.insertBefore(div, textarea.nextSibling);
  
    // Hide the original textarea
    textarea.style.display = 'none';
  
    return div;
  }
  
    // printDiv() {
    //   pdf.saveAs('invoice.pdf')
    // }

  previousOrderHistory(){
    this.api
          .callApi(this.constant.previousOrderHistory+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.clientId)), [], 'GET', true, true)
          .subscribe(
            (res: historyDetails) => {
             this.previousHistory = res;
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }
  duplicateOrder(){
    this.api
          .callApi(this.constant.duplicateOrder+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'POST', true, true)
          .subscribe( 
            (res: any) => {
              if (res.Status == 1) {    
                this.modelDuplicateClose()
                this.toastr.success(
                  res.Message,
                  'Access Med Lab'
                );
                this.router.navigate([`/lab/logistic-central/national-order`])
              }
              
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }
  modelDuplicateClose() {
    (function ($) {
      $("#duplicate").modal("hide");
    })(jQuery);
   
  }
  onUpdateMessage() {
    if (this.message == '') {
      return;
    } else {
      let body = {
        OrderId: this.orderId,
        Message: this.message,
      };
      this.api
        .callApi(this.constant.updateMessage, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.message = '';
            this.supplyOrderDetail()
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  get f() { return this.orderfrm.controls; }

  get r() { return this.recurringOrder.controls; }

  UpdateAddress(){
    this.isSubmitted=true;
    if(this.orderfrm.invalid){
      return
    }else{
      var body={
        Address1:this.orderfrm.value.address1,
        Address2:this.orderfrm.value.address2,
        City:this.orderfrm.value.City,
        StateId:this.orderfrm.value.State,
        Zip:this.orderfrm.value.Zip,
        OrderId:this.orderId
      }
      this.api
      .callApi(this.constant.updateaddress, body , 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.orderfrm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.updateAddress=false;
          this.supplyOrderDetail();
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }
  }

  toggleSelected(day: number): void {
    const index = this.selectedDays.indexOf(day);
    if (index === -1) {
      // Day is not selected, so add it to the selectedDays array
      this.selectedDays.push(day);
    } else {
      // Day is already selected, so remove it from the selectedDays array
      this.selectedDays.splice(index, 1);
    }
  }

  isSelected(day: number): boolean {
    return this.selectedDays.includes(day);
  }

  addMore() {
    this.CustomDate.push(new Date());
}

  removeCount(index:number){
    this.CustomDate.splice(index,1);
  }

  changeFrequance(e:any){
    // console.log("Getting Frequancy", e.target.value);
    const fr=e.target.value;
    if(fr == '2'){
      this.selectedDays=[];
    }
    else if(fr == '3'){
      this.DaysList.map((e: any) => (e.selected = false));
    }
  }

  isAnyDaySelected(): boolean {
    // console.log("FUnction calling!!" , this.DaysList.some((day:any) => day.selected));
    return !this.DaysList.some((day:any) => day.selected);
  }

  isAnyNullCheck():boolean {
    // console.log("FUnction calling!!" , !this.CustomDate.some((date:any) => date == null));
    return this.CustomDate.some((date:any) => date == null);
  }


  CreateReOrder(){
    this.isSubmitted=true;
    // console.log("Getting CustomDate", this.CustomDate);
    if(this.recurringOrder.invalid){
      return
    }
    else if(this.recurringOrder.value.Frequency == '2' && this.isAnyDaySelected()){
      return
    }
    else if(this.recurringOrder.value.Frequency == '3' && this.selectedDays.length <=0){
      return
    }
    else if(this.recurringOrder.value.Frequancy == '4' && this.isAnyNullCheck()){
      return
    }
    else{
      // console.log("Getting Form Value" , this.recurringOrder.value);
      var days:any=[], customdate:any=[];
      if(this.recurringOrder.value.Frequency == '2'){
        days= this.DaysList.filter((day: any) => day.selected).map((day: any) => day.Key);
      }
      else if(this.recurringOrder.value.Frequency == '3'){
        days = this.selectedDays;
      }
      else if (this.recurringOrder.value.Frequency == '4') {
        customdate=this.CustomDate.map((date: any) => this.datePipe.transform(date, 'MM/dd/yyyy'));
      }      
      else{
        days=[];
        customdate=[];
      }
      const body={
        Orderid:this.orderId,
        Startdate:this.datePipe.transform(this.recurringOrder.value.Startdate, 'MM/dd/yyyy'),
        Enddate:this.datePipe.transform(this.recurringOrder.value.Enddate, 'MM/dd/yyyy'),
        Frequency:this.recurringOrder.value.Frequency,
        Days:days,
        CustomDates:customdate
      }
      this.api
      .callApi(this.constant.CreateRecurringOrder, body , 'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.closeRecurring()
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }
  }

  closeRecurring(){
    this.recurringOrder.reset();
    this.selectedDays=[];
    this.CustomDate=[];
    (function ($) {
      $("#recurring").modal("hide");
    })(jQuery);
  }
  
}
