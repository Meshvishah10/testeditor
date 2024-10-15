export interface Product {
  Id: string;
  Name: string;
  Description: string;
  Weight: string;
  Productprice: number;
  Dropshipprice: number;
  Details?: string | null;
  Sortorder: number;
  Categoryid: string;
  CategorySortorder: number;
  Status: number;
  Category: string;
  StatusText: string;
}

export interface ProductListResponse {
  ProductList: Product[];
  Total: number;
}
