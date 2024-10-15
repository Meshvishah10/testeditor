import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAmountFormat]',
})
export class AmountFormatDirective {
  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove any non-numeric characters except dot
    value = value.replace(/[^0-9.]/g, '');

    // Ensure only one dot is present in the value
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // If value is .00, replace with 0.00
    if (value == '.00' || value == '.' || value == '') {
      value = '0.00';
    }

    // Format the value as currency
    const formattedValue = this.formatCurrency(value);

    // Update the input value
    this.el.value = formattedValue;
  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Clear the value if it's 0.00
    if (input.value === '0.00') {
      input.value = '';
    }
  }

  private formatCurrency(value: string): string {
    if (!value) {
      return '0.00';
    }

    // Ensure there are always two decimal places
    const [integerPart, decimalPart = ''] = value.split('.');
    const formattedDecimal = (decimalPart + '00').substring(0, 2);

    return `${integerPart}.${formattedDecimal}`;
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): boolean {
    const key = event.key;
    const value = this.el.value;

    // Allow only numbers, one period, and control keys
    if (
      (key >= '0' && key <= '9') ||
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      (key === '.' && !value.includes('.'))
    ) {
      return true; // Allow numeric input and control keys, and only one dot
    }

    event.preventDefault(); // Prevent other input
    return false;
  }
}
