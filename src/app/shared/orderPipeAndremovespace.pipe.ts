import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByKeysRemoveSpace'
})
export class orderByKeysRemoveSpacePipe implements PipeTransform {
    transform(value: { key: string, value: any }[]): any {
        if (!value) return {};
    
        const result: any = {};
        value.forEach(item => {
          let key = item.key;
          let transformedValue = item.value;
    
          // Undo the key transformation
          key = key.replace(/\s/g, ''); // Remove spaces
          key = key.charAt(0) + key.slice(1); // Convert first letter to lowercase
    
          // Add key-value pair to result object
          result[key] = transformedValue;
        });
    
        return JSON.stringify(result);
      }    
}
