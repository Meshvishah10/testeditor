export interface ListItem {
  Key: string;
  Value: string;
}

export interface MasterDetails {
  NCLevelsList: ListItem[];
  NCDepartmentsList: ListItem[];
  CompanyLocationsList: ListItem[];
}

export interface UserProfile {
  Id: string;
  FullName: string;
  Logo: string;
  NCLevelId: string;
  NCDepartmentId: string;
  Password: string | null;
  Title: string | null;
  Extension: string | null;
  About: string | null;
  UserName: string;
  FirstName: string;
  LastName: string | null;
  Email: string;
  Phone: string;
  BirthDate: string;
  Website: string | null;
  CompanyLocationId: string | null;
}
