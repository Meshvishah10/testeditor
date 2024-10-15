export interface BillingCycleDetail {
  Amount: number;
  CPT: string;
  ClientName: string;
  ClientNumber: string;
  DOB: string;
  Gender: string;
  InvoiceNumber: string;
  Number: number;
  PatientName: string;
  SVCDate: string;
  TestPerformed: string;
  Type: string;
  Units: string;
}

export interface BillingCycle {
  BillingFromDate: string; // Assuming dates are represented as strings in ISO format
  BillingPeriod: string;
  BillingToDate: string;
  CreatedDate: string;
  FileName: string;
  GrandTotal: number;
  Id: string;
  InvoiceDate: string;
  Number: number;
  Status: number;
  StatusText: string;
}
