export interface PatientInfo {
    Id: string;
    OrdernoOrAccessionno: string;
    ClientAccountno: string;
    CurrentFirstName: string;
    CorrectedFirstName: string;
    CurrentLastName: string;
    CorrectedLastName: string;
    CurrentDOB: string;
    CorrectedDOB: string;
    RequestedByName: string;
    Stage: number;
    StageText: string;
    CreatedDate: string;
  }
  
  export interface PatientInfoListResponse {
    PatientInfoList: PatientInfo[];
    Total: number;
  }
  export interface PatientStatusBody {
    Id:string,
    Stage: number,
  }