export interface Breadcrumb{
    label: string;
      url: string;
  }

  export interface Login{
    UserName: string;
    Password: string;
  }

  export interface forgotpassword{
    Email: string
  }

  export interface codeValidate{
    Code: string
  }

  export interface resetPassword{
    Email: string,
    Password: string,
    Code: string
  }

  export interface SortDescriptor{
    Field: string,
    Direction: Number
  }

  export interface FilterDescriptor{
    Field: string,
    OperatorType: Number,
    Value: string
  }

  export enum FilterOperatorType
{
    IsLessThan = 0,
    IsLessThanOrEqualTo = 1,
    IsEqualTo = 2,
    IsNotEqualTo = 3,
    IsGreaterThanOrEqualTo = 4,
    IsGreaterThan = 5,
    StartsWith = 6,
    EndsWith = 7,
    Contains = 8,
    IsContainedIn = 9,
    DoesNotContain = 10,
    IsNull = 11,
    IsNotNull = 12,
    IsEmpty = 13,
    IsNotEmpty = 14,
    IsNullOrEmpty = 15,
    IsNotNullOrEmpty = 16
}
  