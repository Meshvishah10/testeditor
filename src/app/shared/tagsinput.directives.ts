import { Directive, ElementRef, AfterViewInit } from '@angular/core';

declare var $: any; // Declare the jQuery variable

@Directive({
  selector: '[appBootstrapTagsInput]'
})
export class BootstrapTagsInputDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    $(this.el.nativeElement).tagsinput();
  }
}
