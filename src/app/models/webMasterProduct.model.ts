export interface ProductResponse {
  ProductList: Product[];
  Total: number;
}

export interface Product {
  Id: string;
  CategoryName: string;
  Code: string;
  Name: string;
  Price: number;
  RouteName: string;
  Status: number;
  StatusText: string;
}