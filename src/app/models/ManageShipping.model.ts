export interface Shipping {
  Type: number;
  ShippingName: string;
  Amount: number;
  Status: number;
  StatusText: string;
  CreatedDate: string;
}

export interface ShippingListData {
  ShippingsList: Shipping[];
  Total: number;
}
