import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appFocusFirstInput]'
})
export class FocusFirstInputDirective implements AfterViewInit {

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    // Find the first input element and set focus
    const firstInput: HTMLInputElement = this.el.nativeElement.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  }
}
