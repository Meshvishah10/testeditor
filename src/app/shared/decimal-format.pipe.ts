import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalFormat'
})
export class DecimalFormatPipe implements PipeTransform {
  transform(value: any): string {
    // Ensure value is a number
    const numericValue: number = Number(value);

    // Check if the numericValue is a decimal (has a decimal point)
    if (!isNaN(numericValue) && numericValue % 1 !== 0) {
      // Display two decimal places for decimals
      return numericValue.toFixed(2);
    } else {
      // Display integers as they are
      return numericValue.toString();
    }
  }
}
