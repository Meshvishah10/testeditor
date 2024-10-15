import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { mapOperatorToEnum } from 'src/app/utils/filter.enum'; // Adjust the import path

@Injectable({
  providedIn: 'root',
})
export class FilterAndSortingService {

  // Enum mapping for operators
  mapOperatorToEnum: any = mapOperatorToEnum;

  constructor(private datePipe: DatePipe) {}

  // Prepare request payload based on the state (sorting and filtering)
  prepareRequestPayload(state: any): any {
    // Initialize an empty request payload object
    const requestPayload: any = {};

    // Check if sorting information is provided in the state
    if (state.sort) {
      // Map the sorting information to the request payload
      requestPayload.Sorts = state.sort
      ? state.sort
          .filter((sortElement: any) => sortElement.dir)
          .map((sortElement: any) => ({
            Field: sortElement.field,
            Direction: sortElement.dir === 'asc' ? 0 : 1,
          }))
      : null;
    } else {
      // If no sorting information is present, set Sorts to null
      requestPayload.Sorts = null;
    }

    // Check if filtering information is provided in the state
    if (state.filter) {
      // Extract the filters from the state
      const filters = state.filter.filters.map((items: any) => items.filters[0]);

      // Check if there are filters to include in the request payload
      if (filters.length > 0) {
        // Map the filters to the request payload
        var filterArr:any=[];
        filters.forEach((element:any) => {
        if(element.field == 'OrderDate' || element.field == 'CreatedDate'){
          filterArr.push({
            Field: element.field,
            OperatorType: this.mapOperatorToEnum(element.operator),
            Value: this.datePipe.transform(new Date(element.value),'MM/dd/yyyy'),
          })
        }
   
else if(element.field == 'Status'){
          if (typeof element.value === 'boolean') {
            filterArr.push({
              Field: element.field,
              OperatorType: this.mapOperatorToEnum(element.operator),
              Value: element.value ? 1 : 0,
            });
          }else{
            filterArr.push({
              Field: element.field,
              OperatorType: this.mapOperatorToEnum(element.operator),
              Value: element.value
            });
          }
        }
       
        else{
          filterArr.push({
            Field: element.field,
            OperatorType: this.mapOperatorToEnum(element.operator),
            Value: element.value,
          })
        }
      });
        requestPayload.Filters = filterArr
      } else {
        // If no filters are present, set Filters to null
        requestPayload.Filters = null;
      }
    }

    // Return the final request payload
    return requestPayload;
  }
}
