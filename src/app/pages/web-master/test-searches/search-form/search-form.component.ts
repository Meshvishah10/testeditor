import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
})
export class SearchFormComponent {
  isSubmitted: any = false;
  permission: any;
  searchForm: any = FormGroup;
  uniqueId: any = '';
  statusList: any;

  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.uniqueId =
      this.activatedRoute.snapshot.params['id'] !== undefined
        ? this.common.DecryptID(this.activatedRoute.snapshot.params['id'])
        : '';
    this.isSubmitted = false;
    // Get permissions from local storage
    //console.log("Getting Permission", permissions);
    if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
      this.toastr.error('Invalid Request.');
    }
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 71;
    });

    if (
      this.permission.MenuPermission.Add == true ||
      this.permission.MenuPermission.Edit == true
    ) {
      this.searchForm = this.formBuilder.group({
        title: ['', Validators.required],
        code: ['', Validators.required],
        routeName: ['', Validators.required],
        specimenCollection: [''],
        component: [''],
        method: [''],
        clinicalUtility: [''],
        collectionNotes: [''],
        cptCode: [''],
        location: [''],
        seoTitle: [''],
        seoDescription: [''],
        status: [''],
      });
      this.getStatusList();
      if (this.uniqueId != '') {
        this.getDataById();
      }
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getDataById() {
    this.api
      .callApi(
        this.constant.Test +
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
          this.searchForm.reset({
            title: resp.Title,
            code: resp.Code,
            routeName: resp.RouteName,
            specimenCollection: resp.SpecimenCollection,
            component: resp.Component,
            method: resp.Method,
            clinicalUtility: resp.ClinicalUtility,
            collectionNotes: resp.CollectionNotes,
            cptCode: resp.CPTCode,
            location: resp.Location,
            seoTitle: resp.SEOTitle,
            seoDescription: resp.SEODescription,
            status: resp.Status,
          });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  get f() {
    return this.searchForm.controls;
  }

  getStatusList() {
    this.api
      .callApi(this.constant.MasterDetails, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.statusList = res?.StatusFilterList;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.searchForm.invalid) {
      return;
    }
    let body: any = {
      Title: this.searchForm.value.title,
      Code: this.searchForm.value.code,
      RouteName: this.searchForm.value.routeName,
      SpecimenCollection: this.searchForm.value.specimenCollection,
      Component: this.searchForm.value.component,
      Method: this.searchForm.value.method,
      ClinicalUtility: this.searchForm.value.clinicalUtility,
      CollectionNotes: this.searchForm.value.collectionNotes,
      CPTCode: this.searchForm.value.cptCode,
      Location: this.searchForm.value.location,
      SEOTitle: this.searchForm.value.seoTitle,
      SEODescription: this.searchForm.value.seoDescription,
    };
    if (this.uniqueId != '') {
      body.Id = this.uniqueId;
      body.Status = this.searchForm.value.status;
      this.update(body);
    } else {
      this.add(body);
    }
    // Save logic here
  }
  add(body: any) {
    this.api.callApi(this.constant.Test, body, 'POST', true, true).subscribe(
      (res: any) => {
        var resp = res;
        if (resp.Status == 1) {
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.router.navigate(['/lab/web-master/test-searches']);
        }
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }
  update(body: any) {
    this.api.callApi(this.constant.Test, body, 'PUT', true, true).subscribe(
      (res: any) => {
        var resp = res;
        if (resp.Status == 1) {
          this.toastr.success(resp.Message, 'Access Med Lab');
          this.router.navigate(['/lab/web-master/test-searches']);
        }
      },
      (err: any) => {
        this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
      }
    );
  }
  onReset() {
    this.isSubmitted = false;
    this.router.navigate(['/lab/web-master/test-searches']);
  }

  typeTemp(){
    this.router.navigate([`/lab/web-master/test-searches/stability/${this.common.EncryptID(this.uniqueId.toString())}`]);
  }
}
