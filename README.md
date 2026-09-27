# University Canteen Marketplace

A Next.js marketplace and ordering platform for university canteens. Students and faculty can browse menus, maintain a cart, place cash-on-pickup orders, and follow order updates. Canteen owners manage their canteen, menu, and incoming orders; a super admin reviews account registrations.

## Features

- Email and password sign-in with approval-aware accounts
- Registration and super-admin approval for students, faculty, and canteen owners
- Role-based access control and server-side ownership checks
- Canteen profile, category, product, stock, and availability management
- Public marketplace browsing and product search
- One-canteen cart, server-priced checkout, and cash on pickup
- Customer order history and cancellation of pending orders
- Owner order workflow and transactional stock reservation/restoration
- Recipient-scoped notifications and unread counts

Online payments, email/SMS delivery, image uploads, and real-time push are not implemented.

## Roles

- **Super Admin:** reviews registration requests. Admin accounts are not publicly registrable; provision an active `SUPER_ADMIN` account securely in MongoDB.
- **Canteen Owner:** manages only their own canteen, products, categories, and orders.
- **Student / Faculty:** browse, shop, and manage only their own cart and orders.

New registrations require approval before protected shopping or management access is available.

## Tech stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Mongoose 9, MongoDB, Yup, Formik, Axios, jose, and bcryptjs.

## Project structure

```text
app/          App Router pages and API route handlers
components/   Shared UI and feature components
hooks/        React hooks
lib/          Authentication, database, errors, orders, and utilities
models/       Mongoose schemas and indexes
services/     Application service modules
tests/        Dependency-free Node test runner setup and validation tests
types/        Shared roles, statuses, and domain types
validations/  Server-side Yup request schemas
```

## Local setup

Use a supported Node.js release and npm. Install dependencies and copy `.env.example` to `.env`, then set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/university-canteen
AUTH_SECRET=<at-least-32-random-bytes>
```

Generate a secret with `openssl rand -base64 48`. Do not commit `.env` or use a placeholder secret for a real deployment. `CLOUDINARY_*` entries are optional placeholders for a future integration and are not read by the current application.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. MongoDB is required for database-backed routes. Registration requests remain pending until an active super admin approves them.

## Checks

```bash
npm test
npm run type-check
npm run lint
npm run build
npm audit
```

## Database

The app uses MongoDB through Mongoose. Local development may use a standalone MongoDB for non-transactional features. Checkout, stock changes, order status events, and notifications use MongoDB transactions and require a replica set or mongos; MongoDB Atlas provides a suitable managed deployment option. Transaction flows have not been verified against a live database in this workspace.

## Deployment

The intended deployment is the Next.js application on Vercel backed by MongoDB Atlas. Configure `MONGODB_URI` and a unique strong `AUTH_SECRET` in Vercel's environment variables for each environment. Configure the same variables in local `.env` for development. No Vercel deployment has been performed.

## Security

Passwords are bcrypt-hashed. Sessions use signed JWTs in HTTP-only cookies, with production-only `Secure`, `SameSite=Lax`, expiration, and a minimum-length secret. Protected requests recheck the account's active status and role in MongoDB. Yup validates API input; handlers derive identity from the session, whitelist editable fields, and scope resource queries by owner/customer. Checkout calculates prices on the server and reserves/restores stock transactionally. Security response headers are configured in Next.js.

## Limitations and verification

No `.env` or MongoDB service/test accounts were available during finalization. The test suite covers pure validation rules and password hashing; live registration/approval, authenticated UI flows, cross-user IDOR checks, database indexes, and transaction rollback/concurrency still require a replica-set database and safe test accounts. This repository is deployment-prepared but has not been deployed.
