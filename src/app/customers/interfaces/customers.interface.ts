
export interface Customer {
  hasItems: boolean;
  items: CustomerItem[];
  total: number;
  page: number;
  pages: number;
}

export interface CustomerItem {
  clientId: number;
  nroDocumento: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

}

export interface CustomerCreationItem {
  nroDocumento: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

}
