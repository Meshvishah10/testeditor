import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET } from '@angular/router';
import { filter, distinctUntilChanged, map, subscribeOn } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { Breadcrumb } from '../../../models/general.model';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

export class BreadcrumbsComponent {
  //define breadcrumbs variable
  public breadcrumbs:any;

  constructor(private router: Router,private route:ActivatedRoute,private common:CommonService,private titleService: Title){
    this.breadcrumbs=[]
    let breadcrumb: Breadcrumb = {
      label: 'Dashboard',
      url: 'dashboard'
    };
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
        //set breadcrumbs
        let root: ActivatedRoute = this.route.root;
        this.breadcrumbs = this.getBreadcrumbs(root);
        if(this.breadcrumbs[0]?.label == "Dashboard"){
          // this.breadcrumbs = this.breadcrumbs;
        }else{
         this.breadcrumbs = [breadcrumb,...this.breadcrumbs];
        }
      });
    }


  ngOnInit(): void {
  
  }

  private getBreadcrumbs(route: ActivatedRoute, url: string = "", breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const ROUTE_DATA_BREADCRUMB = 'title';
    
    let childrenurl = this.router.url;
    
    //get the child routes
    let children: ActivatedRoute[] = route.children;
    //return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }
    
    //iterate over each children
    for (let child of children) {
      //verify primary route
      if (child.outlet !== PRIMARY_OUTLET || child.snapshot.url.length==0) {
        continue;
      }

      //verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }
      
      //get the route's URL segment
      let routeURL: string = child.snapshot.url.map(segment => segment.path).join("/");
      
      //append route URL to URL
      url += `/${routeURL}`;
      let admin=url.split('/');
      //  console.log("Getting Admin", admin);
       this.titleService.setTitle(`AML Netcentral - ${child.snapshot.data[ROUTE_DATA_BREADCRUMB]}`);
       if(admin.length == 2){
          if(admin[1] == "emailalerts" || admin[1] == "shipping" || admin[1] == "products" || admin[1] == 'product-category' || admin[1] == 'inventory-mgmt' || admin[1] == 'memberphysician' || admin[1] == 'user' || admin[1] == "department"){
            breadcrumbs.push({label:'Account MGMT',url:''})    
          }
          else if(admin[1] == "salescentral"){
            breadcrumbs.push({label:'Sales Central',url:''})    
          }
          else if(admin[1] == 'ticket-resolution'){
            breadcrumbs.push({label:'Ticket Center',url:''})
          }
      }
      else if(admin.length!= 2 && admin[1] == 'department'){
        breadcrumbs.push({label:'Account MGMT',url:''},{label:'Department',url:'/lab/department'})
      }
      else if(admin.length!=2 && admin[1] == 'access-auto-bill'){
        breadcrumbs.push({label:'Access Auto Bill',url:''})
        if(admin.length > 3 && admin[2] == 'billing-cycle'){
          breadcrumbs.push({label:'Billing Cycle',url:'/lab/access-auto-bill/billing-cycle'})
        }
        else if(admin.length > 3 && admin[2] == 'cash-dash'){
          breadcrumbs.push({label:'Cash Dash',url:'/lab/access-auto-bill/cash-dash'})
        }
        else if(admin.length > 3 && admin[2] == 'charge-invoice'){
          breadcrumbs.push({label:'Charge Invoice',url:'/lab/access-auto-bill/charge-invoice'})
        }
      } 
      else if(admin.length!= 2 && admin[1] == 'user'){
        breadcrumbs.push({label:'Account MGMT',url:''},{label:'User',url:'/lab/user'})
      }
      else if(admin.length!= 2 && admin[1] == 'salescentral'){
        breadcrumbs.push({label:'Sales Central',url:''},{label:'Sales End Of Day Log History',url:'/lab/salescentral'})
      }
      else if(admin.length!=2 && admin[1] == 'products'){
        breadcrumbs.push({label:'Account MGMT',url:''},{label:'Manage Product',url:'/lab/products'})
      }
      else if(admin.length!=2 && admin[1] == 'memberphysician'){
        breadcrumbs.push({label:'Account MGMT',url:''},{label:'Member Physician',url:'/lab/memberphysician'})
      }
      else if(admin.length!=2 && admin[1] == 'ticket-resolution'){
        breadcrumbs.push({label:'Ticket Center',url:''},{label:'Ticket Resolution Center',url:'/lab/ticket-resolution'})
      }
      else if(admin.length!=2 && admin[1] == 'add-on-test'){
        breadcrumbs.push({label:'Addon Tests',url:'/lab/add-on-test'})
      }
      else if(admin.length!=2 && admin[1] == 'rejected-specimens'){
        breadcrumbs.push({label:'Rejected Specimens',url:'/lab/rejected-specimens'})
      }
      else if(admin.length!=2 && admin[1] == 'logistic-central'){
        breadcrumbs.push({label:'Logistic Central',url:''})
        // breadcrumbs.pop();
        // console.log("Getting admin[2]", admin , admin.length != 3 , admin.length);
        if(admin.length != 2 && admin[2] == 'national-order'){
          breadcrumbs.push({label:'National Supply Orders',url:'/lab/logistic-central/national-order'})
          if(admin.length > 3 &&  admin[3] =='detail'){
            breadcrumbs.push({label:'National Supply Order Details',url:''})
          }
        }
        else if(admin.length != 2 &&  admin[2] == 'covid19-order'){
          breadcrumbs.push({label:'Covid-19 Orders',url:'/lab/logistic-central/covid19-order'})
          if(admin.length > 3 &&  admin[3] =='detail'){
            breadcrumbs.push({label:'Covid-19 Order Details',url:''})
          }
          // breadcrumbs.pop()
          }
        else if(admin.length != 2 &&  admin[2]=='salivadirect-order'){
          breadcrumbs.push({label:'At-Home Salivadirect Orders',url:'/lab/logistic-central/salivadirect-order'})
          if(admin.length > 3 &&  admin[3] =='detail'){
            breadcrumbs.push({label:'At-Home Salivadirect Order Details',url:''})
          }
         }
        else  if(admin.length != 2 &&  admin[2]=='noncovid-order'){
          breadcrumbs.push({label:'Non-Covid19 Orders',url:'/lab/logistic-central/noncovid-order'})
          if(admin.length > 3 &&  admin[3] =='detail'){
            breadcrumbs.push({label:'Non-Covid19 Order Details',url:''})
          }
         }
        else  if(admin.length != 2 &&  admin[2]=='cls-order'){
          breadcrumbs.push({label:'CLS Orders',url:'/lab/logistic-central/cls-order'})
          if(admin.length > 3 &&  admin[3] =='detail'){
            breadcrumbs.push({label:'CLS Order Details',url:''})
          }
         }
         else  if(admin.length != 2 &&  admin[2]=='kit-order'){
          breadcrumbs.push({label:'Kits Orders',url:'/lab/logistic-central/kit-order'})
          if(admin.length > 3 &&  admin[3] =='detail'){
            breadcrumbs.push({label:'Kits Order Details',url:''})
          }
         }
         else  if(admin.length != 2 &&  admin[2]=='kit-sold'){
          breadcrumbs.push({label:'Kits Sold',url:'/lab/logistic-central/kit-sold'})
          // if(admin.length > 3 &&  admin[3] =='detail'){
          //   breadcrumbs.push({label:'Kits Sold Details',url:''})
          // }
         }
         else  if(admin.length != 2 &&  admin[2]=='recurring-order'){
          breadcrumbs.push({label:'Recurring Order',url:'/lab/logistic-central/recurring-order'})
         
         }
      }
      else if(admin.length!=2 && admin[1] == 'emr-central'){
        breadcrumbs.push({label:'EMR Requests',url:'/lab/emr-central'})
      }
      else if(admin.length!=3 && admin[1] == 'patient-info'){
        breadcrumbs.push({label:'Update Patient Information',url:'/lab/patient-info'})
      }
      else if(admin.length!=2 && admin[1] == 'web-master'){
        breadcrumbs.push({label:'Web Master',url:''})
        if(admin.length >= 4 && admin[2] == 'manage-coupon'){
          breadcrumbs.push({label:'Manage Coupons',url:'/lab/web-master/manage-coupon'});
        }
        else if (admin.length >= 4 && admin[2] == 'test-searches') {
          breadcrumbs.push({ label: 'Test Searches', url: '/lab/web-master/test-searches' });
          // console.log("Getting stability", admin , this.route.snapshot.params['id'])
          if (admin[3] == 'stability') {
              breadcrumbs.push({ label: 'Edit Test Searches', url: `/lab/web-master/test-searches/edit/${admin[4]}` });
              if (admin.length >= 6 && (admin[5] == 'add' || admin[5] == 'edit')) {
                  breadcrumbs.push({ label: 'Stability', url: `/lab/web-master/test-searches/stability/${admin[4]}` });
              }
          }}
          else if(admin.length >= 4 && admin[2] == 'manage-products'){
            breadcrumbs.push({label:'Manage Products',url:'/lab/web-master/manage-products'});
            }
      
      }
      else if(admin.length!=2 && admin[1] ==  'follow-up'){
        breadcrumbs.push({label:'Follow Up',url:''})
        if(admin.length >= 4 && admin[2] == 'resolution-center'){
          breadcrumbs.push({label:'Resolution Center',url:'/lab/follow-up/resolution-center'});
        }
        // else if(admin.length >= 4 && admin[2] == 'discard-specimen'){
        //   breadcrumbs.push({label:'Returned/Discarded Specimen Log',url:'/lab/follow-up/discard-specimen'});
        // }
       }
     

      //add breadcrumb
      let breadcrumb: Breadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        url: url
      };
      breadcrumbs.push(breadcrumb);
      if(admin[1] == 'ticketcentral'){
        breadcrumbs.pop();
        breadcrumbs.push({label:'Ticket Center',url:''})
        if(admin[2] == 'Complaints'){
        breadcrumbs.push({label:'Create Customer Service Complaints',url:''})
        }
        else if (admin[2] == 'IT-EMR'){
          breadcrumbs.push({label:'Create Customer Service IT/EMR Issues',url:''})
        }
        else if (admin[2] == 'Client&Account'){
          breadcrumbs.push({label:'Create Customer Service Client / Account Billing Ticket',url:''})
        }
        else if (admin[2] == 'Patient'){
          breadcrumbs.push({label:'Create Customer Service Patient Questions',url:''})
        }
        else if (admin[2] == 'Sales'){
          breadcrumbs.push({label:'Create Customer Service Sales Calls',url:''})
        }
        else if (admin[2] == 'National'){
          breadcrumbs.push({label:'Create Customer Service National Calls',url:''})
        }
        else if (admin[2] == 'Centrifuge'){
          breadcrumbs.push({label:'Create Customer Service Centrifuge Issues',url:''})
        }
        else if (admin[2] == 'Technical'){
          breadcrumbs.push({label:'Create Customer Service Lab Technical Questions',url:''})
        }
        else if (admin[2] == 'COMP'){
          breadcrumbs.push({label:'Create Sales COMP Request',url:''})
        }
       }
       else if(admin[1] == 'logistic-central'){
         breadcrumbs.pop();
         if(admin.length >= 4 && admin[2] == "national-order" && admin[3] == 'detail'){
          breadcrumbs.push({label:'Order Details',url:''});
         }
         else if(admin.length >=4 && admin[2] == "national-order" && admin[3] == 'addOrder'){
          breadcrumbs.push({label:'Add National Supply Order',url:''})
         }
         else if(admin.length >=4 && admin[2] == "national-order" && admin[3] == 'editOrder'){
          breadcrumbs.push({label:'Edit National Supply Order',url:''})
         }
         else if(admin.length >=4 && admin[2] == "national-order" && admin[3] == 'order-details'){
          breadcrumbs.push({label:'Order Details',url:''})
         }
         else if(admin.length >=4 && admin[2] == "national-order" && admin[3] == 'order-information'){
          breadcrumbs.push({label:'Order Information',url:''})
         }
         else if(admin.length >=4 && admin[2] == "recurring-order" && admin[3] == 'addOrder'){
          breadcrumbs.push({label:'Add Recurring Order',url:''})
         }
         else if(admin.length >=4 && admin[2] == "recurring-order" && admin[3] == 'editOrder'){
          breadcrumbs.push({label:'Edit Recurring Order',url:''})
         }
       }
      
      

      //recursive
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}
