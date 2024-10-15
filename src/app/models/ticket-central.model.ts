export interface TicketCenter{
    Id: string;
    TicketNumber:number;
    CreatedDate: string;
    UserName: string;
    Severity: string;
    Stage: string;
    Type:string;
    TypeId:number;   
  }

  export interface TicketCenterResponse{
    NCSalesCentralList:TicketCenter[];
    Total: number;
  }