import { Component, OnInit , AfterViewInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { MenuItems } from 'src/app/shared/menuItems';
import { CommonService } from "src/app/services/common.service";
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';

declare var jQuery: any;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit , AfterViewInit{
  menulist:any;
  menudata:any;
  imgUrl:any;
  MenuPermission:any;

  nestedMenu:any=[];
  constructor(
    public MenuData:MenuItems,
    private router:Router,
    public route:ActivatedRoute,
    private common:CommonService,
    private api: ApiService,
    private constant: ConstantService
  ) {
  }

  ngOnInit(){
    var perdata= localStorage.getItem('permission')
    
    if(perdata == undefined || perdata == null || perdata == ''){
      this.router.navigateByUrl('/login');
    }else{
       var permission= this.common.Decrypt(localStorage.getItem('permission'));
      //  console.log("Gettin Perdata", permission);
      // const per=permission?.find((item: any) => {
      //   return item.Type == 49;
      // });
      // if (per && per?.MenuPermission.Add == true) {
      //   // Create the object to be added
      //   const newObj = {
      //     Id:101,
      //     Name :'Create  EMR Requests',
      //     ParentId: 49,
      //     SortOrder: 0,
      //     UseForList:true,
      //     Type: 101,
      //     MenuPermission: {Add: true}
        
      //   };
       
      //   // Push the new object to flatArray
      //   permission.push(newObj);
      // }
    this.nestedMenu = this.convertToNestedTree(permission);
      
    }
  }

  convertToNestedTree(flatArray: any[]): any[] {
    const tree: any[] = [];
    const map = new Map();
    var menulist = this.MenuData.getAll();
    flatArray.sort((a, b) => a.SortOrder - b.SortOrder);
 
   

    flatArray.forEach(item=>{
      menulist.forEach(menu=>{
        if(menu.Type == item.Type && menu.UseForList == true){
          map.set(item.Id, { ...item, ...menu, children: [] });
          //   if(item.MenuPermission.Add == undefined || item.MenuPermission.Add == true){
          //   }else{
          // }
        }
      })
    
    })
    
    flatArray.forEach(item => {
      const parent = map.get(item.ParentId);
      if (parent && parent != undefined) {
        parent.children.push(map.get(item.Id));
      } else {
        tree.push(map.get(item.Id));
      }
    });
  
    return tree;
  }

  ngAfterViewInit() {
    this.activateAccordion();
  }

  isChildActive(submenu: any): boolean {
    // Check if any child route is active
    return submenu?.children.some((child:any) => this.router.isActive(`/lab/${child?.to}`, false));
  }

  activateAccordion() {
    // Find the parent accordion element by ID
    const parentAccordion = document.getElementById('accordionFlushExample');
    
    // Loop through menu items and activate the corresponding accordion
    this.nestedMenu.forEach((menu:any, index:any) => {
      const accordionItem = parentAccordion?.querySelector(`#collapseOne_${menu.Type}`);
      
      if (accordionItem && this.isChildActive(menu)) {
        // Remove the 'collapsed' class and add the 'show' class
        accordionItem.classList.add('show');

        // Set the 'aria-expanded' attribute to true
        const accordionButton = parentAccordion?.querySelector(`[data-bs-target="#collapseOne_${menu.Type}"]`);
        if (accordionButton) {
          accordionButton.setAttribute('aria-expanded', 'true');
          accordionButton.classList.remove('collapsed');
        }
      }
    });
  }
}


