export interface EMRCentralList {
    AccountNo: string;
    ClientName: string;
    CreatedDate: string;
    EmrTypeText: string;
    Id: string;
    Notes: string;
    Orderno: number;
    PocEmail: string;
    PocName: string;
    PocPhone: string;
    Stage: number;
    StageName: string;
    VendorContact: string;
    VendorContactName: string;
    VendorName: string;
}

  export interface EMRCentralListResponse {
    EmrRequestList?: EMRCentralList[];  
    Total: number;
  }
  

export interface EMRCommentBody {
    EmrCentralId:string,
    Comment: string,
}

export interface EMRCentralDetail {
    AccountNumber: string;
    ClientId: string;
    ClientName: string;
 
    Cost: null | number;
    CreatedDate: string;
    EmrType: number;
    EmrTypeText: string;
    Id: string;
    InterfaceVendor: null | string;
    OrderNo: number;
    PhysicianPin: number;
    PocEmail: string;
    PocName: string;
    PocPhone: string;
    SalesRepId: string;
    SalesRepName: string;
    Stage: number;
    StageText: string;
    Value: null | number;
    VendorContact: string;
    VendorContactName: string;
    VendorName: string;
    Volume: number;
}
export interface EMRCentralDetailResponse {
    GetEmrModel:EMRCentralDetail;
    Comments:any[];
    ClientId:string | undefined

}