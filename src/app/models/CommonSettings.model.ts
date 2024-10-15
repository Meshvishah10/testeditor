export interface ApiConfig<T = any> {
  name: string;
  form: () => any;
  patchForm: (values: any) => void;
  getPath: string;
  putPath: string;
  type: (data: T) => T; // Make the type property optional
}

export interface LabGen {
  Host: string | null;
  Port: string | null;
  Username: string | null;
  Password: string | null;
  Path: string | null;
  TransferType: string | null;
}

export interface ACHConfig {
  ReturnCheckFee: string | null;
  Email: string | null;
  Phone: string | null;
  Extension: string | null;
}

export interface PowerBIConfig {
  ApplicationId: string | null;
  ApplicationSecret: string | null;
  WorkspaceId: string | null;
  Username: string | null;
  Password: string | null;
}

export interface SalesforceConfig {
  Username: string | null;
  Password: string | null;
  ClientId: string | null;
  ClientSecret: string | null;
}

export interface BillingCycleCsvFileServerConfig {
  Protocol: string | null;
  Host: string | null;
  Port: string | null;
  Username: string | null;
  Password: string | null;
  Folderpath: string | null;
}

export interface SeamlessPayDataConfig {
  SecretKey: string | null;
  CreateAccessTokenURL: string | null;
  CreateTokenURL: string | null;
  CreateChargeURL: string | null;
}

export interface AuthorizeNetConfig {
  APILoginID: string | null;
  TransactionKey: string | null;
  Environment: string | null;
}

export interface BillingContactConfig {
  Phone: string | null;
  Extension: string | null;
  Email: string | null;
}

export interface GoogleReviewAPIConfig {
  ApiUrl: string | null;
  ApiKey: string | null;
  PlaceId: string | null;
  ReviewUrl: string | null;
}

export interface GeneralConfig {
  ResetPasswordLinkExpiryHours: string | null;
  TransactionPercentage: string | null;
  NCUserChangePasswordDays: string | null;
}
