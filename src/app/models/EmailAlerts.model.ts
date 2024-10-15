export interface EmailAlertConfig {
  Type: number;
  Emails: string[];
  OrderType: string;
}

export interface EmailAlertConfigData {
  EmailAlertConfigList: EmailAlertConfig[];
}
