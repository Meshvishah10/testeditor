import { Component, Renderer2 } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {


  constructor(
    private common: CommonService
  ) {}

  async ngOnInit() {
  }
}
