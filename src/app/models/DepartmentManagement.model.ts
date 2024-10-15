export interface Department {
  Id: string;
  Name: string;
  Description: string;
  Status: number;
  StatusText: string;
  CreatedDate: string | null;
}

export interface DepartmentsData {
  NCDepartmentsList: Department[];
  Total: number;
}

export interface SpecificDepartment {
  Id: string;
  Name: string;
  Description: string | null;
}
