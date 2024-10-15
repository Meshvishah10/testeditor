import { Pipe, PipeTransform } from '@angular/core';
import { parsePhoneNumber } from 'libphonenumber-js';

@Pipe({
    name: 'phoneFormat'
  })
export class PhoneFormatPipe implements PipeTransform {
  
  transform(number:any) {
    if(number != '' && number.length == 10){
    const stringPhone = number + '';
    const phoneNumber = parsePhoneNumber(stringPhone, 'US');
    const formatted = phoneNumber.formatNational();
    return formatted;
    // return "("+stringPhone.slice(0,3)+") "+ stringPhone.slice(3,6)+"-"+stringPhone.slice(6,10)
    }else{
        return number
    }

  }
  
} 