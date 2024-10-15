import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from 'src/app/models/Product.model';
import { ListItem } from 'src/app/models/Profile.model';
import { ApiService } from 'src/app/services/api.service';
import { FilterAndSortingService } from 'src/app/services/common-filter-sort.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';
import { parse } from 'uuid';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent {
  isSubmitted: any = false;
  permission: any;
  productForm: any = FormGroup;
  modelDisplay: any = 'none';
  uniqueId: any = '';
  disable: boolean = false;
  categoryDropDown: any;

  constructor(
    private router: Router,
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    public FilterAndSortingService: FilterAndSortingService
  ) {}

  ngOnInit() {
    this.uniqueId = this.activatedRoute.snapshot.params['id'] !== undefined?this.common.DecryptID(this.activatedRoute.snapshot.params['id']):'';
    this.isSubmitted = false;
    // Get permissions from local storage
     //console.log("Getting Permission", permissions);
     if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
      this.toastr.error('Invalid Request.');
  }
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));
    this.permission = permissions.find((item: any) => {
      return item.Type == 40;
    });

    if(this.permission.MenuPermission.Add == true || this.permission.MenuPermission.Edit == true){
    this.getCategoryDropDown();
    if (this.uniqueId != '') {
      this.productForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        productPrice: [null, [Validators.required]],
        dropShipPrice: [null, [Validators.required]],
        details: [''],
        categoryId: ['', [Validators.required]],
        sortOrder: [null, [Validators.required]],
      });
      this.editModel(this.uniqueId);
    } else {
      this.productForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        productPrice: [null, [Validators.required]],
        dropShipPrice: [null, [Validators.required]],
        details: [''],
        categoryId: ['', [Validators.required]],
      });
    }
  }else{
    this.router.navigate(['/lab/dashboard']);
  }
  }

  // Edit product  data by Id
  editModel(id: any) {
    this.uniqueId = id;
    this.api
      .callApi(
        this.constant.product +
          '?inputRequest=' +
          encodeURIComponent(this.common.Encrypt(id)),
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: Product) => {
          var resp = res;
          this.modelDisplay = 'block';
          // console.log(resp);
          this.productForm.reset({
            name: resp.Name,
            description: resp.Description,
            productPrice: resp.Productprice.toFixed(2),
            dropShipPrice: resp.Dropshipprice.toFixed(2),
            details: resp.Details,
            categoryId: resp.Categoryid,
            sortOrder: resp.Sortorder,
          });
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  limitLength(event: any) {
    const maxLength = 9; // Adjust the maximum length as needed
    const input = event.target.value;
  
    if (input.length > maxLength) {
      event.preventDefault();
      event.target.value = input.slice(0, maxLength);
    }
  }

  // Get form controls for validation
  get f() {
    return this.productForm.controls;
  }

  // Save product  data
  onSubmit() {
    if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
      this.toastr.error('Invalid Request.');
      return;
  }
    this.isSubmitted = true;
    if (this.productForm.value.dropShipPrice == '.00' || this.productForm.value.dropShipPrice == '.' || this.productForm.value.dropShipPrice == '') {
      this.productForm.value.dropShipPrice = '0.00';
    }
    if (this.productForm.value.productPrice == '.00' || this.productForm.value.productPrice == '.' || this.productForm.value.productPrice == '') {
      this.productForm.value.productPrice = '0.00';
    }
    if (this.productForm.invalid) {
      return;
    } else {
      if (this.permission.MenuPermission.Add == true) {
        let body = {
          Name: this.productForm.value.name,
          Description: this.productForm.value.description,
          Productprice: this.productForm.value.productPrice == '.'?parseFloat('0.00'): parseFloat(this.productForm.value.productPrice),
          Dropshipprice: this.productForm.value.dropShipPrice == '.'?parseFloat('0.00'): parseFloat(this.productForm.value.dropShipPrice),
          Details: this.productForm.value.details,
          Categoryid: this.productForm.value.categoryId,
        };
        //console.log(body,"body")
        this.disable = true;
        this.api
          .callApi(this.constant.product, body, 'POST', true, true)
          .subscribe(
            (res: any) => {
              var resp = res;
              this.disable = false;
              if (resp.Status == 1) {
                this.toastr.success(
                  resp.Message,
                  'Access Med Lab'
                );
                this.uniqueId = '';
                this.modelDisplay = 'none';
                this.isSubmitted = false;
                this.productForm.reset();
                this.router.navigate(['/lab/products']);
              }
            },
            (err: any) => {
              this.disable = false;
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
      }
    }
  }

  // Update product  data
  onUpdate() {
    if (this.activatedRoute.snapshot.params['id'] && !this.uniqueId) {
      this.toastr.error('Invalid Request.');
      return;
  }
    this.isSubmitted = true;
    if (this.productForm.value.dropShipPrice == '.00' || this.productForm.value.dropShipPrice == '.' || this.productForm.value.dropShipPrice == '') {
      this.productForm.value.dropShipPrice = '0.00';
    }
    if (this.productForm.value.productPrice == '.00' || this.productForm.value.productPrice == '.' || this.productForm.value.productPrice == '') {
      this.productForm.value.productPrice = '0.00';
    }
    if (this.productForm.invalid) {
      return;
    } else {
      let body = {
        Id: this.uniqueId,
        Name: this.productForm.value.name,
        Description: this.productForm.value.description,
        Productprice: this.productForm.value.productPrice == '.'?parseFloat('0.00'): parseFloat(this.productForm.value.productPrice),
        Dropshipprice: this.productForm.value.dropShipPrice == '.'?parseFloat('0.00'): parseFloat(this.productForm.value.dropShipPrice),
        Details: this.productForm.value.details,
        Categoryid: this.productForm.value.categoryId==null?'':this.productForm.value.categoryId,
        Sortorder: this.productForm.value.sortOrder,
      };
       //console.log({ body });
      this.disable = true;
      this.api
        .callApi(this.constant.product, body, 'PUT', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.disable = false;
            if (resp.Status == 1) {
              this.toastr.success(
                resp.Message,
                'Access Med Lab'
              );
              this.uniqueId = '';
              this.modelDisplay = 'none';
              this.isSubmitted = false;
              this.productForm.reset();
              this.router.navigate(['/lab/products']);
            }
          },
          (err: any) => {
            this.disable = false;
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

  getCategoryDropDown() {
    this.api
      .callApi(
        this.constant.productCategoryDropDown,
        [], 'GET', true, true
      )
      .subscribe(
        (res: ListItem) => {
          this.categoryDropDown = res
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }

  // Close add/edit model
  CancelbtnClick() {
    this.uniqueId = '';
    this.isSubmitted = false;
    this.productForm.reset();
    this.router.navigate(['/lab/products']);
  }
}
