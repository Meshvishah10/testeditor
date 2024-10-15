export interface ChargeInvoice {
    Amount: number;
    ClientNumber: string;
    CustomerName: string;
    Description: string | null;
    Id: string;
    Response: string;
    Status: number;
    StatusText: string;
    TotalAmount: number;
    TransactionId: string | null;
  }
  
  export interface ChargeInvoiceResponse {
    AutoBillClientChargeInvoicesList: ChargeInvoice[];
    Total: number;
  }

  export interface CardDetailResponse {
    Amount: number;
    CardCVV: string;
    CardExpirationMonth: string;
    CardExpirationYear: string;
    CardNumber: string;
    ClientNumber: string;
    Description: string | null;
    Email: string;
    FirstName: string;
    FullName: string;
    Id: string;
    LastName: string;
    Response: string;
    Status: number;
    StatusText: string;
    TotalAmount: number;
    TransactionId: string | null;
    ZipCode: string;
  }
  