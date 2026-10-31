const fs = require('fs');
const path = require('path');

const defaultJsPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client', 'default.js');
const indexJsPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client', 'index.js');

const patchContent = `const enums = {
  UserRole: { ADMIN: "ADMIN", STAFF: "STAFF", CUSTOMER: "CUSTOMER" },
  BillingInterval: { DAILY: "DAILY", WEEKLY: "WEEKLY", MONTHLY: "MONTHLY", YEARLY: "YEARLY" },
  SubscriptionStatus: { DRAFT: "DRAFT", QUOTATION: "QUOTATION", CONFIRMED: "CONFIRMED", ACTIVE: "ACTIVE", PAUSED: "PAUSED", CLOSED: "CLOSED", EXPIRED: "EXPIRED", CANCELLED: "CANCELLED" },
  InvoiceStatus: { DRAFT: "DRAFT", CONFIRMED: "CONFIRMED", PAID: "PAID", CANCELLED: "CANCELLED" },
  PaymentMethod: { BANK_TRANSFER: "BANK_TRANSFER", CASH: "CASH", CARD: "CARD", UPI: "UPI", OTHER: "OTHER" },
  ProductType: { SOFTWARE: "SOFTWARE", SERVICE: "SERVICE", ADD_ON: "ADD_ON", OTHER: "OTHER" },
  DiscountType: { FIXED: "FIXED", PERCENTAGE: "PERCENTAGE" },
  DiscountScope: { PRODUCT: "PRODUCT", SUBSCRIPTION: "SUBSCRIPTION" },
};

module.exports = {
  ...enums,
  ...require('.prisma/client/default'),
  ...enums,
};
`;

try {
  if (fs.existsSync(defaultJsPath)) {
    fs.writeFileSync(defaultJsPath, patchContent);
  }
  if (fs.existsSync(indexJsPath)) {
    fs.writeFileSync(indexJsPath, patchContent);
  }
} catch (e) {
  // ignore
}
