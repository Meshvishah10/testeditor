export interface NationalSupplyOrder {
    Orderno: number; // Assuming Orderno is a number, update it accordingly 
    Stage: number;
    Address: string;
    ClientNumber: string;
    CompanyName: string;
    DateSubmitted: string; 
    Id: string;
    Message: string;
    OrderBy: string;
    OrderStatus: string;
    ShippingMethod: string;
    ShippingType: number;
}


export interface NationalSupplyOrderResponse{
    
OrderList:NationalSupplyOrder[];
    Total: number;
  }

export interface TrackingDetails {
    OrderId: string;
    OrderNumber: number;
    PhysicianName: string;
    TrackingNumber1: string | null;
    TrackingNumber2: string | null;
    TrackingNumber3: string | null;
}

export interface historyDetail{
  What: string;
  When: string;
  Who: string;
}

export interface commentList{  
    Comments: string[];
    CreatedByFullName: string;
    Message: string;
    OrderCreatedDate:  string; 
    OrderId: string;
    Orderno: number;
    PhysicianName: string;

}
export interface TrackingBody {
  OrderId: string;
  TrackingNumber1: string | null;
  TrackingNumber2: string | null;
  TrackingNumber3: string | null;
}

export interface StatusBody {
  OrderId:string,
  Stage: number,
}

export interface CommentBody {
  OrderId:string,
  Note: string,
}

export interface OrderDetails {
  AccountNumber: string;
  ClientId: string;
  Id: string;
  Message: string;
  OrderDate:string; // Depending on how you handle dates in your application
  OrderPlacedBy: string;
  Orderno: number;
  Phone: string;
  Physician: string;
  PostedBy: string;
  ProductAmount: number;
  Products: any[]; // Define the structure of the Products array based on its actual structure
  ShipTo: string;
  ShippingAmout: number;
  ShippingMethod: string;
  ShippingType: number;
  SourceAddress: string;
  SpecialRequest: string | null;
  Total: number;
  UpdatedDate: Date | string; // Depending on how you handle dates in your application
}

export interface Product {
  ProductName: string;
  Quantity: number;
  ApprovedQuantity: number;
}

export interface historyDetails {
  Id: string;
  OrderDate:  string; // Depending on how you handle dates in your application
  Orderno: number;
  OrderStatus: string;
  Products: Product[];
}
