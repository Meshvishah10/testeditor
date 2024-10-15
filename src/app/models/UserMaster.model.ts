import { MenuItem } from './PermissionManagement.model';

export interface User {
  Id: string;
  Name: string;
  Email: string;
  UserName: string;
  DepartmentName: string;
  Status: number;
  StatusText: string;
}

export interface UsersResponse {
  NCUsersList: User[];
  Total: number;
}

export interface UserDetails {
  Id: string;
  FullName: string;
  Logo: string;
  NCDepartmentId: string;
  Password: string;
  UserName: string;
  FirstName: string;
  LastName: string | null;
  Email: string;
}

export interface UserDataWithPermissions {
  UserMenuPermissionsList: MenuItem[];
  Id: string;
  FullName: string;
  Logo: string;
  NCDepartmentId: string;
  Password: string;
  UserName: string;
  FirstName: string;
  LastName: string | null;
  Email: string;
  TokenExpirationMins: number;
  NCDashboardId:number
}
