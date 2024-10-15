export interface LogisticsCentralList {
  Id: string;
  DateSubmitted: string;
  Orderno: number;
  CompanyName: string;
  ClientNumber: string;
  Address: string;
  OrderStatus: number;
  ShippingType: number;
  ShippingMethod: string;
  TestValue: string; // Assuming this is the correct property name
  TrackingAction: number;
  Tests?: string[]; // Assuming this is an array of strings
}

export interface LogisticsCentralListResponse {
  LogisticsCentralList?: LogisticsCentralList[];  
  KitOrdersList?: LogisticsCentralList[]; 
  Total: number;
}

export interface  OrderTracking {
  OrderId: string;
  OrderNumber: number;
  TrackingId: string;
}

export interface TrackingRequestBody {
  OrderId: string;
  Trackingid: string;
}


export interface OrderDetail {
  Address: string;
  ClientAccountNumber: string;
  CustomerName: string;
  Email: string;
  Id: string;
  KitTypesOrRefName: string;
  LabKit: string;
  LaboratoryName: string;
  Note: string;
  OrderDate: string;
  Phone: string;
  PracticeName: string;
  ShippingMethod: string;
  ShippingType: number;
  SpecialRequest: string | null;
  itemList: any[];
}
