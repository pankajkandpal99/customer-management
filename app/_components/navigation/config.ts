import { IconType, RoutePath } from "./types";

export interface NavItemConfig {
  name: string;
  path: RoutePath;
  icon?: IconType;
  subItems?: NavItemConfig[];
  badge?: "dot" | "count";
  // roles?: UserRole[];  // for future role-based access
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
  },
  {
    name: "Customers",
    path: "/dashboard/customers",
    icon: "customers",
    subItems: [
      { name: "All Customers", path: "/dashboard/customers" },
      { name: "Add New", path: "/dashboard/customers/add" },
      {
        name: "Bulk Upload",
        path: "/dashboard/customers/upload",
        icon: "upload",
      },
    ],
  },
  {
    name: "Payments",
    path: "/dashboard/payments",
    icon: "payments",
    // badge: "count",
  },
  {
    name: "Notifications",
    path: "/dashboard/notifications",
    icon: "notifications",
    badge: "dot",
  },
];
