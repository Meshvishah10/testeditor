import { Directive, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appLoadjs]'
})
export class LoadjsDirective implements OnInit {
  
  @Input('script') param:  any;
  
  constructor() { }
  
  ngOnInit() {
      let node = document.createElement('script');
      node.src = this.param;
      node.type = 'text/javascript';
      node.async = false;
      node.charset = 'utf-8';
      document.getElementsByTagName('head')[0].appendChild(node);
  }

}
