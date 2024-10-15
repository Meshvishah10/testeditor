import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-stability-form',
  templateUrl: './stability-form.component.html',
  styleUrl: './stability-form.component.scss',
})
export class StabilityFormComponent {
  isSubmitted: any = false;
  permission: any;
  stabilityForm: any = FormGroup;
  statusList: any;
  stabilityId: any = '';
  id: any = '';

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
    this.stabilityId =
      this.activatedRoute.snapshot.params['stabilityid'] !== undefined
        ? this.common.DecryptID(
            this.activatedRoute.snapshot.params['stabilityid']
          )
        : '';
    this.id =
      this.activatedRoute.snapshot.params['id'] !== undefined
        ? this.common.DecryptID(this.activatedRoute.snapshot.params['id'])
        : '';
    this.isSubmitted = false;
    // Get permissions from local storage
    //console.log("Getting Permission", permissions);
    if (
      this.activatedRoute.snapshot.params['stabilityid'] &&
      !this.stabilityId
    ) {
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
      this.stabilityForm = this.formBuilder.group({
        stabilityType1: ['', Validators.required],
        stabilityType2: [''],
        type1: ['', Validators.required],
        day1: ['', Validators.required],
        validity1: ['', Validators.required],
        type2: [''],
        day2: [''],
        validity2: [''],
        type3: [''],
        day3: [''],
        validity3: [''],
      });
      if (this.stabilityId != '') {
        this.getDataById();
      }
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getDataById() {
    this.api
      .callApi(
        this.constant.TestGetTestStabilityDetails +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.stabilityId)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.stabilityForm.reset({
            stabilityType1: res.StabilityTypes[0],
            stabilityType2: res.StabilityTypes[1],
            type1: res.TestTemperatures[0]?.Type || '',
            day1: res.TestTemperatures[0]?.Day || '',
            validity1: res.TestTemperatures[0]?.Validity || '',
            type2: res.TestTemperatures[1]?.Type || '',
            day2: res.TestTemperatures[1]?.Day || '',
            validity2: res.TestTemperatures[1]?.Validity || '',
            type3: res.TestTemperatures[2]?.Type || '',
            day3: res.TestTemperatures[2]?.Day || '',
            validity3: res.TestTemperatures[2]?.Validity || '',
            testId: res.TestId,
          });
          this.id = res.TestId;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  get f() {
    return this.stabilityForm.controls;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.stabilityForm.invalid) {
      return;
    }
    let body: any = {
      Id: this.stabilityId,
      TestId: this.id,
      StabilityTypes: [
        this.stabilityForm.value.stabilityType1,
        this.stabilityForm.value.stabilityType2,
      ],
      TestTemperatures: [
        {
          Type: this.stabilityForm.value.type1,
          Day: this.stabilityForm.value.day1,
          Validity: this.stabilityForm.value.validity1,
        },
        {
          Type: this.stabilityForm.value.type2,
          Day: this.stabilityForm.value.day2,
          Validity: this.stabilityForm.value.validity2,
        },
        {
          Type: this.stabilityForm.value.type3,
          Day: this.stabilityForm.value.day3,
          Validity: this.stabilityForm.value.validity3,
        },
      ],
    };
    // console.log({ body });
    if (this.stabilityId != '') {
      this.update(body);
    } else {
      this.add(body);
    }
    // Save logic here
  }
  add(body: any) {
    delete body.Id;
    this.api
      .callApi(
        this.constant.TestAddTestStabilityDetails,
        body,
        'POST',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.router.navigate([
              `/lab/web-master/test-searches/stability/${this.common.EncryptID(
                this.id.toString()
              )}`,
            ]);
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  update(body: any) {
    this.api
      .callApi(
        this.constant.TestUpdateTestStabilityDetails,
        body,
        'PUT',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.router.navigate([
              `/lab/web-master/test-searches/stability/${this.common.EncryptID(
                this.id.toString()
              )}`,
            ]);
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  onReset() {
    this.isSubmitted = false;
    this.router.navigate([
      `/lab/web-master/test-searches/stability/${this.common.EncryptID(
        this.id.toString()
      )}`,
    ]);
  }
}
