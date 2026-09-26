export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CANTEEN_OWNER: "CANTEEN_OWNER",
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ACCOUNT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const CUSTOMER_TYPE = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
} as const;

export type CustomerType =
  (typeof CUSTOMER_TYPE)[keyof typeof CUSTOMER_TYPE];
