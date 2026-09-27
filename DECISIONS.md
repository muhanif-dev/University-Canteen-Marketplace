# Decisions

## Phase 1 — Foundation

### 1. Tailwind CSS v4 with CSS-first configuration

**Decision:** Use Tailwind CSS v4 with the CSS-first approach (no `tailwind.config.ts`).
**Reason:** The project was initialized with Tailwind v4 and `@tailwindcss/postcss`. The v4 CSS-first approach is the current stable direction and reduces configuration overhead.

### 2. shadcn/ui new-york style with neutral base color

**Decision:** Use the `new-york` style variant of shadcn/ui with a `neutral` base color and CSS variables enabled.
**Reason:** The new-york style is compact and modern. Neutral base color keeps the UI professional and easy to customize. CSS variables allow dark mode support.

### 3. OKLCH color space for design tokens

**Decision:** Use OKLCH color values in `globals.css` design tokens.
**Reason:** shadcn/ui v4 defaults use OKLCH for perceptually uniform color manipulation. This matches the shadcn/ui ecosystem.

### 4. Path alias `@/*` for imports

**Decision:** Use the `@/*` path alias mapping to the project root.
**Reason:** Already configured in the existing `tsconfig.json` and required by `components.json` for shadcn/ui alias resolution.

### 5. Role and status definitions as const objects

**Decision:** Define roles, account statuses, order statuses, and customer types as `as const` objects in `types/index.ts` rather than TypeScript enums.
**Reason:** `as const` objects avoid the runtime and isolatedModules complexities of enums while providing full type safety and tree-shakeable imports.

### 6. Error infrastructure as class hierarchy

