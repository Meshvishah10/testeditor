import { Component  , OnInit} from '@angular/core';
import { CommonService } from './services/common.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettingsService } from './services/app-settings.service';
import { LoaderService } from './services/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'labadmin';
  apiUrl:any=AppSettingsService.apiUrl()

  constructor(private common:CommonService,
              private http: HttpClient,
              private loaderService: LoaderService,
              private router: Router){}

  ngOnInit():void{
    // console.log("Getting apiUrl", this.apiUrl)
    this.loaderService.show();
    this.http.get(this.apiUrl+'Common/IPChecker').subscribe((res:any)=>{
      // console.log("Getting response", res);
      this.loaderService.hide();
    },(err:any)=>{
      this.loaderService.hide();
      this.router.navigate(['/accessdenied']);
      // console.log("Getting Error", err);
    })
  }
}
