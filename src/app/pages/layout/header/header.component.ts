import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ProfileDataService } from 'src/app/services/profiledata.service';
import { CometChatService } from 'src/app/services/cometchat.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  // Decalre Common Variable
  username: any;
  ProfileImage: any = '';
  userId!: string; //
  widgetScript: HTMLScriptElement | null = null;

  constructor(
    private router: Router,
    private common: CommonService,
    private dataservice: ProfileDataService,
    private renderer: Renderer2,
    private cc: CometChatService,
    private cdr: ChangeDetectorRef,
    private NgZone: NgZone
  ) {}

  ngOnInit() {
    this.dataservice.currentProfileData.subscribe((data) => {
      this.username = data?.FullName;
      this.ProfileImage = data?.LogoURL || '';
      if (data !== null) {
        localStorage.setItem(
          'profileImage',
          this.common.Encrypt(data?.LogoURL)
        );
        localStorage.setItem('fullname', this.common.Encrypt(data?.FullName));
      }
    });
    this.username = this.common.Decrypt(localStorage.getItem('fullname'));
    this.ProfileImage = this.common.Decrypt(
      localStorage.getItem('profileImage')
    );
    // this.InitlizeChat();
  }

  async InitlizeChat() {
    this.userId = localStorage.getItem('userid') as string;
    const init = await this.cc.CC_Initialize();
    if (init) {
      const { data, error } = await this.cc.CC_LoginUser({
        userId: this.userId,
      });
      if (data) {
        this.CC_ScriptInject(data.getAuthToken());
      } else if (error?.code === 'ERR_UID_NOT_FOUND') {
        const { data, error } = await this.cc.CC_CreateUser({
          userId: this.userId,
          userName: this.username,
          userAvatar: this.ProfileImage,
        });
        if (data) {
          const { data, error } = await this.cc.CC_LoginUser({
            userId: this.userId,
          });
          if (data) {
            this.CC_ScriptInject(data.getAuthToken());
          }
        }
      }
    }
  }

  CC_ScriptInject(authToken: string) {
    // Inject the JavaScript code if data condition is met

    // Load cometchatwidget.js dynamically
    this.widgetScript = document.createElement('script');
    this.widgetScript.src =
      'https://widget-js.cometchat.io/v3/cometchatwidget.js';
    this.widgetScript.onload = () => {
      // After cometchatwidget.js is loaded, execute your script
      const script = this.renderer.createElement('script');
      script.type = 'text/javascript';
      script.text = `
        CometChatWidget.init({
          "appID": "${this.cc.appId}",
          "appRegion": "${this.cc.appRegion}",
          "authKey": "${authToken}",
        }).then(response => {
            CometChatWidget.launch({
              "widgetID": "${this.cc.widgetId}",
              "docked": "true",
              "alignment": "right", //left or right
              "roundedCorners": "true",
              "height": "450px",
              "width": "400px",
              "defaultType": 'user' //user or group
            });
          CometChatWidget.openOrCloseChat(true);
        }, error => {
          // console.log("Initialization failed with error:", error);
          //Check the reason for error and take appropriate action.
        });
        `;
      const head = document.head || document.getElementsByTagName('head')[0];
      head.appendChild(script);
    };
    document.head.appendChild(this.widgetScript);
  }

  logout() {
    this.cc.CC_LogOutUser();
    localStorage.clear();
    sessionStorage.clear();
    if (this.widgetScript) {
      // this.widgetScript.remove(); // Remove the dynamically added script
      this.renderer.removeChild(
        this.widgetScript.parentNode,
        this.widgetScript
      );
    }
    window.location.href = '/login';
    // this.router.navigate(['/login'], { skipLocationChange: true });
    // this.router.navigate(['/login'])
  }
}
