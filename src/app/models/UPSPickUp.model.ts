export interface PickupData {
  DateSubmitted: string;
  UPSTrackingId: string;
  ConfirmationCode: number;
  Comments: string;
  AccountNo: string;
  PracticeName: string;
  Phone: string;
  Address: string;
  Exception: null | any;
  PickupDate: string;
  EPickupTime: string;
  LPickupTime: string;
  Stage: number;
  StageName: string;
  Id: string;
}

export type  PickupList = PickupData[];
