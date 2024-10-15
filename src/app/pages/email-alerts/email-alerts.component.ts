import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { EmailAlertConfigData } from 'src/app/models/EmailAlerts.model';

@Component({
  selector: 'app-email-alerts',
  templateUrl: './email-alerts.component.html',
  styleUrls: ['./email-alerts.component.scss']
})
export class EmailAlertsComponent implements OnInit  {

  // Declare Common Variables
  alertfrm: any = FormGroup;
  alertresp: any = [];
  isEdit: boolean = false;
  isSubmitted: boolean = false;
  PermissionList: any = [];
  alertvalue: any;
  disable: boolean = false;
  permission: any;
 
  @ViewChild('tagInput') tagInput!: ElementRef;

  constructor(private router: Router, private api: ApiService, private constant: ConstantService, private http: HttpClient, public activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private common: CommonService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.isSubmitted = false;

    // Create Alert Form
    this.alertfrm = this.formBuilder.group({
      Courier: ['', Validators.required],
      Global: ['', Validators.required]
    });

    // Get permissions from local storage
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    
    this.permission = permissions.find((item: any) => {
      return item.Type == 38;
    });

    
    // Load department list using this function
    if (this.permission.MenuPermission.View == true) {
          // Fetch Email Alert Configuration data
        this.getAlertData();
    }else{
      this.router.navigate(['/lab/dashboard']);
    }
  }

  // Fetch Email Alert Configuration data
  getAlertData() {
    this.api.callApi(
      this.constant.commonEmailAlertConfig,
      [],
      "GET",
      true,
      true
    ).subscribe((res: EmailAlertConfigData) => {
      this.alertresp = res.EmailAlertConfigList;
      this.alertresp.forEach((element: any) => {
        if(element.Emails == null){
          element.Emails = [];
        }else{
        element.Emails = element.Emails.split(',');
        }
      });
      // console.log("Getting Email Alert response", res, this.alertresp);
    }, (err: any) => {
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }

  // Handle key-up events for adding or removing email tags
  onKeyUp(event: KeyboardEvent, type: any, enteredValue: string, orderItem: any): void {
    const inputValue: string = enteredValue.trim();
    // console.log("Getting event code", event.code);
    if (event.code === 'Backspace' && !inputValue) {
      this.alertresp.forEach((element: any) => {
        if (element.Type === type) {
          element.Emails.splice(-1);
        }
      });
      return;
    } else if (event.code == 'Comma' || event.code == 'Space' || event.code == 'Enter' || event.code == 'Tab') {
      event.preventDefault(); 
      this.alertresp.forEach((element: any) => {
        if (element.Type === type) {
          // Define a regular expression pattern for email validation
          const emailPattern: RegExp = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})$/;
          // Check if the entered email matches the pattern
          const isValidEmail: boolean = emailPattern.test(inputValue);
          if (!isValidEmail) {
            // Reset the email control value
            element.OrderItem='';
          }else{
            if (element.Emails.length > 0 && (element.Emails[element.Emails.length - 1] === ',' || element.Emails[element.Emails.length - 1] === ' ')) {
              element.Emails = element.Emails.slice(0, -1);
            }
            else if (inputValue.length > 0 && !element.Emails.includes(inputValue)) {
              element.Emails.push(inputValue);
            }
            element.OrderItem = '';
          }
        }
      });
    }
  }

  // Validate Masking Validation
  checkValidation() {
    this.alertresp.forEach((element: any) => {
      if(element.OrderItem){
              // Define a regular expression pattern for email validation
              const emailPattern: RegExp = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})$/;
              // Check if the entered email matches the pattern
              const isValidEmail: boolean = emailPattern.test(element.OrderItem);
              if (!isValidEmail) {
                // Reset the email control value
                element.OrderItem='';
              }        
      }
    })
  }

  // Remove a tag from the list
  removeTag(emails: any, types: any): void {
    this.alertresp.forEach((element: any) => {
      if (element.Type === types) {
        element.Emails = element.Emails.filter((item: any) => item !== emails);
      }
    });
  }

  // Update Email Alerts configuration
  UpdateAlerts() {
    // console.log("Getting alerts", this.alertresp);
    var alertUpdate: any = [];
    this.alertresp.forEach((items: any) => {
      alertUpdate.push({
        Type: items.Type,
        Emails: items.Emails.join(',')
      })
    });

    let body = {
      EmailAlertConfigList: alertUpdate
    }

    this.api.callApi(
      this.constant.commonEmailAlertConfig,
      body,
      "PUT",
      true,
      true
    ).subscribe((res: any) => {
      var resp = res;
      this.disable = false;
      if (resp.Status == 1) {
        this.toastr.success(resp.Message, 'Access Med Lab');
        alertUpdate = [];
        this.getAlertData();
      } else {

      }
    }, (err: any) => {
      this.disable = false;
      this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
    })
  }
}