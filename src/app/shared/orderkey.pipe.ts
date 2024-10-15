import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByKeys'
})
export class OrderByKeysPipe implements PipeTransform {
    transform(value: any): { key: string, value: any }[] {
        if (!value) return [];
        // return Object.keys(value).map(key => ({ key, value: value[key] }));
        return Object.keys(value).map(key => {
          let transformedValue = value[key];
          // Apply conditions on keys here
          if (key !== 'Add' && key !== 'View' && key !== 'Edit' && key !== 'Delete') {
            key = key.replace(/([A-Z])/g, ' $1').trim();
            key = key.charAt(0).toUpperCase() + key.slice(1);
          }
  
          return { key, value: transformedValue };
      });
      }
}
