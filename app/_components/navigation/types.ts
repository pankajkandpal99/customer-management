import { Icons } from "./icons";

export type IconType = keyof typeof Icons;

export type RoutePath =
  | "/dashboard"
  | "/dashboard/customers"
  | "/dashboard/customers/add"
  | "/dashboard/customers/upload"
  | "/dashboard/payments"
  | "/dashboard/notifications";
