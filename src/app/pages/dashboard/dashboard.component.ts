import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmbedReport } from 'src/app/models/dashboard.model';
import { ApiService } from 'src/app/services/api.service';
import { ConstantService } from 'src/app/services/constant.service';
import * as pbi from 'powerbi-client';
declare var jQuery: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('reportContainer', { static: false }) reportContainer!: ElementRef;
  
  dbresp:any;
  show:boolean=true;

  errorMessage:any='';
  constructor(  
    private api: ApiService,
    private constant: ConstantService,
    public activatedRoute: ActivatedRoute,
    private renderer: Renderer2){}

    ngOnInit(){
      this.getEmbededReport()
    }

    getEmbededReport(){
      this.api
      .callApi(
        this.constant.Dashboard,
        [],
        'GET',
        true,
        true
      )
      .subscribe(
        (res: EmbedReport) => { 
          this.dbresp=res;
          this.showDashboard(this.dbresp);
          // this.show=false;
          this.errorMessage='';
        },
        (err: any) => {
          this.show=false;
          // if(err?.error.errors[0].message == 'Authentication Failed.'){
              this.errorMessage= err?.error?.errors[0].message;
              // console.log("Getting err", err.error.errors[0].message);
          // }
        }
      );
    }

    

    showDashboard(res: EmbedReport) {
      let config = {
        type: 'report',
        tokenType: pbi.models.TokenType.Embed,
        accessToken: res.EmbedToken,
        embedUrl: res.EmbedUrl,
        id: res.ReportId,
        settings: {
          panes: {
            filters: {
              expanded: false, // Set filters pane to collapsed by default
              visible: false // Hide filters pane
            },
            pageNavigation: {
              visible: false // Hide page navigation pane
            }
          },
          layoutType: pbi.models.LayoutType.Custom,
          customLayout: {
            displayOption: pbi.models.DisplayOption.FitToWidth // Set display option to fit report to width
          }
        }
      };
    
      let reportContainer = this.reportContainer.nativeElement;
      let powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
      let report = powerbi.embed(reportContainer, config);
    
      report.off("loaded");
      report.on("loaded", () => {
        const iframe = reportContainer.getElementsByTagName('iframe')[0];
        this.setDivHeight(iframe.clientHeight);
      });

      report.on('rendered', () => {
        const iframe = reportContainer.getElementsByTagName('iframe')[0];
        this.setDivHeight(iframe.clientHeight);
      });
  
    }

    setDivHeight(height: number) {
      if(height <= 1500){
      this.renderer.setStyle(this.reportContainer.nativeElement, 'height', `${height+900}px`);
      }else{
        this.renderer.setStyle(this.reportContainer.nativeElement, 'height', `${height}px`);
      }
    }

}
