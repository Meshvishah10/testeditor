export interface productCategory {
  Id: string;
  Name: string;
  Description?: string;
  Sortorder?: number;
  Status?: boolean | number;
  Count?: number;
  StatusText?: string;
}

export interface ProductCategoryListResponse {
  ProductCategoryList: productCategory[];
  Total: number;
}
