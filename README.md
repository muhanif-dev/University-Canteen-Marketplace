# University Canteen Marketplace

A Next.js marketplace and ordering platform for university canteens. Students and faculty can browse menus, maintain a cart, place cash-on-pickup orders, and follow order updates. Canteen owners manage their canteen, menu, and incoming orders; a super admin reviews account registrations.

## Features

- Email and password sign-in with approval-aware accounts
- Registration and super-admin approval for students, faculty, and canteen owners
- Role-based access control and server-side ownership checks
- Canteen profile, category, product, stock, and availability management
- Approved student/faculty marketplace browsing and product search
- One-canteen cart, server-priced checkout, and cash on pickup
- Customer order history and cancellation of pending orders
- Owner order workflow and transactional stock reservation/restoration
- Recipient-scoped notifications and unread counts

Online payments, email/SMS delivery, image uploads, and real-time push are not implemented.

## Roles

- **Super Admin:** reviews registration requests. Admin accounts are not publicly registrable; provision an active `SUPER_ADMIN` account securely in MongoDB.
- **Canteen Owner:** manages only their own canteen, products, categories, and orders.
- **Student / Faculty:** after approval, browse and shop; manage only their own cart and orders.

New registrations require approval before marketplace, shopping, or management access is available. The marketplace pages and catalog APIs require an authenticated active student or faculty account.

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

Use Node.js 20.19 or newer (the Vercel project can use Node.js 24) and npm. Install dependencies and copy `.env.example` to `.env`, then set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/university-canteen?replicaSet=rs0
AUTH_SECRET=<at-least-32-random-bytes>
```

Generate a secret locally with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"`. Do not commit `.env` or use a placeholder secret for a real deployment. `CLOUDINARY_*` entries are optional placeholders for a future integration and are not read by the current application.

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

The app uses MongoDB through Mongoose. Checkout, stock changes, order status events, and notifications use MongoDB transactions and require a replica set or mongos; MongoDB Atlas provides a suitable managed deployment option. The local MongoDB service was configured as a single-node `rs0` replica set, and the application's transaction helper passed a read-only transaction probe. A real checkout was not submitted during that probe.

## Deployment: Vercel + MongoDB Atlas

The application uses Vercel's standard Next.js build and does not need a custom `vercel.json`. The local `.env` and `.vercel` directories are ignored by Git. Do not commit Atlas credentials or the production `AUTH_SECRET`.

1. Create an Atlas cluster. Create a database user with read/write access only to the application database, then copy the driver connection string from Atlas. Encode special characters in the database username/password as required by MongoDB's connection string format.
2. Confirm Atlas network access for Vercel. Vercel deployments use dynamic outbound IPs; the Atlas/Vercel integration currently requires an Atlas IP access list entry for all IPs (`0.0.0.0/0`). This widens network reachability, so use a unique database credential with least-privilege access. Choose a supported static-egress or private connectivity option if your account and security requirements allow it. See MongoDB's [Atlas/Vercel integration guide](https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/) and [Atlas connection requirements](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).
3. Import `muhanif-dev/University-Canteen-Marketplace` into Vercel from GitHub. Keep the detected Next.js framework, root directory, install command, and build command (`npm run build`). Set the project Node.js version to 24.x (or another version meeting `>=20.19.0 <25`). Vercel documents [Git deployments](https://vercel.com/docs/deployments/git) and [supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
4. In Vercel Project Settings → Environment Variables, add `MONGODB_URI` and `AUTH_SECRET` for Production. Use the Atlas URI with the application database name. Generate a new production secret locally with the Node command above; do not reuse the local `.env` secret. Vercel environment variables are configured per environment; see [Vercel environment variables](https://vercel.com/docs/environment-variables).
5. If Preview deployments are enabled, give Preview its own `MONGODB_URI` targeting a separate preview database and its own `AUTH_SECRET`. Do not point previews at production data.
6. Trigger a Preview deployment first. Check that the build completes, `/` and `/login` load, and guest access to `/marketplace` redirects to sign-in. Then promote/deploy `main` to Production.
7. Create or securely provision an active `SUPER_ADMIN` account in the Atlas database; the local MongoDB account is not copied to Atlas. Sign in and review registrations, then verify with approved test accounts. Avoid real customer orders while validating.

Checkout, stock updates, and order notifications require MongoDB transactions. Atlas clusters support replica-set transactions; do not substitute a standalone MongoDB deployment for production. No Vercel deployment has been performed yet.

## Security

Passwords are bcrypt-hashed. Sessions use signed JWTs in HTTP-only cookies, with production-only `Secure`, `SameSite=Lax`, expiration, and a minimum-length secret. Protected requests recheck the account's active status and role in MongoDB. Yup validates API input; handlers derive identity from the session, whitelist editable fields, and scope resource queries by owner/customer. Checkout calculates prices on the server and reserves/restores stock transactionally. Security response headers are configured in Next.js.

## Limitations and verification

The test suite covers pure validation rules and password hashing. Live registration/approval, authenticated UI flows, cross-user IDOR checks, database indexes, and transaction rollback/concurrency require a replica-set database and safe test accounts. This repository is deployment-prepared but has not been deployed.
