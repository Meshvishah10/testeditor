export interface PaymentReport{
    AccountName: string;
    AccountNo: string;
    Amount: number;
    CardType: string;
    ClientBillingId: string;
    Id: number;
    Message: string;
    PaymentDate: string;
    Status: number;
    StatusText: string;
    TransactionId: string;
}

  
  export interface PaymentReportResponse {
    PaymentReportList: PaymentReport[];
    Total: number;
  }
