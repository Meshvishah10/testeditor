export interface MenuPermission {
  View: boolean;
  Add?: boolean;
  Edit?: boolean;
  Delete?: boolean;
  Archive?: boolean;
  UnArchive?: boolean;
  ChargeInvoice?: boolean;
  GenerateInvoice?: boolean;
  AddCardInfo?: boolean;
  ManageFreeSupplies?: boolean;
}

export interface MenuItem {
  Id: number;
  Name: string;
  Title: string;
  Type: number;
  ParentId: number | null;
  SortOrder: number;
  MenuPermission: MenuPermission;
  children: MenuItem[];
}
