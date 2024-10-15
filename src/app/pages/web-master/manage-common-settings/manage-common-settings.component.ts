import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  ACHConfig,
  ApiConfig,
  AuthorizeNetConfig,
  BillingContactConfig,
  BillingCycleCsvFileServerConfig,
  GeneralConfig,
  GoogleReviewAPIConfig,
  LabGen,
  PowerBIConfig,
  SalesforceConfig,
  SeamlessPayDataConfig,
} from 'src/app/models/CommonSettings.model';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-manage-common-settings',
  templateUrl: './manage-common-settings.component.html',
  styleUrl: './manage-common-settings.component.scss',
})
export class ManageCommonSettingsComponent implements OnInit, AfterViewInit {
  LabGenForm: any;
  ACHConfigForm: any;
  PowerBIConfigForm: any;
  SalesforceConfigForm: any;
  BillingCycleCsvFileServerConfigForm: any;
  SeamlessPayDataConfigForm: any;
  GeneralConfigForm: any;
  GoogleReviewAPIConfigForm: any;
  BillingContactConfigForm: any;
  AuthorizeNetConfigForm: any;
  isSubmitted = false;
  permission: any;
  visible: any = 'fa fa-eye';

  isLabgenPasswordVisible = false;
  isBillingCyclePasswordVisible = false;
  isSalesforcePasswordVisible = false;
  isPowerbiPasswordVisible = false;
  apiList: ApiConfig<any>[] = [
    {
      name: 'LabGenConfig',
      form: () => this.LabGenForm,
      patchForm: (values: any) => this.LabGenForm.patchValue(values),
      getPath: '/GetLabGenConfigData',
      putPath: '/UpdateLabGenConfigData',
      type: (data: LabGen) => data,
    },
    {
      name: 'ACHConfig',
      form: () => this.ACHConfigForm,
      patchForm: (values: any) => this.ACHConfigForm.patchValue(values),
      getPath: '/GetACHConfigData',
      putPath: '/UpdateACHConfigData',
      type: (data: ACHConfig) => data,
    },
    {
      name: 'PowerBIConfig',
      form: () => this.PowerBIConfigForm,
      patchForm: (values: any) => this.PowerBIConfigForm.patchValue(values),
      getPath: '/GetPowerBIConfigData',
      putPath: '/UpdatePowerBiConfigData',
      type: (data: PowerBIConfig) => data,
    },
    {
      name: 'SalesforceConfig',
      form: () => this.SalesforceConfigForm,
      patchForm: (values: any) => this.SalesforceConfigForm.patchValue(values),
      getPath: '/GetSalesforceConfigData',
      putPath: '/UpdateSalesforceConfigData',
      type: (data: SalesforceConfig) => data,
    },
    {
      name: 'BillingCycleCsvFileServerConfig',
      form: () => this.BillingCycleCsvFileServerConfigForm,
      patchForm: (values: any) =>
        this.BillingCycleCsvFileServerConfigForm.patchValue(values),
      getPath: '/GetBillingCycleCsvFileServerConfigData',
      putPath: '/UpdateBillingCycleCsvFileServerConfigData',
      type: (data: BillingCycleCsvFileServerConfig) => data,
    },
    {
      name: 'SeamlessPayDataConfig',
      form: () => this.SeamlessPayDataConfigForm,
      patchForm: (values: any) =>
        this.SeamlessPayDataConfigForm.patchValue(values),
      getPath: '/GetSeamlessPayConfigData',
      putPath: '/UpdateSeamlessPayDataConfig',
      type: (data: SeamlessPayDataConfig) => data,
    },
    {
      name: 'AuthorizeNetConfig',
      form: () => this.AuthorizeNetConfigForm,
      patchForm: (values: any) =>
        this.AuthorizeNetConfigForm.patchValue(values),
      getPath: '/GetAuthorizeNetConfigData',
      putPath: '/UpdateAuthorizeNetConfig',
      type: (data: AuthorizeNetConfig) => data,
    },
    {
      name: 'BillingContactConfig',
      form: () => this.BillingContactConfigForm,
      patchForm: (values: any) =>
        this.BillingContactConfigForm.patchValue(values),
      getPath: '/GetBillingContactConfigData',
      putPath: '/UpdateBillingContactConfig',
      type: (data: BillingContactConfig) => data,
    },
    {
      name: 'GoogleReviewAPIConfig',
      form: () => this.GoogleReviewAPIConfigForm,
      patchForm: (values: any) =>
        this.GoogleReviewAPIConfigForm.patchValue(values),
      getPath: '/GetGoogleReviewAPIConfigData',
      putPath: '/UpdateGoogleReviewAPIConfig',
      type: (data: GoogleReviewAPIConfig) => data,
    },
    {
      name: 'GeneralConfig',
      form: () => this.GeneralConfigForm,
      patchForm: (values: any) => this.GeneralConfigForm.patchValue(values),
      getPath: '/GetGeneralConfigData',
      putPath: '/UpdateGeneralConfig',
      type: (data: GeneralConfig) => data,
    },
  ];

  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 69;
    });
    if (this.permission.MenuPermission.View == true) {
      this.apiList.map((e) => {
        this.getData(e);
      });
    } else {
      this.router.navigate(['/lab/dashboard']);
    }

    this.LabGenForm = this.formBuilder.group({
      Host: ['',[Validators.required]],
      Port: ['',[Validators.required]],
      Username: ['',[Validators.required]],
      Password: ['',[Validators.required]],
      Path: ['',[Validators.required]],
      TransferType: ['',[Validators.required]],
    });
    this.ACHConfigForm = this.formBuilder.group({
      Email: ['',[Validators.required]],
      Extension: ['',[Validators.required]],
      Phone: ['',[Validators.required]],
      ReturnCheckFee: ['',[Validators.required]],
    });
    this.PowerBIConfigForm = this.formBuilder.group({
      ApplicationId: ['',[Validators.required]],
      ApplicationSecret: ['',[Validators.required]],
      WorkspaceId: ['',[Validators.required]],
      Username: ['',[Validators.required]],
      Password: ['',[Validators.required]],
    });
    this.SalesforceConfigForm = this.formBuilder.group({
      Username: ['',[Validators.required]],
      Password: ['',[Validators.required]],
      ClientId: ['',[Validators.required]],
      ClientSecret: ['',[Validators.required]],
    });
    this.BillingCycleCsvFileServerConfigForm = this.formBuilder.group({
      Protocol: ['',[Validators.required]],
      Host: ['',[Validators.required]],
      Port: ['',[Validators.required]],
      Username: ['',[Validators.required]],
      Password: ['',[Validators.required]],
      Folderpath: ['',[Validators.required]],
    });
    this.SeamlessPayDataConfigForm = this.formBuilder.group({
      SecretKey: ['',[Validators.required]],
      CreateAccessTokenURL: ['',[Validators.required]],
      CreateTokenURL: ['',[Validators.required]],
      CreateChargeURL: ['',[Validators.required]],
    });
    this.AuthorizeNetConfigForm = this.formBuilder.group({
      APILoginID: ['',[Validators.required]],
      TransactionKey: ['',[Validators.required]],
      Environment: ['',[Validators.required]],
    });
    this.BillingContactConfigForm = this.formBuilder.group({
      Phone: ['',[Validators.required]],
      Extension: ['',[Validators.required]],
      Email: ['',[Validators.required]],
    });
    this.GoogleReviewAPIConfigForm = this.formBuilder.group({
      ApiUrl: ['',[Validators.required]],
      ApiKey: ['',[Validators.required]],
      PlaceId: ['',[Validators.required]],
      ReviewUrl: ['',[Validators.required]],
    });
    this.GeneralConfigForm = this.formBuilder.group({
      ResetPasswordLinkExpiryHours: ['',[Validators.required]],
      TransactionPercentage: ['',[Validators.required]],
      NCUserChangePasswordDays: ['',[Validators.required]],
      LabProcessingFee: ['',[Validators.required]],
    });
  }

  ngAfterViewInit(): void {
    const usernameInputs = document.querySelectorAll('input[formControlName="Username"]');
    const passwordInputs = document.querySelectorAll('input[formControlName="Password"]');
      usernameInputs.forEach((input) => {
        this.renderer.setAttribute(input, 'autocomplete', 'off');
      });
  
      passwordInputs.forEach((input) => {
        this.renderer.setAttribute(input, 'autocomplete', 'new-password');
      });
  }

  // changeicon() {
  //   this.visible =
  //     this.visible == 'fa fa-eye' ? 'fa fa-eye-slash' : 'fa fa-eye';
  // }

  getData(e: ApiConfig) {
    this.api
      .callApi(this.constant.CommonSetting + e.getPath, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          e.patchForm(res);
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  get f() {
    return {
      LabGenForm: this.LabGenForm.controls,
      ACHConfigForm: this.ACHConfigForm.controls,
      PowerBIConfigForm: this.PowerBIConfigForm.controls,
      SalesforceConfigForm: this.SalesforceConfigForm.controls,
      BillingCycleCsvFileServerConfigForm: this.BillingCycleCsvFileServerConfigForm.controls,
      SeamlessPayDataConfigForm: this.SeamlessPayDataConfigForm.controls,
      GeneralConfigForm: this.GeneralConfigForm.controls,
      GoogleReviewAPIConfigForm: this.GoogleReviewAPIConfigForm.controls,
      BillingContactConfigForm: this.BillingContactConfigForm.controls,
      AuthorizeNetConfigForm: this.AuthorizeNetConfigForm.controls,
    };
  }

  togglePasswordVisibility(formControl: string): void {
    switch (formControl) {
      case 'Labgen':
        this.isLabgenPasswordVisible = !this.isLabgenPasswordVisible;
        break;
      case 'BillingCycle':
        this.isBillingCyclePasswordVisible =
          !this.isBillingCyclePasswordVisible;
        break;
      case 'Salesforce':
        this.isSalesforcePasswordVisible = !this.isSalesforcePasswordVisible;
        break;
      case 'PowerBi':
        this.isPowerbiPasswordVisible = !this.isPowerbiPasswordVisible;
        break;
      default:
        console.warn('Unknown form control');
    }
  }

  onSubmit(name: string) {
    this.isSubmitted=true;
    const ele = this.apiList.find((e) => e.name == name);
    if (!ele || ele.form().invalid) return;
    const body: typeof ele.type = {
      ...ele.form().value,
    };
    this.api
      .callApi(
        this.constant.CommonSetting + ele.putPath,
        body,
        'PUT',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.isSubmitted = false;
          this.toastr.success(res.Message, 'Access Med Lab');
          this.getData(ele);
        },
        (err: any) => {
          this.isSubmitted = false;
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
