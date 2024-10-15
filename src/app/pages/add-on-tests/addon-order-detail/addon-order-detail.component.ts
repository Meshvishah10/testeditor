import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-addon-order-detail',
  templateUrl: './addon-order-detail.component.html',
  styleUrl: './addon-order-detail.component.scss'
})
export class AddonOrderDetailComponent {
  orderId:any
  details:any=''
  commentDetail:any
  comment:string=''
  permission:any
  constructor(
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private common: CommonService,
    private toastr: ToastrService,
    private router: Router,

  ) {}
  ngOnInit() {
    this.orderId = this.activatedRoute.snapshot.params['id'] !== undefined ? this.common.DecryptID(this.activatedRoute.snapshot.params['id']) : '';
    let permissions = this.common.Decrypt(localStorage.getItem('permission'));

    this.permission = permissions.find((item: any) => {
      return item.Type == 19;
    });
    if (this.permission.MenuPermission.View == true) {
      if (this.activatedRoute.snapshot.params['id'] && !this.orderId) {
        this.toastr.error('Invalid Request.');
        this.router.navigate(['/lab/add-on-test']);
        return
      }
      this.OrderDetail()
      this.getCommentList()     
    } else{
      this.router.navigate(['/lab/dashboard']);
  }
 

  }
  OrderDetail(){
    this.api
          .callApi(this.constant.addOnTestOrderDetail+
            '?inputRequest=' +
        encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
          .subscribe(
            (res: any) => {
              this.details = res
            //  console.log("Getting details", this.details);
             // this.clientId=this.details.ClientId
            },
            (err: any) => {
              this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
            }
          );
  }
  getCommentList() {
    this.api
      .callApi(this.constant.addOnTestCommentList +
            '?inputRequest=' +
            encodeURIComponent(this.common.Encrypt(this.orderId)), [], 'GET', true, true)
      .subscribe(
        (res: any) => {
        this.commentDetail=res
        },
        (err: any) => {
          this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
        }
      );
  }
  onAddComment() {
    if (this.comment == '') {
      return;
    } else {
      let body = {
        AddOnTestId: this.orderId,
        Comment: this.comment,
      };
      this.api
        .callApi(this.constant.addOnTestAddComment, body, 'POST', true, true)
        .subscribe(
          (res: any) => {
            var resp = res;
            this.toastr.success(resp.Message, 'Access Med Lab');
            this.comment = '';
            this.getCommentList()
          },
          (err: any) => {     
            this.toastr.error(err.error.errors[0].message, 'Access Med Lab');
          }
        );
    }
  }

}
