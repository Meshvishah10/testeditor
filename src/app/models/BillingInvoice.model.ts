export interface BillingInvoice {
    Amount: number;
    ApprovalStatus: number;
    ApprovalStatusText: string;
    CreatedDate: string;
    Email: string;
    Ext: number;
    Id: string;
    Invoiceno: number;
    PaymentDueDate: string | null;
    PaymentStatus: number;
    PaymentStatusText: string;
    PendingAmount: number;
    Phone: string;
    PhysicianName: string;
    UpdatedDate: string | null;
  }
  
  export interface BillingInvoiceResponse {
    BillingInvoicesList: BillingInvoice[];
    Total: number;
  }

  export interface BillingInvoiceCommentBody {
    ClientBillingId:string,
    Comment: string,
}