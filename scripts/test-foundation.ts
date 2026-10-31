import { prisma } from "../src/lib/db/prisma";
import { AuthService } from "../src/services/auth.service";
import { CustomerService } from "../src/services/customer.service";
import { ProductService } from "../src/services/product.service";
import { PlanService } from "../src/services/plan.service";
import { TaxService } from "../src/services/tax.service";
import { validateSessionToken, hashToken, createSession, AuthenticatedUser } from "../src/lib/auth/session";
import { registerSchema, passwordValidation } from "../src/validations/auth/auth.schema";
import { createTaxRuleSchema } from "../src/validations/tax/tax.schema";
import { UserRole, ProductType, BillingInterval } from "@prisma/client";

async function runTests() {
  console.log("=================================================");
  console.log("PLANZO FOUNDATION INTEGRATION & RBAC TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Admin Seed Repeatability
  console.log("1. Testing Admin Seed & Idempotency");
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@PLANZO.io").toLowerCase().trim();
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  assert(!!adminUser && adminUser.role === UserRole.ADMIN, "Bootstrap Admin exists with ADMIN role");

  // 2. Customer Registration
  console.log("\n2. Testing Customer Registration & Transactional Creation");
  const testEmail = `test.corp.${Date.now()}@PLANZO-test.com`;
  const regInput = {
    name: "Aparna Sharma",
    companyName: "Aparna Tech Solutions Pvt Ltd",
    email: testEmail,
    password: "StrongPassword123!",
    phone: "+91 99999 88888",
    taxIdentifier: "32AAAAA1111A1Z1",
  };

  const registeredUser = await AuthService.register(regInput);
  assert(
    registeredUser.role === UserRole.CUSTOMER && registeredUser.customer !== null,
    "Registration creates User with CUSTOMER role and linked Customer record"
  );
  assert(
    registeredUser.customer?.companyName === regInput.companyName,
    "Customer company name matches registration"
  );

  // 3. Duplicate Email Rejection
  console.log("\n3. Testing Duplicate Email Rejection");
  try {
    await AuthService.register(regInput);
    assert(false, "Duplicate email registration did not throw conflict error");
  } catch (err: any) {
    assert(err.code === "CONFLICT", "Duplicate email registration rejected with CONFLICT error");
  }

  // 4. Weak Password Rejection
  console.log("\n4. Testing Weak Password Rejection");
  const weakPasswords = [
    { pass: "short1!", reason: "Too short (<9 chars)" },
    { pass: "nouppercase123!", reason: "Missing uppercase" },
    { pass: "NOLOWERCASE123!", reason: "Missing lowercase" },
    { pass: "NoSpecialChar123", reason: "Missing special character" },
  ];

  for (const item of weakPasswords) {
    const result = passwordValidation.safeParse(item.pass);
    assert(!result.success, `Weak password rejected: ${item.reason}`);
  }

  // 5. Login Flow & Invalid Credentials
  console.log("\n5. Testing Authentication & Session Management");
  try {
    await AuthService.login({ email: testEmail, password: "WrongPassword999!" });
    assert(false, "Invalid password login did not fail");
  } catch (err: any) {
    assert(err.code === "UNAUTHORIZED", "Invalid credentials rejected with UNAUTHORIZED");
  }

  const loggedInUser = await AuthService.login({
    email: testEmail,
    password: "StrongPassword123!",
  });
  assert(loggedInUser.email === testEmail, "Login successful with valid credentials");

  // 6. Expired Session Invalidation
  console.log("\n6. Testing Expired Session Invalidation");
  const expiredToken = "test_expired_token_raw_value_123456789";
  const expiredHash = hashToken(expiredToken);
  await prisma.session.create({
    data: {
      userId: registeredUser.id,
      tokenHash: expiredHash,
      expiresAt: new Date(Date.now() - 10000), // In the past
    },
  });

  const validatedExpired = await validateSessionToken(expiredToken);
  assert(validatedExpired === null, "Expired session token returns null and is rejected");

  // 7. Customer Data Isolation
  console.log("\n7. Testing Customer Multi-Tenant Data Isolation");
  const secondEmail = `other.corp.${Date.now()}@PLANZO-test.com`;
  const otherUser = await AuthService.register({
    name: "Vikram Sen",
    companyName: "Vikram Enterprises",
    email: secondEmail,
    password: "StrongPassword123!",
  });

  try {
    // Customer 1 tries to read Customer 2's data
    await CustomerService.getCustomerById(otherUser.customerId!, registeredUser);
    assert(false, "Cross-customer access was not blocked");
  } catch (err: any) {
    assert(err.code === "FORBIDDEN", "Cross-customer access blocked with FORBIDDEN (403)");
  }

  // 8. Role-Based Access Control: Staff Creation
  console.log("\n8. Testing RBAC: Staff Creation");
  const staffInput = {
    name: "Rohan Staff",
    email: `staff.${Date.now()}@PLANZO.io`,
    password: "StaffPassword123!",
    role: "STAFF" as const,
  };

  const createdStaff = await AuthService.createStaff(staffInput);
  assert(createdStaff.role === UserRole.STAFF, "Admin can create staff accounts");

  // 9. RBAC: Staff & Customer Cannot Create Products
  console.log("\n9. Testing RBAC: Catalog Mutation Restrictions");
  const productInput = {
    sku: `PROD-TEST-${Date.now()}`,
    name: "PLANZO Automation Suite",
    productType: ProductType.SOFTWARE,
    salesPrice: 499900, // ₹4,999.00
    costPrice: 150000,  // ₹1,500.00
    active: true,
  };

  try {
    await ProductService.createProduct(productInput, registeredUser); // CUSTOMER
    assert(false, "Customer was able to create product");
  } catch (err: any) {
    assert(err.code === "FORBIDDEN", "Customer cannot create products (FORBIDDEN)");
  }

  try {
    await ProductService.createProduct(productInput, {
      ...createdStaff,
      customer: null,
    }); // STAFF
    assert(false, "Staff was able to create product");
  } catch (err: any) {
    assert(err.code === "FORBIDDEN", "Staff cannot create products (FORBIDDEN)");
  }

  // 10. Admin Can Manage Catalog & Variants
  console.log("\n10. Testing Admin Catalog & Variant Management");
  if (!adminUser) {
    throw new Error("Admin user not found in database");
  }
  const adminAuth: AuthenticatedUser = {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    customerId: adminUser.customerId,
    createdAt: adminUser.createdAt,
    updatedAt: adminUser.updatedAt,
    customer: null,
  };

  const createdProduct = await ProductService.createProduct(productInput, adminAuth);
  assert(createdProduct.sku === productInput.sku, "Admin successfully creates catalog product");

  const variant = await ProductService.addVariant(
    createdProduct.id,
    {
      optionName: "Tier",
      value: "Enterprise Plus",
      priceAdjustment: 200000, // +₹2,000.00
      active: true,
    },
    adminAuth
  );
  assert(variant.productId === createdProduct.id, "Admin successfully adds product variant");

  const belongs = await ProductService.validateVariantBelongsToProduct(
    createdProduct.id,
    variant.id
  );
  assert(belongs, "Variant validation confirms variant belongs to parent product");

  // 11. Cost Price Masking for Customers
  console.log("\n11. Testing Cost Price Masking from Customers");
  const customerView = await ProductService.getProductById(createdProduct.id, registeredUser);
  assert(
    (customerView as any).costPrice === undefined,
    "Cost price is strictly masked when viewed by Customer role"
  );

  const adminView = await ProductService.getProductById(createdProduct.id, adminAuth);
  assert(
    "costPrice" in adminView && adminView.costPrice === productInput.costPrice,
    "Cost price is visible to Admin role"
  );

  // 12. Tax Rule Validation & Basis Points
  console.log("\n12. Testing Tax Rule Management & Basis Point Precision");
  const taxInput = {
    name: "Integrated GST 18%",
    rate: 1800, // 1800 bps = 18.00%
    active: true,
  };
  const createdTax = await TaxService.createTaxRule(taxInput, adminAuth);
  assert(createdTax.rate === 1800, "Tax rate stored with integer basis points (1800 bps)");

  const invalidTax = createTaxRuleSchema.safeParse({
    name: "Invalid High Tax",
    rate: 12000, // > 10000 bps (100%)
  });
  assert(!invalidTax.success, "Tax rate exceeding 100% (10000 bps) rejected by schema");

  // 13. Subscription Plan & Contract Snapshot Safeguards
  console.log("\n13. Testing Subscription Plan & Contract Snapshot Safeguards");
  const planInput = {
    code: `ANNUAL-PRO-${Date.now()}`,
    name: "Professional Annual Plan",
    basePrice: 999900, // ₹9,999.00
    billingInterval: BillingInterval.YEARLY,
    minimumQuantity: 1,
    canPause: true,
    canRenew: true,
    canCloseEarly: true,
    autoCloseAtEnd: false,
    taxRuleId: createdTax.id,
    active: true,
  };

  const createdPlan = await PlanService.createPlan(planInput, adminAuth);
  assert(createdPlan.code === planInput.code, "Admin creates subscription plan");

  // Snapshot generation
  const snapshot = await PlanService.getPlanSnapshot(createdPlan.id);
  assert(
    snapshot.planSnapshotCode === createdPlan.code &&
    snapshot.planSnapshotBasePrice === createdPlan.basePrice &&
    snapshot.taxRateSnapshot === createdTax.rate,
    "Snapshot correctly captures contractual plan price and tax rate snapshot for subscriptions"
  );

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
