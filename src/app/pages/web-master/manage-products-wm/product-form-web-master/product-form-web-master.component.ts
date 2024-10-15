import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-product-form-web-master',
  templateUrl: './product-form-web-master.component.html',
  styleUrl: './product-form-web-master.component.scss',
})
export class ProductFormWebMasterComponent {
  isSubmitted: any = false;
  permission: any;
  productForm: any = FormGroup;
  uniqueId: any = '';
  categoryList: any;
  resp: any;
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
      this.productForm = this.formBuilder.group({
        name: ['', Validators.required],
        code: [''],
        price: ['', Validators.required],
        categoryId: ['', Validators.required],
        description: [''],
        routeName: [''],
        seoTitle: [''],
        seoDescription: [''],
        label: [''],
        fileName: [''],
        fileContentByteData: [''],
        status: [''],
      });
      this.getCategoryList();
      this.getStatusList();
      if (this.uniqueId != '') {
        this.getDataById();
      }
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  get f() {
    return this.productForm.controls;
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

  getDataById() {
    this.api
      .callApi(
        this.constant.WebMasterProduct +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(this.uniqueId)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: any) => {
          this.resp = res;
          this.productForm.reset({
            name: this.resp.Name,
            code: this.resp.Code,
            price: this.resp.Price.toFixed(2),
            categoryId: this.resp.AffProductCategoryId,
            description: this.resp.Description,
            routeName: this.resp.RouteName,
            seoTitle: this.resp.SEOTitle,
            seoDescription: this.resp.SEODescription,
            label: this.resp.Label,
            fileName: '',
            status: this.resp.Status,
          });
          // const fileInput:any = document.querySelector('input[type="file"]');

          // const myFile = new File([], this.resp.Image, {
          //     type: 'image/jpg',

          // });
          // const dataTransfer = new DataTransfer();
          // dataTransfer.items.add(myFile);
          // fileInput.files = dataTransfer.files;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  getCategoryList() {
    this.api
      .callApi(this.constant.GetAffProductCategoryList, [], 'GET', true, true)
      .subscribe(
        (res: any) => {
          this.categoryList = res;
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.productForm.value.price == '.00' || this.productForm.value.price == '.' || this.productForm.value.price == '') {
      this.productForm.value.price = '0.00';
    }
    if (this.productForm.invalid) {
      return;
    }
    let body: any = {
      Name: this.productForm.value.name,
      Code: this.productForm.value.code,
      Price: this.productForm.value.price,
      AffProductCategoryId: this.productForm.value.categoryId,
      Description: this.productForm.value.description,
      RouteName: this.productForm.value.routeName,
      SEOTitle: this.productForm.value.seoTitle,
      SEODescription: this.productForm.value.seoDescription,
      Label: this.productForm.value.label,
      FileName: this.productForm.value.fileName || '',
      FileContentByteData: this.productForm.value.fileContentByteData || '',
    };
    if (this.uniqueId != '') {
      body.Id = this.uniqueId;
      body.Status = this.productForm.value.status;
      this.update(body);
    } else {
      this.add(body);
    }
    // Save logic here
  }
  add(body: any) {
    this.api
      .callApi(this.constant.WebMasterProduct, body, 'POST', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.router.navigate(['/lab/web-master/manage-products']);
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  update(body: any) {
    this.api
      .callApi(this.constant.WebMasterProduct, body, 'PUT', true, true)
      .subscribe(
        (res: any) => {
          var resp = res;
          if (resp.Status == 1) {
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.router.navigate(['/lab/web-master/manage-products']);
          }
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  onReset() {
    this.isSubmitted = false;
    this.router.navigate(['/lab/web-master/manage-products']);
  }

  onFileSelect(e: any) {
    let filename = e.target.files[0].name;
    let lstindex = filename.lastIndexOf('.') + 1;
    let extfile = filename.substr(lstindex, filename.length).toLowerCase();
    if (extfile == 'jpg' || extfile == 'jpeg' || extfile == 'png') {
      let size = e.target.files[0].size;
      if (size <= 2097152) {
        const reader = new FileReader();
        reader.onload = () => {
          // The result property contains the file's data as a data URL
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytearray = new Uint8Array(arrayBuffer);
          // convert data in array format
          const base64String = Array.from(bytearray);
          // console.log(e.target.files[0].name, base64String);
          // set the request body
          // this.fileName = e.target.files[0].name;
          // this.fileContentByteData = base64String;
          this.productForm.get('fileName')?.setValue(e.target.files[0].name);
          this.productForm.get('fileContentByteData')?.setValue(base64String);
        };
        // This line is missing in your original code
        reader.readAsArrayBuffer(e.target.files[0]);
      } else {
        this.toastr.error(
          "Image size shouldn't be more than 2 MB!",
          'Access Med Lab'
        );
      }
    } else {
      this.toastr.error(
        'Only jpg/jpeg and png files are allowed!',
        'Access Med Lab'
      );
    }
  }
}
