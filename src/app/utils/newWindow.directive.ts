import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appCtrlKeyOpenNewTab]'
})
export class CtrlKeyOpenNewTabDirective {

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key) {
      const url = window.location.origin + '/' + event.key;
      window.open(url, '_blank');
    }
  }
}
