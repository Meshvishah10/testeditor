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

@Component({
  selector: 'app-add-edit-members',
  templateUrl: './add-edit-members.component.html',
  styleUrls: ['./add-edit-members.component.scss']
})
export class AddEditMembersComponent {

  //Declare common Variable
  AddEditForm:any=FormGroup;
  isSubmitted:any= false;
  getDetails:any;
  permission:any;
  generatedPassword:any='';
  agreementFile:any=null;
  //Common Dropdown list
  CountryList:any=[];
  StateList:any=[];
  profileImage:any='';

  uniqueid:any='';
  covid19Product:any=[];

  visible :any = 'fa fa-eye';
  visible1 :any = 'fa fa-eye';
  visible2 :any = 'fa fa-eye';

  lableList:any;
  fieldNo:any=1;

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,private http:HttpClient,public activatedRoute: ActivatedRoute,  private formBuilder: FormBuilder,private common:CommonService,private toastr: ToastrService,private datePipe: DatePipe,public phoneFormat:PhoneFormatPipe){}

  ngOnInit(): void {
    this.isSubmitted=false;

    this.uniqueid = this.activatedRoute.snapshot.params['id']!=undefined?this.common.DecryptID(this.activatedRoute.snapshot.params['id']):'';
    

    var passregex: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$/;
    const emailregex : RegExp =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const phonemask = /^\(\d{3}\)-\d{3}-\d{4}$/;
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
      this.permission = permissions.find((item: any) => {
        return item.Type == 44;
      });

    if(this.permission.MenuPermission.Add == true || this.permission.MenuPermission.Edit == true){

       // Create Member Form and Declare Controllers of Form
       this.AddEditForm= this.formBuilder.group({
        MFirstName: ['',[Validators.required]],
        MLastName: ['',[Validators.required]],
        PracticeName: ['',[Validators.required]],
        MEmail: ['',[Validators.required,Validators.pattern(emailregex)]],
        PracticePhone: ['',[Validators.required,Validators.pattern(phonemask)]],
        Fax: ['',[Validators.pattern(phonemask)]],
        MAddressLine1: [''],
        MAddressLine2: [''],
        MCity: [''],
        MCountryId: [''],
        MStateId: [''],
        MZip: [''],
        AlterContact: ['',[Validators.pattern(phonemask)]],
        Blood_IH: false,
        Blood_SO: false,
        Spec_BloodTest: false,
        Spec_SalivaryTest: false,
        Spec_StoolTest: false,
        Spec_UrineTest: false,
        SpecialRequest: [''],
        MUserName: ['',  [Validators.required, Validators.minLength(3)]],
        MPassword: ['',[Validators.required,Validators.pattern(passregex)]],
        AccountNumber: ['',[Validators.required]],
        AccountType: [''],
        LabGenUser: [''],
        LabGenPassword: [''],
        LabGenPhyId: [''],
        LabGenBillingId: [''],
        LabGenKitId: false,
        Label:[''],
        Attention:[''],
        FileName: [''],
        FileContentByteData : [''],
        MEmail2:[],
        MEmail3:[],
        SendInvoiceEmail2:[''],
        SendInvoiceEmail3 :[''],
      })
      if (this.activatedRoute.snapshot.params['id'] && !this.uniqueid) {
        this.toastr.error('Invalid Request.');
    }
      //get CountryList
      this.getCountryList();
      // this.getcovidProductList();
       // Ensure generated password matches the regex
         do {
            this.generatedPassword = this.generateRandomPassword();
          } while (!passregex.test(this.generatedPassword||''));

      //If Uniqueid not blank than call get details functions
      if(this.uniqueid != ''){
        
          this.AddEditForm.get('MPassword').clearValidators();
          this.AddEditForm.get('MPassword').setValidators([
                Validators.required,
          ]);
      this.getMemberbyid();
      }
    this.getMasterDetails();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }

  }

  addNewField(){
    if(this.fieldNo < 3){
      this.fieldNo ++;
    }
  }
  downloadPdf(){
    let body = {
      Id: this.uniqueid,
    };
    // console.log('Getting ', body);
    this.api
      .callApi(this.constant.downloadAgreement, body, 'PUT', true, true)
    .subscribe(
      (res: any) => {
        var resp=res;
        const binaryString = atob(res.FileBytes);
        // Convert the binary string into a Uint8Array
        const bytesArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytesArray[i] = binaryString.charCodeAt(i);
        }
        // Create a Blob from the Uint8Array
        const blob = new Blob([bytesArray], {
          type: 'application/octet-stream'
                  });
       
        // Create a URL for the Blob
        const blobUrl = URL.createObjectURL(blob);
     
          // Create a link element
          const link = document.createElement('a');
          link.href = blobUrl;
          // Optionally set the download attribute to specify the file name
          link.download = res.FileName;
          // Programmatically click on the link to trigger the download
          link.click();
          // Clean up: revoke the Blob URL
          URL.revokeObjectURL(blobUrl);
        
       
          // if(resp.Status == 1){        
          // this.toastr.success(resp.Message, 'Access Med Lab');
          // }
        },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
}

  removeField() {
    if (this.fieldNo > 1) {
        this.fieldNo--;
    }
    // Reset the tracking number properties based on the current fieldNo
    switch (this.fieldNo) {
      case 1:
          this.AddEditForm.get('MEmail2').setValue('');
          this.AddEditForm.get('SendInvoiceEmail2').setValue('');
          break;
      case 2:
          this.AddEditForm.get('MEmail3').setValue('');
          this.AddEditForm.get('SendInvoiceEmail3').setValue('');
          break;
      // Add cases for additional fields if needed
  }
}

  getMasterDetails(){
    this.api.callApi(
      this.constant.MasterDetails,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.lableList=res.MemberPhysicanLabelList;
    })
  }

  limitLength(event: any) {
    const maxLength = 9; // Adjust the maximum length as needed
    const input = event.target.value;
  
    if (input.length > maxLength) {
      event.preventDefault();
      event.target.value = input.slice(0, maxLength);
    }
  }

  // getcovidProductList(){
  //   this.api.callApi(
  //     this.constant.getClientCovid19kits,
  //     [],
  //     "GET",
  //     true,
  //     true
  //   ).subscribe((res:any)=>{
  //     var resp=res;
  //     this.covid19Product=resp;
  //   },(err:any)=>{
  //     this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
  //   })
  // }


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
  onInputChange(): void {
    const rawValue = this.f.MUserName.value;
    const trimmedValue = rawValue.trim().replace(/\s+|[_\.]/g, ''); // Remove all spaces, underscores, and periods
    this.f.MUserName.setValue(trimmedValue);  
  }
  getCountryList(){
    this.api.callApi(
      this.constant.GetCountryList,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      var resp=res;
      this.CountryList = resp;
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  getStateList(){
    this.api.callApi(
      this.constant.GetStateList+'?inputRequest='+encodeURIComponent(this.common.Encrypt(this.AddEditForm.value.MCountryId)),
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

  getMemberbyid(){
    this.api
    .callApi(
      this.constant.GetClientById +
        '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.uniqueid)),
      [],
      'GET',
      true,
      true
    )
    .subscribe(
      (res: any) => {
        var resp = res;
        this.agreementFile = resp.AgreementFile;   
        this.covid19Product = res.ClientCovid19ProductKits;
        this.AddEditForm.reset({
          MFirstName: resp.MFirstName,
          MLastName: resp.MLastName,
          PracticeName: resp.PracticeName,
          MEmail: resp.MEmail,
          PracticePhone: resp.PracticePhone!=null?resp.PracticePhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3'):'',
          Fax: resp.Fax != null? resp.Fax.replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3'):'',
          MAddressLine1: resp.MAddressLine1,
          MAddressLine2: resp.MAddressLine2,
          MCity: resp.MCity,
          MCountryId: resp.MCountryId!=null?resp.MCountryId:'',
          MStateId: resp.MStateId!=null?resp.MStateId:'',
          MZip: resp.MZip,
          AlterContact: resp.AlterContact != null? resp.AlterContact.replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3'):'',
          Blood_IH: resp.Blood_IH,
          Blood_SO: resp.Blood_SO,
          Spec_BloodTest: resp.Spec_BloodTest,
          Spec_SalivaryTest: resp.Spec_SalivaryTest,
          Spec_StoolTest: resp.Spec_StoolTest,
          Spec_UrineTest: resp.Spec_UrineTest,
          SpecialRequest: resp.SpecialRequest,
          MUserName: resp.MUserName,
          MPassword: resp.MPassword,
          AccountNumber: resp.AccountNumber,
          AccountType: resp.AccountType != null ? resp.AccountType.toString() : '',
        
          LabGenUser: resp.LabGenUser,
          LabGenPassword: resp.LabGenPassword,
          LabGenPhyId: resp.LabGenPhyId,
          LabGenBillingId: resp.LabGenBillingId,
          Label:resp.Label,
          Attention:resp.Attention,
          LabGenKitId: resp.LabGenKitId !== null ? resp.LabGenKitId.toString() : null,
          MEmail2:resp.MEmail2,
          MEmail3:resp.MEmail3,
          SendInvoiceEmail2:resp.SendInvoiceEmail2!==null?resp.SendInvoiceEmail2.toString():'',
          SendInvoiceEmail3 :resp.SendInvoiceEmail3!==null?resp.SendInvoiceEmail3.toString():'',
        })
        if(resp.MEmail3 != '' && resp.MEmail3 != null){
          this.fieldNo=3;
        }
        else if(resp.MEmail2 != '' && resp.MEmail2 != null){
          this.fieldNo=2;
        }else{
          this.fieldNo=1;
        }
        this.profileImage = resp.Logo;
        if(resp.MCountryId != null||''){
        this.getStateList();
        }
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
        if(this.uniqueid == ''){
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

  onRadioChange(covid: any, selectedKitId: number) {
    covid.KitType = selectedKitId;
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
        Id: this.uniqueid,
        FileName: file.name,
        FileContentByteData: base64String,
      };
      // console.log('Getting ', body);
      this.api
        .callApi(this.constant.UploadClientLogo, body, 'PUT', true, true)
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

  async onSubmit(){
    // console.log("Getting Label Value", this.AddEditForm.value.Label)
    if (this.activatedRoute.snapshot.params['id'] && !this.uniqueid) {
      this.toastr.error('Invalid Request.');
      return
  }
  // var selectedCovid = this.covid19Product.filter((element: any) => {
  //       return (element.KitType !== null && element.KitType !== '') || (element.ProductPrice !== null && element.ProductPrice !== '');
  //     }).map((element: any) => {
  //       return { ProductId: element.ProductId, ProductPrice: element.ProductPrice, KitType: element.KitType };
  //     });
  //   selectedCovid =  selectedCovid == undefined ? [] : selectedCovid;
      var selectedCovid:any=[];
    this.isSubmitted=true;
    if(this.AddEditForm.invalid){
      return;
    }else{
      this.AddEditForm.value.Fax=this.AddEditForm.value.Fax.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, "");
      this.AddEditForm.value.AlterContact=this.AddEditForm.value.AlterContact.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, "");
      this.AddEditForm.value.PracticePhone=this.AddEditForm.value.PracticePhone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, "");
      let body={
        MFirstName: this.AddEditForm.value.MFirstName,
        MLastName: this.AddEditForm.value.MLastName,
        PracticeName: this.AddEditForm.value.PracticeName,
        MEmail: this.AddEditForm.value.MEmail,
        PracticePhone: this.AddEditForm.value.PracticePhone,
        Fax: this.AddEditForm.value.Fax,
        MAddressLine1: this.AddEditForm.value.MAddressLine1,
        MAddressLine2: this.AddEditForm.value.MAddressLine2,
        MCity: this.AddEditForm.value.MCity,
        MCountryId: this.AddEditForm.value.MCountryId,
        MStateId: this.AddEditForm.value.MStateId,
        MZip: this.AddEditForm.value.MZip,
        AlterContact: this.AddEditForm.value.AlterContact,
        Blood_IH: this.AddEditForm.value.Blood_IH,
        Blood_SO: this.AddEditForm.value.Blood_SO,
        Spec_BloodTest: this.AddEditForm.value.Spec_BloodTest,
        Spec_SalivaryTest: this.AddEditForm.value.Spec_SalivaryTest,
        Spec_StoolTest: this.AddEditForm.value.Spec_SalivaryTest,
        Spec_UrineTest: this.AddEditForm.value.Spec_UrineTest,
        SpecialRequest: this.AddEditForm.value.SpecialRequest,
        MUserName: this.AddEditForm.value.MUserName,
        MPassword: this.AddEditForm.value.MPassword,
        AccountNumber: this.AddEditForm.value.AccountNumber,
        AccountType: this.AddEditForm.value.AccountType,
        LabGenUser: this.AddEditForm.value.LabGenUser,
        LabGenPassword: this.AddEditForm.value.LabGenPassword,
        LabGenPhyId: this.AddEditForm.value.LabGenPhyId,
        LabGenBillingId: this.AddEditForm.value.LabGenBillingId,
        LabGenKitId: this.AddEditForm.value.LabGenKitId,
        Label: this.AddEditForm.value.Label,
        Attention: this.AddEditForm.value.Attention,
        FileName: this.AddEditForm.value.FileName,
        FileContentByteData : this.AddEditForm.value.FileContentByteData,
        MEmail2:this.AddEditForm.value.MEmail2 || null,
        MEmail3:this.AddEditForm.value.MEmail3 || null,
        SendInvoiceEmail2:this.AddEditForm.value.SendInvoiceEmail2,
        SendInvoiceEmail3 :this.AddEditForm.value.SendInvoiceEmail3,
      }
   
      this.api.callApi(
        this.constant.CreateMemberPhysician,
        body,
        "POST",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.AddEditForm.reset();
        this.router.navigate(['/lab/memberphysician']);
        }else{
  
        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
    }
  }

  onUpdate(){
    this.isSubmitted=true;
    if (this.activatedRoute.snapshot.params['id'] && !this.uniqueid) {
      this.toastr.error('Invalid Request.');
      return
  }
    if(this.AddEditForm.invalid){
      return;
    }else{
      this.AddEditForm.value.Fax=this.AddEditForm.value.Fax.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, "");
      this.AddEditForm.value.AlterContact=this.AddEditForm.value.AlterContact.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, "");
      this.AddEditForm.value.PracticePhone=this.AddEditForm.value.PracticePhone.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\s/g, "");
    //   var selectedCovid = this.covid19Product.filter((element: any) => {
    //     return (element.KitType !== null && element.KitType !== '') || (element.ProductPrice !== null && element.ProductPrice !== '');
    //   }).map((element: any) => {
    //     return { ProductId: element.ProductId, ProductPrice: element.ProductPrice, KitType: element.KitType };
    //   });
      //  selectedCovid =  selectedCovid == undefined ? [] : selectedCovid;
      var selectedCovid:any=[];
      let body={
        Id:this.uniqueid,
        MFirstName: this.AddEditForm.value.MFirstName,
        MLastName: this.AddEditForm.value.MLastName,
        PracticeName: this.AddEditForm.value.PracticeName,
        MEmail: this.AddEditForm.value.MEmail,
        PracticePhone: this.AddEditForm.value.PracticePhone,
        Fax: this.AddEditForm.value.Fax,
        MAddressLine1: this.AddEditForm.value.MAddressLine1,
        MAddressLine2: this.AddEditForm.value.MAddressLine2,
        MCity: this.AddEditForm.value.MCity,
        MCountryId: this.AddEditForm.value.MCountryId,
        MStateId: this.AddEditForm.value.MStateId,
        MZip: this.AddEditForm.value.MZip,
        AlterContact: this.AddEditForm.value.AlterContact,
        Blood_IH: this.AddEditForm.value.Blood_IH,
        Blood_SO: this.AddEditForm.value.Blood_SO,
        Spec_BloodTest: this.AddEditForm.value.Spec_BloodTest,
        Spec_SalivaryTest: this.AddEditForm.value.Spec_SalivaryTest,
        Spec_StoolTest: this.AddEditForm.value.Spec_SalivaryTest,
        Spec_UrineTest: this.AddEditForm.value.Spec_UrineTest,
        SpecialRequest: this.AddEditForm.value.SpecialRequest,
        MUserName: this.AddEditForm.value.MUserName,
        MPassword: this.AddEditForm.value.MPassword,
        AccountNumber: this.AddEditForm.value.AccountNumber,
        AccountType: this.AddEditForm.value.AccountType,
       
        LabGenUser: this.AddEditForm.value.LabGenUser,
        LabGenPassword: this.AddEditForm.value.LabGenPassword,
        LabGenPhyId: this.AddEditForm.value.LabGenPhyId,
        LabGenBillingId: this.AddEditForm.value.LabGenBillingId,
        LabGenKitId: this.AddEditForm.value.LabGenKitId,
        Label: this.AddEditForm.value.Label,
        Attention: this.AddEditForm.value.Attention,
        MEmail2:this.AddEditForm.value.MEmail2 || null,
        MEmail3:this.AddEditForm.value.MEmail3 || null,
        SendInvoiceEmail2:this.AddEditForm.value.SendInvoiceEmail2=="true"?true:false,
        SendInvoiceEmail3 :this.AddEditForm.value.SendInvoiceEmail3=="true"?true:false,
      }

      this.api.callApi(
        this.constant.UpdateMemberPhysician,
        body,
        "PUT",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.AddEditForm.reset();
        this.router.navigate(['/lab/memberphysician']);
        }else{
  
        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
    }
  }

  changeicon(){
    this.visible = this.visible == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
   }

 changeicon1(){
    this.visible1 = this.visible1 == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
  }

  changeicon2(){
    this.visible2 = this.visible2 == 'fa fa-eye'?'fa fa-eye-slash':'fa fa-eye'
  }

}
