export interface ClientBilling {
    Amount: number;
    ApprovalStatus: number;
    ApprovalStatusText: string;
    CreatedDate: string; // Consider using Date type if you're going to parse this string into a Date object
    Id: string;
    Invoiceno: number;
    PaymentDueDate: string; // Consider using Date type if you're going to parse this string into a Date object
    PaymentStatus: number;
    PaymentStatusText: string;
    PracticeName: string;
  }
  
  export interface ClientBillingResponse {
    ClientBillingList: ClientBilling[];
    Total: number;
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


export interface BillingCommentBody {
    ClientBillingId:string,
    Comment: string,
}
