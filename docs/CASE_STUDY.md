# PERN ERP System: Case Study

## 1. Executive Summary

PERN ERP is a browser-based enterprise resource planning application for industrial operations. It provides a connected workflow for managing products, inventory, customer enquiries, quotations, sales orders, and dispatches.

The system was created to replace disconnected manual steps with a single operational flow:

**Customer enquiry -> Quotation -> Sales order -> Inventory reservation -> Dispatch**

The application uses React and TypeScript for the user interface, Express and TypeScript for the API, PostgreSQL for persistence, and Prisma ORM for database access.

## 2. Business Context

Industrial sales teams commonly manage product availability, customer requests, pricing, order conversion, and dispatch information across spreadsheets, email, and informal communication. This creates several operational risks:

- Product and inventory information can become outdated.
- Customer details may be entered repeatedly or inconsistently.
- Quotations may use incorrect or manually overridden prices.
- Stock can be promised to more than one customer.
- Dispatch information may be incomplete.
- Managers have limited visibility into the state of active work.

PERN ERP addresses these problems by connecting commercial activity to inventory and by keeping important calculations on the server.

## 3. Project Objectives

The project objectives were to:

1. Provide a central interface for industrial sales operations.
2. Display current physical, reserved, and available stock.
3. Capture new enquiries with complete customer information.
4. Generate quotations from database-controlled product prices.
5. Convert accepted quotations into sales orders.
6. Reserve stock during order conversion.
7. Complete dispatches while reducing physical and reserved inventory.
8. Provide role-aware controls for administrative actions.
9. Offer basic user preferences such as theme selection and notifications.

## 4. Target Users

### Administrator

Administrators manage operational activity and have access to administrative controls such as refreshing inventory data and switching the active interface role during development.

### Sales User

Sales users work with customer enquiries, quotations, orders, and dispatch information. They can view inventory but do not receive the administrative stock refresh action.

## 5. Solution Overview

### Frontend

The frontend is a React single-page application built with:

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Lucide React icons
- Tailwind CSS utilities

The main routes are:

| Route | Purpose |
| --- | --- |
| `/login` | User login screen |
| `/inventory` | Inventory and stock status |
| `/enquiries` | Customer enquiry creation and listing |
| `/quotations` | Quotation creation using live enquiry and product data |
| `/orders` | Sales order conversion and dispatch |

### Backend

The backend is an Express API written in TypeScript. It exposes REST endpoints for authentication and ERP operations:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Authenticate or create the development user |
| POST | `/api/auth/register` | Register a user |
| GET | `/api/products` | List products for selectors and pricing |
| GET | `/api/inventory` | Return stock quantities and availability |
| GET | `/api/customers` | List customers |
| GET | `/api/enquiries` | List enquiries with customer details |
| POST | `/api/enquiries` | Create an enquiry and optionally a customer |
| GET | `/api/quotations` | List quotations with customer context |
| POST | `/api/quotations` | Create a server-calculated quotation |
| POST | `/api/orders/convert-quotation` | Convert a quotation into an order and reserve stock |
| POST | `/api/dispatch` | Dispatch an order and settle inventory |

### Database

PostgreSQL stores the operational data. Prisma defines the schema and generates the database client.

The primary entities are:

- `User`
- `Customer`
- `Product`
- `Inventory`
- `Enquiry`
- `EnquiryItem`
- `Quotation`
- `QuotationItem`
- `SalesOrder`
- `SalesOrderItem`
- `Dispatch`
- `DispatchItem`

## 6. Core Workflow

### 6.1 Inventory

Inventory is calculated using:

```text
Available quantity = Physical quantity - Reserved quantity
```

The inventory endpoint joins stock records with products and returns the SKU, product name, base price, physical quantity, reserved quantity, and available quantity.

The interface displays this information in a table. The stock refresh control is restricted to the Administrator role.

### 6.2 Customer Enquiry

A user can select an existing customer or enter a new customer profile containing:

- Company name
- Contact person
- Mobile number
- Email address
- City
- Required date
- Notes

The backend validates that the required customer information is available when no existing customer is selected. It creates the enquiry with a generated enquiry number and a database relationship to the customer.

### 6.3 Quotation

The quotation screen loads live enquiries and products from the backend. Users select an enquiry, select a product, enter quantity, discount, GST, and validity date.

The server obtains the product base price from PostgreSQL. It does not trust a client-supplied unit price.

The calculation is:

```text
Base amount = database unit price x quantity
Discount amount = Base amount x discount percentage / 100
Taxable amount = Base amount - Discount amount
GST amount = Taxable amount x GST percentage / 100
Grand total = Taxable amount + GST amount
```

The quotation and its line items are persisted together using Prisma.

### 6.4 Sales Order Conversion

A quotation can be converted to a sales order. The backend performs this operation inside a database transaction:

1. Load the quotation and quotation items.
2. Confirm that no sales order already exists for the quotation.
3. Lock each inventory row for update.
4. Check available stock.
5. Increase reserved quantity.
6. Create the sales order and its items.
7. Mark the originating enquiry as won.

This prevents the same quotation from being converted twice and protects stock from being reserved beyond availability.

### 6.5 Dispatch

