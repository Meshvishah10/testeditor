import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import Inputmask from 'inputmask';

@Directive({
  selector: '[appInputMaskEmail]'
})
export class EmailInputMaskDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    Inputmask({ alias: 'email' }).mask(this.el.nativeElement);
  }
}
