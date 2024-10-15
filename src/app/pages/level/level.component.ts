import { Component, OnInit } from '@angular/core';
import {Router , ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators ,FormControl} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { process, State } from '@progress/kendo-data-query';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent {

  //Declare common Variable
  levellist:any;
  levelfrm:any=FormGroup;
  isSubmitted:any= false;
  uniqueid:any = '';
  modelDisplay:any='none';
  requestpayload:any={
    Page:1,
    PageSize:10,
    Sorts:null,
    Filters:null,
    CustomSearch:''
  }
  public state: State = {
    skip: 0,
    take: 10
  };

  constructor(private router: Router,private api: ApiService,private constant: ConstantService,private http:HttpClient,public activatedRoute: ActivatedRoute,  private formBuilder: FormBuilder,private common:CommonService,private toastr: ToastrService,private datePipe: DatePipe){}

  ngOnInit(): void {
    this.isSubmitted=false;

    //Load Levels Using this function
    this.getLevelList();
  
    //Create FormControls for add/edit Level
    this.levelfrm= this.formBuilder.group({
      name: ['',[Validators.required]],
      description:['',[Validators.required]],
      // status: new FormControl({Value:'1'},Validators.required),
    })
  }

  getLevelList(){
    // let page =parseInt((this.state?.skip  + this.state?.take)/this.state?.take);
    // console.log("Getting request", this.requestpayload);
    this.api.callApi(
      this.constant.getAllList+'?inputRequest='+encodeURIComponent(this.common.Encrypt(this.requestpayload)),
      [],
      "GET",
      true,
      true
    ).subscribe((res:any)=>{
      // console.log("Getting response", res);
      this.levellist=res.NCLevelsList;
      this.levellist={
        data:res.NCLevelsList,
        total:res.Total
      } 
    },(err:any)=>{
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  // public customPagerInfoTemplate = ({ skip, take, total }: any) => {
  //   const start = skip + 1;
  //   const end = Math.min(skip + take, total);
  //   return `Showing ${start} to ${end} of ${total} items`;
  // };
  

  public dataStateChange(state: DataStateChangeEvent): void {
    // console.log("Getting Changes", state);
    this.requestpayload.Sorts=state.sort
    this.state = state;
    this.getLevelList();
}

OpenModel(){
  this.modelDisplay='block';
}

// Edit Level Data Get By Id
editModel(id:any){
  this.modelDisplay='block';
}

// check form Validation
get f() { return this.levelfrm.controls; }

  // Update profile data using this function.
  onSubmit(){
    this.isSubmitted=true;
    if(this.levelfrm.invalid){
      return;
    }else{
      let body={
        Name: this.levelfrm.value.name,
        Description: this.levelfrm.value.description,
        }
      // console.log("Getting Body", body);
      this.api.callApi(
        this.constant.commonLevel,
        body,
        "POST",
        true,
        true
      ).subscribe((res:any)=>{
        var resp=res;
        // console.log("Getting resp", resp);
        if(resp.Status == 1){        
        this.toastr.success(resp.Message, 'Access Med Lab');
        this.CancelbtnClick();
        }else{

        }
      },(err:any)=>{
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      })
    }
  }

  CancelbtnClick(){
    this.uniqueid='';
    this.modelDisplay='none';
    // console.log("Getting model Value", this.modelDisplay);
    this.isSubmitted=false;
    this.levelfrm.reset();
    this.getLevelList();
  }
}
