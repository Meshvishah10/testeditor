export interface AddOnTest {
    Accessionno: string;
    CreatedDate: string; // Consider using Date type if you're going to parse this string into a Date object
    Dob: string; // Consider using Date type if you're going to parse this string into a Date object
    Id: string;
    Name: string;
    Orderno: number;
    Status: number;
    StatusText: string;
  }

  
  export interface AddOnTestResponse {
    NCAddOnTestsList: AddOnTest[];
    Total: number;
  }
  export interface AddOnStatusBody {
    Id:string,
    Stage: string,
  }