Dispatch requires a sales order, vehicle number, and driver name. During dispatch, the backend transaction:

1. Loads the sales order.
2. Rejects an already-dispatched order.
3. Decreases physical inventory.
4. Decreases reserved inventory.
5. Creates a dispatch record.
6. Marks the sales order as dispatched.

## 7. User Experience Features

The application shell includes:

- Protected application routes.
- Sidebar navigation for operational modules.
- Role-aware administrative controls.
- Light and dark themes stored in browser local storage.
- Notifications with a live count.
- A clear-all notification action.
- Settings for active interface role and theme.
- Live dropdowns instead of requiring users to paste internal database IDs.

The live selectors are important because they reduce invalid UUID entry and make the workflow understandable to non-technical users.

## 8. Data Integrity and Validation

The project applies several safeguards:

- Required request fields are checked before database operations.
- Product prices are read from the database during quotation creation.
- Invalid products and quantities are rejected.
- Customer foreign keys are validated through Prisma relations.
- Quotation-to-order conversion is transactional.
- Inventory rows are locked during reservation.
- Duplicate sales orders for a quotation are rejected.
- Dispatches cannot be repeated for an already-dispatched order.
- The Prisma seed script uses upserts so development data can be recreated safely.

## 9. Development Seed Data

The project includes an idempotent seed script at `backend/prisma/seed.ts`. It creates:

- A development administrator account.
- Three sample products.
- Inventory records for each product.
- A sample customer.

To seed the database:

```powershell
cd backend
npx prisma db seed
```

The database connection is configured through `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp_db?schema=public"
```

## 10. Running the Project

### Backend

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server normally runs on:

```text
http://localhost:5173
```

### Production Builds

```powershell
cd backend
npm run build

cd ../frontend
npm run build
```

## 11. Technical Challenges and Resolutions

### Empty product dropdown and inventory table

The interface initially depended on database records, but no Prisma seed command was configured. As a result, the API returned empty product and inventory collections.

Resolution: a repeatable Prisma seed script and package configuration were added. The script creates products and matching inventory records.

### Hard-coded dynamic values

Early flows used fallback customer IDs, default prices, and default dispatch metadata. These values could hide missing user input and produce incorrect operational records.

Resolution: forms now collect the necessary values, use live lookup endpoints, and the backend validates submitted data.

### Client-supplied quotation pricing

Accepting prices from the browser could allow users or clients to alter financial totals.

Resolution: quotation creation retrieves the product price from the database and calculates totals server-side.

### Inventory race conditions

Two simultaneous order conversions could reserve the same stock.

Resolution: order conversion uses a Prisma transaction and row-level `FOR UPDATE` locking before changing reserved quantities.

### Schema/controller mismatch

Some earlier controller operations attempted to write fields that were not present in the Prisma schema.

Resolution: quotation and order persistence were aligned with the actual schema models and relations.

## 12. Verification

The current project has been checked with:

- Backend TypeScript build.
- Frontend TypeScript and Vite production build.
- Prisma client generation.
- Prisma seed execution.
- Frontend diagnostics for the changed components.
- Backend startup verification.

The frontend build may report Tailwind CSS processing warnings for `@theme`, `@tailwind`, and `@apply`, but the production bundle completes successfully.

## 13. Current Limitations

The following items should be addressed before production deployment:

1. Authentication is currently development-oriented. The login controller returns a mock token and does not verify the submitted password.
2. The role switch control changes the client-side user state and is intended for development/demo behavior. Production role changes must be enforced on the server through verified JWT claims and authorization middleware.
3. The main server entry point currently registers routes without applying authentication middleware to every protected ERP endpoint.
4. Notification data is currently local UI state rather than a persisted notification service.
5. The interface currently creates one quotation line item at a time; a multi-line quotation editor would better support real sales documents.
6. Error messages are displayed through basic alerts or status text and could be replaced with a consistent notification system.
7. The frontend API base URL is hard-coded for local development and should be moved to an environment variable for deployment.
8. Automated integration tests should be expanded to cover the enquiry, dispatch, role authorization, and seed workflows.

## 14. Future Enhancements

Recommended next steps include:

- Replace mock authentication with password hashing, JWT generation, token expiry, and authorization middleware.
- Add customer, product, quotation, order, and dispatch detail pages.
- Add quotation line-item management with multiple products.
- Add search, filtering, pagination, and export features.
- Add audit logging for price changes, stock reservations, role changes, and dispatches.
- Persist notifications in PostgreSQL and mark them read per user.
- Add a dashboard with order pipeline, low-stock alerts, and quotation conversion metrics.
- Add automated API and end-to-end browser tests.
- Configure separate development, staging, and production environment variables.

## 15. Conclusion

PERN ERP demonstrates how a full-stack application can connect sales operations with inventory control. Its main value is the continuity of the workflow: an enquiry becomes a quotation, a quotation becomes an order, the order reserves stock, and dispatch settles the inventory.

The project also shows the importance of reliable seed data, server-side financial calculations, transactional inventory updates, and role-aware user experience. With production-grade authentication, persisted notifications, broader testing, and additional reporting, the application can evolve into a more complete industrial operations platform.
