import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import html2canvas from 'html2canvas';
import { DecimalFormatPipe } from 'src/app/shared/decimal-format.pipe';
import { DecimalPipe } from '@angular/common';
declare var jQuery: any;
@Component({
  selector: 'app-add-edit-supply-order',
  templateUrl: './add-edit-supply-order.component.html',
  styleUrl: './add-edit-supply-order.component.scss',
  providers:[DecimalPipe]
})
export class AddEditSupplyOrderComponent implements OnInit , AfterViewInit {

  @ViewChild("autocomplete") public autoComplete!: AutoCompleteComponent;
  
  // Declare common Variable
  orderfrm:any=FormGroup;
  isSubmitted:any= false;
  orderresp:any;
  StateList:any=[];
  UserList:any=[];
  permission: any = '';
  uniqueid:any='';
  pastOrder:any
  pastorder:boolean=false
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

  productDetails:any='';
  productName:any='';

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,private http:HttpClient,public activatedRoute: ActivatedRoute,  private formBuilder: FormBuilder,private common:CommonService,private toastr: ToastrService,private datePipe: DatePipe,public decimalpipe:DecimalFormatPipe ,public decimalFormat:DecimalPipe){}

  ngOnInit(): void {
    this.uniqueid = this.activatedRoute.snapshot.params['id']!=undefined?this.common.DecryptID(this.activatedRoute.snapshot.params['id']):'';
   
   
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
      this.permission = permissions.find((item: any) => {
        return item.Type == 23;
      });

      this.orderfrm = this.formBuilder.group({
        ClientId: ['',[Validators.required]],
        address1: ['',[Validators.required]],
        State: ['',[Validators.required]],
        City: ['',[Validators.required]],
        Zip: ['',[Validators.required]],
      })
      //console.log("Getting Permission", permissions);
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueid) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/logistic-central/national-order']);
    }
      if(this.uniqueid == ''){
        if (this.permission.MenuPermission.Add == true) {
          this.getNationalOrder();
          this.getPhysicianList();
          this.getUserList();
        }else{
          this.router.navigate(['/lab/dashboard']);
        }
      }else{
       
        if (this.permission.MenuPermission.Edit == true) {
          this.getEditOrder();
          this.getPhysicianList();
          this.getUserList();
        }else{
          this.router.navigate(['/lab/dashboard']);
        }
      }
  }

  //past order detail
  pastOrderDetail(){    
    // console.log("Gettinng ClientId", this.selectedClient);
    if(this.selectedClient?.ClientId != ''){
      this.api
      .callApi(this.constant.PastOrderDetail + '?inputRequest=' +
      encodeURIComponent(this.common.Encrypt(this.selectedClient?.ClientId)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.pastOrder = res
          //console.log(this.pastOrder,"order")
          if (Object.keys(this.pastOrder).length > 0) {   
            this.pastorder = true;
        }
        },
        (err: any) => {
          this.pastorder = false;
          // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
    }else{
      // console.log("Getting else")
    }
  }
  historyModalClose(){
    this.pastOrder=''
  }
  //print
  print() {
    const printContent = document.getElementById('contentToExport')!;
  
    html2canvas(printContent).then(canvas => {
      const imageDataUrl = canvas.toDataURL('image/png');
    
      const printWindow = window.open();
      printWindow?.document.open();
      printWindow?.document.write('<html><head><title>Invoice</title></head><body>');
      printWindow?.document.write(`<img src="${imageDataUrl}" style="width:100%;" />`);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
    
      setTimeout(() => {
        printWindow?.focus();
        printWindow?.print();
        printWindow?.close();
      }, 100);
    });
  }
  getEditOrder(){
    
    this.api.callApi(
      this.constant.EditNationalOrder+'?inputRequest='+encodeURIComponent(this.common.Encrypt(this.uniqueid)),
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      var resp=res;
      // console.log("Getting res", res);
      this.orderresp = resp;
      this.selectedRadio=resp.ShippingType;
      this.Message=resp.Message;
      this.orderresp.Total = this.decimalFormat.transform(this.orderresp.Total, '1.2-2');

      const textarea1 = document.getElementById('specialmeesage') as HTMLTextAreaElement;
      textarea1.value = this.Message;
      textarea1.style.height = 'auto'; // Reset height to auto
      textarea1.style.height = textarea1.scrollHeight + 'px'; // Set height to scrollHeight
    //   this.orderresp.ShippingMethods.forEach((res: any) => {
    //     res.selected = false;
    // }); 
    // console.log("Getting resp", res , this.orderresp);
    },(err:any)=>{
      // console.log("Getting err", err);
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  setProductDetails(name: string, details: string) {
    this.productDetails = details;
    this.productName = name;
  }

  adjustTextareaHeight(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset height to auto
    textarea.style.height = textarea.scrollHeight + 'px'; // Set height to scrollHeight
  }

  changeTotal() {
    if(this.uniqueid !== ''){
      this.orderresp.Products.map((e:any)=>{
        e.Products.map((Product:any)=>{
          Product.Price = Product.Price=='' ? 0 : Product.Price;
          Product.ApprovedQuantity = Product.ApprovedQuantity=='' ? 0 : Product.ApprovedQuantity;
        })
      });
      const productAmount = this.orderresp.Products.reduce((total:any, product:any) => {
        return total + product.Products.reduce((subTotal:any, p:any) => {
          return subTotal + (p.Price * p.ApprovedQuantity);
        }, 0);
      }, 0);
      const shippingAmount = this.orderresp.ShippingMethods.find((e:any) => e.Type === this.selectedRadio)?.Amount || 0;
      this.orderresp.ProductAmount =this.decimalpipe.transform(productAmount);
      this.orderresp.Total = this.decimalFormat.transform(productAmount + shippingAmount,'1.2-2');
    }else{
      this.orderresp.ProductDetails.map((e:any)=>{
        e.Products.map((Product:any)=>{
          Product.Price = Product.Price=='' ? 0 : Product.Price;
          Product.Quantity = Product.Quantity=='' ? 0 : Product.Quantity;
        })
      });
      const productAmount = this.orderresp.ProductDetails.reduce((total:any, product:any) => {
        return total + product.Products.reduce((subTotal:any, p:any) => {
          return subTotal + (p.Price * p.Quantity);
        }, 0);
      }, 0);
      const shippingAmount = this.orderresp.ShippingMethods.find((e:any) => e.Type === this.selectedRadio)?.Amount || 0;
      this.ProductTotal = this.decimalpipe.transform(productAmount);
      this.TotalAMount= this.decimalFormat.transform(productAmount + shippingAmount,'1.2-2');
    }
  }

  getNationalOrder(){
    this.api.callApi(
      this.constant.commonNationalOrder,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      var resp=res;
      this.orderresp = resp;
      this.selectedRadio = this.orderresp.DefaultShippingType;
      this.orderresp.ShippingMethods.forEach((res: any) => {
        if(res.Type == this.orderresp.DefaultShippingType)
        this.TotalAMount= res.Amount;
        // res.selected = false;
    }); 
    // console.log("Getting resp", res , this.orderresp);
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
      //console.log("Getting Physiscian resp", res);
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
      //console.log("Getting res", res);
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
    var clientSelect = this.physicianlist.find((item:any) => item.Account === this.selectedAccount);
    // console.log("Getting selected Client", clientSelect);
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
      this.autoComplete.value='';
      this.selectedAccount = '';
      this.selectedClient=selectClient;
    }else{
    this.selectedClient = clientSelect !== undefined?clientSelect:selectClient;
    //console.log("Getting selected State", this.selectedClient);
    this.selectedClient.CountryId =  this.selectedClient.CountryId === 0 ? AppSettingsService.CountryId() : this.selectedClient.CountryId;
    this.selectedClient.StateId = this.selectedClient.StateId == 0 ? '' : this.selectedClient.StateId;
    this.getStateList();
   }
   this.pastOrderDetail()
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

  onUpdate(){
    let body={};
    //console.log(this.activatedRoute.snapshot.params['id'],this.uniqueid )
   
    
    let productDetailsFiltered = this.orderresp.Products
    .map((resp: any) => resp.Products.filter((r1: any) => r1.ApprovedQuantity > 0))
    .flat()
    .map((product: any) => ({ ProductId: product.Id, Quantity: product.ApprovedQuantity , Price: product.Price }));
    // if (!productDetailsFiltered.length) {
    //   this.toastr.error('Please enter a quantity greater than 0 for at least one product.', 'Access Med Lab');
    //   return;
    // }
    // else 
    if (!this.selectedRadio) {
      this.toastr.error('Please select a shipping method.', 'Access Med Lab');
      return;
    }
    else{
      body={
        Id:this.uniqueid,
        Products: productDetailsFiltered,
        ShippingMethod:this.selectedRadio,
        Message:this.Message
      }
     
  
      this.api
      .callApi(this.constant.commonNationalOrder, body , 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          //this.salesEMRForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          this.router.navigate(['/lab/logistic-central/national-order']);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
   
    }
  }

  onSubmit(){
    this.isSubmitted=true;
 
    
    let productDetailsFiltered = this.orderresp.ProductDetails
    .map((resp: any) => resp.Products.filter((r1: any) => r1.Quantity > 0))
    .flat()
    .map((product: any) => ({ ProductId: product.Id, Quantity: product.Quantity }));
     if (this.isSubmitted && this.f.ClientId?.errors?.required) {
        this.autoComplete.focus();
      }
   else  if(this.orderfrm.invalid){
      return;
    }
    else{
      let body={};
    //  if (!productDetailsFiltered.length) {
    //     this.toastr.error('Please enter a quantity greater than 0 for at least one product.', 'Access Med Lab');
    //     return;
    //   }
    //   else 
      if (!this.selectedRadio) {
        this.toastr.error('Please select a shipping method.', 'Access Med Lab');
        return;
      }
      else{
        body={
          Products: productDetailsFiltered,
          ShippingMethod:this.selectedRadio,
          Message:this.Message,
          Address1:this.selectedClient.Address1,
          Address2:this.selectedClient.Address2,
          City:this.selectedClient.City,
          CountryId:this.selectedClient.CountryId,
          StateId:this.selectedClient.StateId,
          Salesrepid:this.selectedUserid,
          Zip:this.selectedClient.Zip,
          ClientId:this.selectedClient.ClientId
        }
       
    // console.log(body,"body")
        this.api
        .callApi(this.constant.commonNationalOrder, body , 'POST', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.isSubmitted = false;
            //this.salesEMRForm.reset();
            this.toastr.success(
              resp.Message,
              'Access Med Lab'
            );
            this.router.navigate(['/lab/logistic-central/national-order']);
          },
          (err: any) => {
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
     
      }
    }
   
  }
}
