# Brightloop — Subscription Control Center

> Make-A-Ton 9.0 / Oodo Hiring Hackathon  
> Technical Foundation, Database, Authentication, RBAC, and Product Catalog  
> Owned by: **Amal Shaji Michael** (`amalshajimichaelk`)  
> Branch: `feature/amal-foundation-auth-catalog`

---

## 1. System Overview

Brightloop is a full-stack enterprise subscription control center managing the end-to-end recurring revenue lifecycle:

```text
Customer Registration → Product/Plan Catalog → Quotation → Subscription → Billing Run → Invoice → Payment → Reporting
```

This repository establishes the shared architecture, database schema, migration history, authentication, role-based access control (RBAC), and catalog management.

---

## 2. Shared Technology Stack

- **Framework**: Next.js App Router (16+)
- **Language**: TypeScript (v5+)
- **Database**: PostgreSQL (v16+)
- **ORM**: Prisma ORM (v6.4.1)
- **Validation**: Zod (v4+)
- **Styling**: Tailwind CSS (v4+) with custom financial SaaS tokens
- **Package Manager**: `pnpm` (v12+)
- **Password Hashing**: `bcryptjs` (12 salt rounds)
- **Sessions**: Cryptographically secure SHA-256 hashed opaque tokens in `HttpOnly` cookies

---

## 3. Architecture & Directory Structure

```text
Subscription_Management_System_OODO/
├── prisma/
│   ├── schema.prisma              # Shared database schema (single owner: Amal)
│   ├── migrations/                # Versioned SQL migrations (20261031040551_init)
│   └── seed.ts                    # Idempotent admin bootstrapping & tax rules
├── scripts/
│   └── test-foundation.ts         # 24-test integration & RBAC verification suite
├── src/
│   ├── app/
│   │   ├── (auth)/                # Customer registration, login, forgot/reset password
│   │   ├── (internal)/            # Protected staff/admin shell, catalog, customers, staff
│   │   ├── portal/                # Customer self-service portal
│   │   ├── api/                   # Thin Route Handlers with standard response helpers
│   │   │   ├── auth/              # /api/auth/register, login, logout, me, forgot, reset
│   │   │   ├── staff/             # Admin-only /api/staff
│   │   │   ├── customers/         # /api/customers & /api/customers/[id]
│   │   │   ├── products/          # /api/products, [id], and [id]/variants
│   │   │   ├── plans/             # /api/plans & /api/plans/[id]
│   │   │   └── taxes/             # /api/taxes & /api/taxes/[id]
│   │   ├── layout.tsx             # Root layout with financial SaaS styling
│   │   ├── page.tsx               # Landing page with session routing
│   │   └── globals.css            # Tailored styling tokens
│   ├── components/
│   │   ├── layout/                # Sidebar, Header, InternalShell
│   │   └── ui/                    # Button, Input, Select, Badge, Card, Table, Modal, States
│   ├── lib/
│   │   ├── auth/                  # password.ts, session.ts, rbac.ts
│   │   ├── db/                    # prisma.ts singleton
│   │   ├── errors/                # api-error.ts (standardized HTTP error mapping)
│   │   └── utils/                 # api-response.ts, format.ts (paise & basis points)
│   ├── services/                  # Business logic services
│   ├── types/                     # Shared API & domain contracts
│   └── validations/               # Zod schemas for auth, customers, products, plans, taxes
├── .env.example
├── package.json
└── pnpm-lock.yaml
```

---

## 4. Database Rules & Shared Contracts (For Levin, Joshil, Joe)

> [!IMPORTANT]
> **Single Ownership**: `prisma/schema.prisma` and `prisma/migrations/` are maintained exclusively by Amal. If your module requires additional fields, request them for coordinated migration. Do **not** run `db push` or alter existing migrations.

### Financial Precision Standards
1. **Currency (Paise)**: All monetary fields are **Integer Paise** (e.g. ₹4,999.00 = `499900`). Floating-point currency is strictly disallowed.
2. **Taxation (Basis Points)**: All tax rates are **Integer Basis Points** (e.g. 18.00% = `1800` bps).
3. **Contractual Snapshot Integrity**:
   - `Subscription` retains `planSnapshotName`, `planSnapshotCode`, `planSnapshotBillingInterval`, `planSnapshotBasePrice`, and `taxRateSnapshot`.
   - `SubscriptionLine` retains `unitPriceSnapshot`, `productNameSnapshot`, `productSkuSnapshot`, and `taxRateSnapshot`.
   - `Invoice` enforces unique `(subscriptionId, periodStart)`.
   - `InvoiceLine` retains complete historical prices, taxes, and discounts.

### Shared Enums
- `UserRole`: `ADMIN`, `STAFF`, `CUSTOMER`
- `ProductType`: `SOFTWARE`, `SERVICE`, `ADD_ON`, `OTHER`
- `BillingInterval`: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`
- `SubscriptionStatus`: `DRAFT`, `QUOTATION`, `CONFIRMED`, `ACTIVE`, `PAUSED`, `CLOSED`, `EXPIRED`
- `InvoiceStatus`: `DRAFT`, `CONFIRMED`, `PAID`, `CANCELLED`
- `DiscountType`: `FIXED`, `PERCENTAGE`
- `DiscountScope`: `PRODUCT`, `SUBSCRIPTION`
- `PaymentMethod`: `BANK_TRANSFER`, `CASH`, `CARD`, `UPI`, `OTHER`

---

## 5. API Response Conventions

All API responses follow the standard envelope format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Completed successfully",
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data provided",
    "details": {
      "email": ["Invalid email address"]
    }
  }
}
```

---

## 6. Role-Based Access Control (RBAC) Interface

Use the reusable server-side authorization helpers in your Route Handlers:

```typescript
import { requireAuthenticatedUser, requireRole, requireCustomerOwnership } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";

// Any valid logged-in user
const user = await requireAuthenticatedUser();

// Admin only
const admin = await requireRole([UserRole.ADMIN]);

// Admin or Staff
const internalStaff = await requireRole([UserRole.ADMIN, UserRole.STAFF]);

// Multi-tenant customer ownership (Customer can only access their own customerId; Admin/Staff can access all)
await requireCustomerOwnership(params.customerId);
```

---

## 7. Setup & Development Instructions

### Prerequisites
- Node.js 20+
- pnpm 12+
- PostgreSQL 16+ running locally on port 5432

### 1. Clone & Install
```bash
git clone https://github.com/levinabr/Subscription_Management_System_OODO.git
cd Subscription_Management_System_OODO
git checkout feature/amal-foundation-auth-catalog
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/brightloop_db?schema=public"
APP_URL="http://localhost:3000"
SESSION_SECRET="brightloop-super-secure-session-secret-key-32chars"
ADMIN_NAME="Brightloop Admin"
ADMIN_EMAIL="admin@brightloop.io"
ADMIN_PASSWORD="AdminPassword123!"
```

### 3. Run Migrations & Seed
```bash
# Apply versioned migrations
pnpm exec prisma migrate dev

# Seed default Admin account and GST 18% tax rule (idempotent)
pnpm exec prisma db seed
```

### 4. Run Test Suite
Verify all 24 integration and RBAC security tests:
```bash
pnpm test
```

### 5. Launch Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

Default bootstrap credentials:
- **Email**: `admin@brightloop.io`
- **Password**: `AdminPassword123!`
