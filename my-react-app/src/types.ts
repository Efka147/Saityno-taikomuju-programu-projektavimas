export type Supplier = {
  _id: string;
  name: string;
  description: string;
  rating: number;
};
export type Warehouse = {
  _id: string;
  supplier: string;
  location: string;
  sizeSquareMeters: number;
};
export type Good = {
  _id: string;
  warehouse: string;
  name: string;
  description: string;
};
export type ErrorResponse = {
  code: string;
  title: string;
  details: string;
};

export enum Roles {
  ADMIN = "admin",
  SUPPLIER = "supplier",
  WAREHOUSE = "warehouse",
}

export enum RouteNames {
  LANDING = "/",
  LOGIN = "login",
  ADMIN = "admin",
  WAREHOUSES = "warehouses",
  GOOD = "good",
}

export type Relations = { [key in Partial<Roles>]: string };
