export {};

declare module "@prisma/client" {
  export const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly STAFF: "STAFF";
    readonly CUSTOMER: "CUSTOMER";
  };
  export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

  export const BillingInterval: {
    readonly DAILY: "DAILY";
    readonly WEEKLY: "WEEKLY";
    readonly MONTHLY: "MONTHLY";
    readonly YEARLY: "YEARLY";
  };
  export type BillingInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

  export const SubscriptionStatus: {
    readonly DRAFT: "DRAFT";
    readonly QUOTATION: "QUOTATION";
    readonly CONFIRMED: "CONFIRMED";
    readonly ACTIVE: "ACTIVE";
    readonly PAUSED: "PAUSED";
    readonly CLOSED: "CLOSED";
    readonly EXPIRED: "EXPIRED";
    readonly CANCELLED: "CANCELLED";
  };
  export type SubscriptionStatus =
    | "DRAFT"
    | "QUOTATION"
    | "CONFIRMED"
    | "ACTIVE"
    | "PAUSED"
    | "CLOSED"
    | "EXPIRED"
    | "CANCELLED";

  export const InvoiceStatus: {
    readonly DRAFT: "DRAFT";
    readonly CONFIRMED: "CONFIRMED";
    readonly PAID: "PAID";
    readonly CANCELLED: "CANCELLED";
  };
  export type InvoiceStatus = "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED";

  export const PaymentMethod: {
    readonly BANK_TRANSFER: "BANK_TRANSFER";
    readonly CASH: "CASH";
    readonly CARD: "CARD";
    readonly UPI: "UPI";
    readonly OTHER: "OTHER";
  };
  export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "CARD" | "UPI" | "OTHER";

  export const ProductType: {
    readonly SOFTWARE: "SOFTWARE";
    readonly SERVICE: "SERVICE";
    readonly ADD_ON: "ADD_ON";
    readonly OTHER: "OTHER";
  };
  export type ProductType = "SOFTWARE" | "SERVICE" | "ADD_ON" | "OTHER";

  export const DiscountType: {
    readonly FIXED: "FIXED";
    readonly PERCENTAGE: "PERCENTAGE";
  };
  export type DiscountType = "FIXED" | "PERCENTAGE";

  export const DiscountScope: {
    readonly PRODUCT: "PRODUCT";
    readonly SUBSCRIPTION: "SUBSCRIPTION";
  };
  export type DiscountScope = "PRODUCT" | "SUBSCRIPTION";
}
