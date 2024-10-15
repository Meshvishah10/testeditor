export interface Sales {
    Id: string;
    Day: string;
    UserName: string;
    CreatedDate: string;
  }
export interface SalesCentralResponse {
    NCSalesCentralList: Sales[];
    Total: number;
  }