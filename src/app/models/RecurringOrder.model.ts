export interface RecurringOrderList {
    Address: string;
    ClientNumber: string;
    CompanyName: string;
    DateSubmitted: string; 
    EndDate: string | null; 
    Frequency: number;
    FrequencyText: string;
    Id: string;
    NextDate: string; 
    ShippingMethod: string;
    ShippingType: number;
    Stage: number;
    StageName: string;
    StartDate: string | null; 
  }
  

  export interface RecurringOrderListResponse { 
    OrderList: RecurringOrderList[];
    Total: number;
  }