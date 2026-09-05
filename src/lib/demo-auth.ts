export const DEMO_SUPER_ADMIN = {
  staffId: "st_01",
  email: "priya@reenarathore.admin",
  password: "Admin@2026",
  name: "Reena Rathore",
  role: "Super Admin",
  roleId: "role_super",
  initials: "RR",
} as const;

export const DEMO_STAFF = {
  staffId: "st_02",
  email: "rahul@reenarathore.admin",
  password: "Staff@2026",
  name: "Rahul Iyer",
  role: "Order Manager",
  roleId: "role_orders",
  initials: "RI",
} as const;

export const DEMO_ACCOUNTS = [DEMO_SUPER_ADMIN, DEMO_STAFF] as const;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  initials: string;
};
