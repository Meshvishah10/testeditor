import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-manage-social-media',
  templateUrl: './manage-social-media.component.html',
  styleUrl: './manage-social-media.component.scss',
})
export class ManageSocialMediaComponent {
  permission: any;
  body: any = {
    twitterLink: null,
    linkedInLink: null,
    facebookLink: null,
    instagramLink: null,
  };
  error = {
    twitterLink: false,
    linkedInLink: false,
    facebookLink: false,
    instagramLink: false,
  };

  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    private router: Router,
    private common: CommonService
  ) {}

  ngOnInit() {
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 74;
    });
    if (this.permission.MenuPermission.View == true) {
      this.getLinks();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  getLinks() {
    this.api
      .callApi(this.constant.ManageSocialMedia, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.body = {
            twitterLink: res.Twitter,
            linkedInLink: res.LinkedIn,
            facebookLink: res.Facebook,
            instagramLink: res.Instagram,
          };
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  onSave() {
    const urlPattern = /^https?:/;

    this.error.twitterLink =
      this.body.twitterLink && !urlPattern.test(this.body.twitterLink);
    this.error.linkedInLink =
      this.body.linkedInLink && !urlPattern.test(this.body.linkedInLink);
    this.error.facebookLink =
      this.body.facebookLink && !urlPattern.test(this.body.facebookLink);
    this.error.instagramLink =
      this.body.instagramLink && !urlPattern.test(this.body.instagramLink);

    if (
      this.error.facebookLink ||
      this.error.instagramLink ||
      this.error.linkedInLink ||
      this.error.twitterLink
    ) {
      return;
    }
    if (
      this.body.facebookLink == '' &&
      this.body.instagramLink == '' &&
      this.body.linkedInLink == '' &&
      this.body.twitterLink == ''
    ) {
      return;
    }
    const body = {
      Twitter: this.body.twitterLink != '' ? this.body.twitterLink : null,
      LinkedIn: this.body.linkedInLink != '' ? this.body.linkedInLink : null,
      Facebook: this.body.facebookLink != '' ? this.body.facebookLink : null,
      Instagram: this.body.instagramLink != '' ? this.body.instagramLink : null,
    };
    this.api
      .callApi(this.constant.ManageSocialMedia, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          this.toastr.success(resp.Message, 'Access Med Lab');
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
}