**Decision:** Create an `AppError` base class with subclasses (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`) in `lib/errors.ts`.
**Reason:** Provides a consistent, typed error foundation for future API route handlers to extend. Each error carries a status code and machine-readable code.

### 7. tw-animate-css instead of tailwindcss-animate

**Decision:** Use `tw-animate-css` for animation utilities.
**Reason:** `tailwindcss-animate` is not compatible with Tailwind v4. `tw-animate-css` is the v4-compatible replacement used by the current shadcn/ui setup.

## Phase 2 — Database Foundation

### 8. Mongoose as the MongoDB ODM

**Decision:** Use Mongoose for MongoDB interaction rather than the native MongoDB driver.
**Reason:** Mongoose provides schema-based modeling, built-in validation, middleware hooks, and TypeScript support. The MASTER_PROMPT explicitly requires Mongoose. It simplifies future model implementation.

### 9. Connection caching via module-level variable

**Decision:** Cache the Mongoose connection in a module-level `cachedConnection` variable instead of using `globalThis`.
**Reason:** Module-level caching is simpler and sufficient for Next.js development hot-reload prevention. The `connectDB` function checks `readyState === 1` before reusing a cached connection. This avoids the complexity and type-safety challenges of `globalThis` with strict TypeScript.

### 10. `bufferCommands: false` on Mongoose connection

**Decision:** Disable Mongoose command buffering (`bufferCommands: false`).
**Reason:** When the database is not connected, queries should fail immediately rather than hanging silently. This provides clearer error feedback during development and avoids masking connection issues in API routes.

### 11. Database connection utility location: `lib/db.ts`

**Decision:** Place the database connection utility in `lib/db.ts` alongside other infrastructure utilities.
**Reason:** The existing architecture separates infrastructure code into `lib/` (utils, errors). Placing the database connection there keeps related concerns together and makes it easily importable by future API route handlers via `@/lib/db`.

### 12. Database errors use existing AppError infrastructure

**Decision:** Throw `AppError` instances from `lib/db.ts` instead of raw `Error` objects.
**Reason:** Reuses the Phase 1 error hierarchy. Database errors get a `DB_CONFIG_ERROR` or `DB_CONNECTION_ERROR` code and a 500 status code, keeping error handling consistent across the application.

## Phase 3 — Authentication Foundation

### 13. bcryptjs for password hashing

**Decision:** Use `bcryptjs` instead of `bcrypt` or `argon2`.
**Reason:** `bcryptjs` is a pure-JavaScript implementation that works natively on Windows without native compilation issues. It is well-maintained, widely used in the Node.js ecosystem, and provides strong security with configurable salt rounds (12 rounds used).

### 14. jose for JWT session management

**Decision:** Use `jose` library for JWT signing and verification instead of `jsonwebtoken`.
**Reason:** `jose` is designed for modern JavaScript runtimes, Edge runtime compatibility, and uses the Web Crypto API. It works seamlessly with Next.js App Router and is actively maintained.

### 15. HTTP-only JWT cookie session strategy

**Decision:** Store the session as a JWT in an HTTP-only cookie rather than using server-side session storage.
**Reason:** A stateless JWT cookie approach avoids the need for a session store, works well with serverless/edge deployment, and scales naturally. The cookie is HTTP-only (not readable by JavaScript), secure in production, and SameSite=lax to prevent CSRF. The JWT contains userId, role, and email only.

### 16. `passwordHash` excluded from serialization

**Decision:** Use Mongoose `toJSON` and `toObject` transforms to remove `passwordHash` from all serialized output. Also use `select: false` on the schema field.
**Reason:** Defense in depth. Even if a User document is accidentally returned in an API response, the password hash will not be exposed. The `select: false` prevents it from being included in queries by default, and the transforms remove it if explicitly selected.

### 17. Single User model with role field and hot-reload model caching

**Decision:** Use a single `User` model with a `role` field rather than separate models per role for authentication credentials, and reuse `mongoose.models.User` during development.
**Reason:** Authentication credentials (email, passwordHash) should live in one place. Future Student, Faculty, and Canteen models will reference the User document rather than duplicating auth fields. Reusing `mongoose.models.User` prevents `OverwriteModelError` when Next.js re-evaluates modules during hot reload.

### 18. Yup for validation schemas

**Decision:** Use `yup` for server-side validation schemas.
**Reason:** The MASTER_PROMPT specifies Yup for form validation. Using Yup for server-side validation as well ensures consistency between client and server validation. The schemas are reusable and type-safe via `yup.InferType`.

## Phase 4 — Registration & Approval Foundation

### 19. Role-specific domain models referencing central User model

**Decision:** Maintain `User` as the sole authentication/account model, while creating dedicated `Student`, `Faculty`, and `Canteen` models that reference `user._id` via ObjectId.
**Reason:** Separates authentication and credentials from domain-specific profile data. Prevents duplication of passwords, emails, and statuses while allowing role-specific fields (e.g. `studentId`, `employeeId`, `canteenName`, opening hours) to scale independently.

### 20. Dedicated and unified registration API routes with public Super Admin block

**Decision:** Provide dedicated endpoints (`/api/auth/register/student`, `/api/auth/register/faculty`, `/api/auth/register/canteen-owner`) alongside a unified `/api/auth/register` dispatcher, and explicitly block `SUPER_ADMIN` registration at the API level.
**Reason:** Gives maximum API flexibility and clear validation error boundaries. Explicitly blocking `SUPER_ADMIN` from public registration prevents privilege escalation attacks.

### 21. Strict registration state transitions with mandatory rejection reason

**Decision:** Restrict approval and rejection state transitions strictly: approval only permits `PENDING` → `ACTIVE`, and rejection only permits `PENDING` → `REJECTED` and requires a non-empty `reason`.
**Reason:** Prevents race conditions and unintended status mutations (e.g., accidental reactivation of suspended accounts via the registration approval handler). Recording the rejection reason satisfies the requirement that rejected users understand why their submission was turned down.

### 22. Formik and Axios for client registration forms

**Decision:** Use Formik for client-side form state management and Axios for API requests in the registration UI.
**Reason:** Explicitly matches the technology stack requirements of the master prompt, enabling client-side validation using the same Yup schemas as the server-side route handlers.

## Phase 5 — Canteen Owner Dashboard

### 23. Owner profile APIs derive ownership from the active server session

**Decision:** Canteen profile GET, POST, and PATCH operations use the authenticated session's user ID, and the authorization helper verifies both the database role and active account status.
**Reason:** A client-provided owner ID cannot authorize cross-owner access, and rechecking the database prevents stale session claims from retaining access after an account change.

### 24. Canteen verification and activation fields stay outside owner profile edits

**Decision:** Profile edits cannot change owner reference, CNIC, approval, active state, or verification documents. Creating a missing profile leaves it unapproved and inactive.
**Reason:** These fields represent identity or administrative review state. They must not become self-approvable through owner profile management; CNIC is also omitted from profile API responses.

## Phase 6 — Marketplace

### 25. Categories are canteen-scoped and uniquely named within each canteen

**Decision:** Every category references one canteen and has a case-insensitive unique name constraint scoped to that canteen.
**Reason:** A category should organize one owner's menu and must not be shared across unrelated canteens or duplicated with casing differences.

### 26. Products and categories are deactivated instead of physically deleted

**Decision:** Category delete requests set `isActive` to false and product delete requests set `isAvailable` to false. Marketplace queries exclude inactive categories and unavailable or out-of-stock products.
**Reason:** Preserving records keeps product/category references intact for future platform history while removing them from public browsing.

### 27. Marketplace browsing uses public, read-only endpoints

**Decision:** Marketplace reads are public and return only approved/active canteens, active categories, and available products in stock; owner mutations still require active canteen-owner authorization.
**Reason:** The master prompt describes a public marketplace while reserving account approval for later shopping actions; read-only data is explicitly projected to avoid private account fields.

## Phase 7 — Cart & Orders

### 28. Each customer cart holds items from one canteen and stores no price snapshots

**Decision:** Enforce one canteen per cart. Cart lines store only product references and quantities; current prices are re-read for display and checkout.
**Reason:** One order has one fulfiller, and avoiding cart prices prevents stale or client-controlled price totals. Customers clear the cart before switching canteens.

### 29. Orders snapshot fulfillment and pricing details; order creation is transactional

**Decision:** Orders keep product/category/canteen name and price snapshots. Order creation conditionally decrements stock, creates the order, and clears the cart in one MongoDB transaction.
**Reason:** Historical orders remain meaningful after catalog edits, while transaction rollback protects stock and cart consistency during errors or concurrent checkout attempts.

### 30. Stock is reserved at checkout and restored on pending cancellation or rejection

**Decision:** Reserve stock with atomic conditional decrements when an order is placed. Restore it when a customer cancels a pending order or an owner rejects a pending order.
**Reason:** This prevents two buyers from ordering the last unit and avoids keeping stock reserved for terminal orders.

### 31. Order status transitions follow the pickup workflow

**Decision:** Owners may move PENDING to ACCEPTED or REJECTED, then ACCEPTED to PREPARING to READY to COMPLETED. Customers may cancel only their own PENDING order. Rejected, cancelled, and completed orders are terminal.
**Reason:** This follows the master prompt's example sequence and makes rejection/cancellation explicit without allowing arbitrary status changes.

### 32. Cash on Pickup is the sole Phase 7 payment method

**Decision:** Store `CASH_ON_PICKUP` on every order; do not add payment-status state or payment processing.
**Reason:** The master prompt specifies Cash on Pickup as the initial method and defers online payment functionality.
