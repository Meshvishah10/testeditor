import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-delete-duplicate-test',
  templateUrl: './delete-duplicate-test.component.html',
  styleUrl: './delete-duplicate-test.component.scss'
})
export class DeleteDuplicateTestComponent {
  duplicateTestForm:any
  isSubmitted:boolean=false
  permission:any
  categoryList:any
  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private common: CommonService,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {}
  ngOnInit(): void {
    this.isSubmitted = false;
  
    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));    
    //console.log(permissions)
    this.permission = permissions.find((item: any) => {
      return item.Type == 61;
    });

    if (this.permission.MenuPermission.Add !== true) {
      this.router.navigate(['/lab/dashboard']);
    } 
    
    this.getCommonList()
   
    this.duplicateTestForm = this.formBuilder.group({
      Category:['',Validators.required],
      PatientFirstName:['',Validators.required],
      PatientLastName: ['',Validators.required],
      RequestModels: this.formBuilder.array([]),
    });
    this.addPanelOption() 
  } 
  get panelOptionsFormArray() {
    return this.duplicateTestForm.get('RequestModels') as FormArray;
  }
  addPanelOption() {
    const newRequestGroup = this.formBuilder.group({
      OriginalAccession: ['', Validators.required],
      DuplicateAccession : [''],
      TestToBeDeleted : [''],
      TestToBeAdded : ['']
    });
    this.panelOptionsFormArray.push(newRequestGroup);
  }
  removePanelOption(index: number) {
    this.panelOptionsFormArray.removeAt(index);
  }
  get f() { return this.duplicateTestForm.controls; }
  getCommonList(){
    this.api.callApi(
      this.constant.MasterDetails,
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      this.categoryList= res?.CategoryList
    },(err:any)=>{
      this.categoryList=[]
      // this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })

  }
  onSubmit(){
    this.isSubmitted = true;
    
    if (this.duplicateTestForm.invalid) { 
      
      return;
    }else{
     // Use this 'body' object in your HTTP request
     let requestArray = this.duplicateTestForm.value.RequestModels.map((req:any) => {
      return {
        OriginalAccession: req.OriginalAccession,
        DuplicateAccession: req.DuplicateAccession,
        TestToBeDeleted:req.TestToBeDeleted,
        TestToBeAdded:req.TestToBeAdded

      };
    });
    
    let body = {
      Category: this.duplicateTestForm.value.Category,
      PatientFirstName: this.duplicateTestForm.value.PatientFirstName,
      PatientLastName: this.duplicateTestForm.value.PatientLastName,
      RequestModels: requestArray,
    };
    // console.log(body,"body")
      this.api
      .callApi(this.constant.commonDuplicateReq, body , 'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.isSubmitted = false;
          this.duplicateTestForm.reset();
          this.toastr.success(
            resp.Message,
            'Access Med Lab'
          );
          
          this.router.navigate(['/lab/follow-up/resolution-center/duplicate-test/view/',this.common.EncryptID(resp?.Id)])
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  
    }
  }
}
