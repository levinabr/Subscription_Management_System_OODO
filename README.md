# ⚡ PLANZO

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 14">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-v3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM">
  <img src="https://img.shields.io/badge/Database-SQLite_%26_PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="SQLite & PostgreSQL">
  <img src="https://img.shields.io/badge/Zod-3.23-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod Validation">
  <img src="https://img.shields.io/badge/Vitest-2.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest">
</p>

<p align="center">
  <i>A unified enterprise platform to run subscriptions, automated recurring billing, quotation workflows, customer self-service, and real-time revenue analytics.</i>
</p>

---

Welcome to **PLANZO**, a production-grade, end-to-end subscription management and recurring billing platform engineered to power the digital backbone of subscription-based software businesses. Built with Next.js 14 App Router, React 18, Prisma ORM, and Tailwind CSS, PLANZO streamlines the entire recurring revenue lifecycle—from multi-variant product and plan catalog configuration to automated invoice generation, payment reconciliation, discount engines, customer portal self-service, and executive financial dashboards.

🌐 **Live Website**: [https://subscription-management-system-oodo.vercel.app/](https://subscription-management-system-oodo.vercel.app/)  
🎥 **Prototype Video**: [Google Drive Demo](https://drive.google.com/file/d/1V9vZs7Fpznbtuc6FcyvMwsYg6I2vF9aC/view?usp=drive_link)

---

## ✨ Key Features

* **Multi-Variant Product & Plan Catalog:**
  * Configure products with variable pricing models, sales and cost baselines, and multi-dimensional variant adjustments (e.g., brand-specific tier adjustments).
  * Flexible billing cadences: daily, weekly, monthly, and yearly recurring periods with custom terms, minimum commitments, availability windows, and auto-close / auto-renew policies.
* **Subscription Lifecycle & Quotation Engine:**
  * Reusable quotation templates with pre-configured plan lines, product add-ons, and customizable validity periods.
  * Formal lifecycle state machine: **Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed / Paused**.
  * Seamless auto-conversion from approved quotation into active subscription contracts with order-line calculation.
* **Automated Recurring Invoicing & Tax Computation:**
  * Robust billing orchestration that generates accurate recurring invoices with zero duplicates and zero skipped periods.
  * Configurable regional tax rules, automatic percentage/fixed computations, line itemization, and one-click PDF print/export views.
  * Complete invoice state workflow: **Draft &rarr; Sent &rarr; Confirmed &rarr; Paid / Cancelled**.
* **Flexible Discount Engine & Promo Rules:**
  * Admin-defined promotional discounts (percentage or fixed amounts) with usage limits, minimum spend requirements, and validity dates.
  * Automatic application to upcoming renewal invoices with automatic expiration and consumption tracking.
* **Payment Processing & Reconciliation:**
  * Multi-method payment logging (Credit Card, Wire Transfer, Bank Debit, Cash/Check) linked directly to invoices.
  * Instant balance reconciliation with clear audit trails for outstanding, partially paid, and overdue receivables.
* **Role-Based Access Control (RBAC):**
  * **Admin:** Full enterprise governance over products, plans, global tax rules, staff assignments, discount schemes, and system settings.
  * **Internal Staff:** Day-to-day operations handling customer onboarding, quotation generation, subscription maintenance, and payment tracking.
  * **Customer Portal:** Dedicated self-service portal where clients inspect active plans, review billing history, download invoices, and manage payment methods.
* **Real-Time Financial Analytics & Executive Reporting:**
  * Real-time metrics including Monthly Recurring Revenue (MRR), Annual Run Rate (ARR), churn rate, invoice aging, and payment collection efficiency.
  * Highly performant dynamic data architecture guaranteed to render in sub-second response times even with high subscription density.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Full-Stack Framework** | Next.js 14 (App Router & Route Handlers) | Server-side rendering, static generation, and unified REST API endpoints |
| **Frontend UI & Library** | React 18, Lucide React, Tailwind CSS | Modular components, responsive dark/light styling, and accessible layout |
| **Type Safety & Contracts** | TypeScript 5.6 & Zod 3.23 | End-to-end type safety, runtime schema validation, and defensive API boundary handling |
| **Database & ORM** | Prisma 5.22 with SQLite & PostgreSQL | Multi-database compatible ORM with type-safe schema, relational models, and migrations |
| **Authentication & Security** | Custom Session Auth & bcryptjs | Secure password hashing, HTTP-only session cookies, and role-based route guard middleware |
| **Testing & Quality** | Vitest 2.1 | 69 unit and integration tests covering billing dates, calculators, payment flow, and API endpoints |
| **Deployment & CI/CD** | Vercel Platform & GitHub Actions | Automated continuous deployment with custom build pipelines and zero-downtime rollouts |

---

## 🏛️ Architecture

PLANZO is engineered as a **Modular Full-Stack Next.js 14 Monolith**, unifying enterprise business services, database operations, and client UI into an organized, maintainable codebase:

* **Frontend UI Layer (`src/components/` & `src/app/`):** Dynamic SPA console with reactive tabs for Overview, Subscriptions, Quotations, Invoices, Customers, Products & Plans, Recurring Engine, and Audit Logs. Powered by React Context (`DataContext`) with local offline caching and fallback resilience.
* **REST API Layer (`src/app/api/`):** 40+ standardized route handlers providing endpoints for authentication, subscriptions, billing previews, invoices, payments, catalog products, and reporting.
* **Business Service Layer (`src/services/`):** Pure, testable business logic modules governing invoice calculations, payment allocations, subscription state transitions, and billing date orchestration.
* **Database & Persistence Layer (`prisma/` & `src/lib/db/`):** Normalized relational schema with models for Customers, Subscriptions, Invoices, Payments, Products, Plans, Taxes, and Audit Logs. Supports instant zero-config SQLite locally and scales seamlessly to PostgreSQL.

---

## 🗄️ Database Setup

PLANZO supports both **local zero-config SQLite** (for offline and fast development) and **PostgreSQL** (for production environments).

1. Clone or navigate to the project directory.
2. Configure your environment variables in `.env` (or `.env.local`):
   ```env
   # Local SQLite (Default)
   DATABASE_URL="file:./dev.db"

   # Or PostgreSQL
   # DATABASE_URL="postgresql://user:password@localhost:5432/planzo?schema=public"

   SESSION_SECRET="your-32-character-secret-key-goes-here"
   ADMIN_EMAIL="admin@planzo.io"
   ADMIN_PASSWORD="AdminPassword123!"
   ```
3. Generate the Prisma Client and sync the database schema:
   ```bash
   # Generate Prisma client and patch enums
   npm run prisma:generate

   # Push schema to local database
   npm run prisma:push

   # Seed initial mock data (products, plans, staff, taxes)
   npx tsx prisma/seed.ts
   ```

---

## 🚀 How to Run

### Prerequisites

1. **Node.js**: Ensure Node.js (v18.17+ or v20+) is installed.
2. **Package Manager**: `npm` or `pnpm`.

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amalshajimichaelk/Subscription_Management_System_OODO.git
   cd Subscription_Management_System_OODO
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Initialize Database & Seed Data:**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   * The application will run locally at `http://localhost:3000`.

### Running Tests

Execute the comprehensive test suite (69 tests covering calculation, billing orchestrations, auth, and API routes):
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Production Build

To build and run the optimized production bundle:
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
Subscription_Management_System_OODO/
├── prisma/
│   ├── schema.prisma       # Comprehensive relational data models
│   └── seed.ts             # Initial database seeder (plans, products, admin)
├── public/                 # Static assets and icons
├── scripts/
│   ├── patch-prisma-enums.js # Cross-platform enum compatibility script
│   └── test-foundation.ts    # Database connectivity test harness
├── src/
│   ├── app/                # Next.js 14 App Router
│   │   ├── (auth)/         # Login, Register, Forgot Password, Reset Password
│   │   ├── (internal)/     # Internal staff and administration layouts
│   │   ├── api/            # 40+ REST API route endpoints
│   │   ├── portal/         # Customer self-service portal
│   │   ├── layout.tsx      # Root HTML layout and providers
│   │   └── page.tsx        # Main application dashboard entry point
│   ├── components/         # Reusable UI & views
│   │   ├── layout/         # Header, Navigation Sidebar, Command Palette
│   │   ├── modals/         # AddCustomer, NewSubscription, InvoiceDetail, etc.
│   │   └── views/          # Overview, Subscriptions, Invoices, Customers, etc.
│   ├── context/            # React Context (DataContext for state & API syncing)
│   ├── data/               # Default mock datasets and fallback seeds
│   ├── lib/                # Database clients, auth session, utilities
│   ├── services/           # Core business domain services (Billing, Invoices, Payments)
│   ├── types/              # TypeScript interface definitions
│   └── validations/        # Zod validation schemas for all entities
├── tests/                  # Integration & unit test suites (Vitest)
├── vercel.json             # Vercel deployment and build configuration
├── package.json            # Scripts and dependency definitions
└── README.md               # Project documentation
```

---

## 👥 Roles & Access Matrix

| Role | Access Level | Permitted Capabilities |
| :--- | :--- | :--- |
| **Admin** | Full System Control | Staff management, tax rules, discount codes, catalog items, revenue analytics, audit logs |
| **Internal Staff** | Operations & Billing | Customer records, quotation generation, subscription adjustments, invoice payments |
| **Customer** | Self-Service Portal | View active subscriptions, review paid/pending invoices, download PDF receipts |

---

## 🎥 Prototype Video Demo

Watch the comprehensive video demonstration of PLANZO in action:  
👉 **[Watch PLANZO Prototype Video](https://drive.google.com/file/d/1V9vZs7Fpznbtuc6FcyvMwsYg6I2vF9aC/view?usp=drive_link)**
