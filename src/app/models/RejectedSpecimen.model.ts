export interface RejectedSpecimenList {
    AccessionNumber: string;
    Createddate: string;
    Id: string;
    PatientName: string;
    Specimennumber: number;
    Stage: number;
    StageName: string;
    UserName: string;
  }
 
  export interface RejectedSpecimenListResponse { 
    NCRejectedSpecimenList: RejectedSpecimenList[];
    Total: number;
  }