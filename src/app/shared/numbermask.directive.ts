import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import Inputmask from 'inputmask';

@Directive({
  selector: '[appNumberMask]'
})
export class NumberMaskDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    Inputmask({ mask: '(999)-999-9999' }).mask(this.el.nativeElement);
  }
}
