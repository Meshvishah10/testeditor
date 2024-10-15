import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[TrimWhitespace]'
})
export class TrimWhitespaceDirective {

  constructor(private ngControl: NgControl) {}

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string): void {
    this.ngControl.control?.setValue(value.trim());
  }
}
