# Subscription Management System

A unified platform to manage the full lifecycle of a subscription business: from setting up products and plans, to generating invoices, collecting payments, and reporting recurring revenue.

Built around the needs of **Brightloop Software**, a company that sells software on monthly and yearly subscriptions, with add-ons and product variants.

## The Problem

Brightloop currently runs on spreadsheets and manual work. Renewals are missed, invoices are typed by hand, payments are matched against bank statements, and nobody can say how much recurring revenue the company really has. This system replaces all of that with one automated backbone.

## Features

### Authentication and Roles
- Sign up with a unique email and a strong password (more than 8 characters, with uppercase, lowercase and a special character)
- Password reset via a link sent to the registered email
- Role-based access:
  - **Admin**: full control, and the only role that can add staff
  - **Internal staff**: day-to-day work with limited access
  - **Customer**: self-service portal showing only their own subscriptions and invoices

### Products and Variants
- Create products with name, type, sales price, cost price and notes
- Define variants (for example by brand), each with a price adjustment such as +560 for the Odoo brand

### Plans
- Billing periods: daily, weekly, monthly or yearly
- Minimum quantity and availability dates
- Per-plan options set by the admin: auto-close on end date, closable early, pausable, renewable

### Quotation Templates and Subscriptions
- Reusable quotation templates with pre-filled plan and product lines and a validity period in days
- Each subscription has a unique number, customer, plan, start and expiry dates, and payment terms
- Order lines with product, quantity, unit price, taxes and amount
- Status workflow: **Draft → Quotation → Confirmed → Active → Closed**

### Invoicing
- Invoices generated automatically from subscriptions, with customer details, lines, taxes and totals pre-filled
- Automatic tax calculation from admin-defined rules
- Confirm, cancel, send or print any invoice
- Status workflow: **Draft → Confirmed → Paid**
- Safeguards so nothing is billed twice or skipped

### Discounts
- Admin-only discount rules: fixed amount or percentage
- Conditions: minimum purchase or quantity, start and end dates, usage limit
- Apply to specific products or whole subscriptions
- Applied automatically on the next invoice, and stops when expired or exhausted

### Payments
- Record payments with method, amount, date and note against the correct invoice
- Clear view of paid versus outstanding invoices

### Reporting Dashboard
- Active subscriptions, revenue collected, amounts owed, payments and overdue invoices
- Filters and a summary view
- Designed to stay responsive (under 2 seconds per page) with thousands of subscriptions

## Tech Stack

- **Frontend:** _your choice (e.g., React)_
- **Backend:** _your choice (e.g., Node.js / Django / Spring Boot)_
- **Database:** _your choice (e.g., PostgreSQL / MySQL)_

## Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Install dependencies
# (add your install command here)

# Run the app
# (add your run command here)
```

## Roles at a Glance

| Role | Access |
|------|--------|
| Admin | Full system control, manages staff, taxes, discounts, products and plans |
| Internal Staff | Customers, subscriptions and invoices (limited access) |
| Customer | Own subscriptions and invoices via portal |

## License

_Add your license here._
