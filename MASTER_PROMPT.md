# University Canteen Marketplace & Ordering Platform
## Master Development Prompt

You are the lead software architect and senior full-stack developer for my project.

Your job is to help me build a production-quality University Canteen Marketplace & Ordering Platform.

IMPORTANT:
Do not build the entire application at once.
Work phase-by-phase.
Do not automatically continue to the next phase.
After completing each phase, stop and wait for my confirmation.

---

# 1. PROJECT GOAL

Build a university canteen marketplace where:

- Canteen owners can register their canteens.
- Students can register.
- Faculty members can register.
- All registration requests go to the Super Admin.
- Super Admin can approve or reject registration requests.
- Rejected requests must have a rejection reason.
- Approved canteen owners can manage their canteen and products.
- Students and faculty can browse approved canteens and available products.
- Students and faculty can place food orders.
- Canteen owners can view and manage orders.
- Canteen owners must be able to identify whether an order was placed by a STUDENT or FACULTY member.
- The marketplace must only display approved and active canteens.
- The application must be responsive and professional.

The application should be designed so that it can later be extended with online payments, but initially use Cash on Pickup only.

---

# 2. TECHNOLOGY STACK

Use:

- Next.js
- App Router
- TypeScript
- MongoDB
- Mongoose
- Tailwind CSS
- shadcn/ui
- React
- REST API or Next.js Route Handlers where appropriate
- Secure authentication
- Role-Based Access Control
- Client-side and server-side validation

Use current stable and mutually compatible package versions.

Do not unnecessarily introduce additional libraries.

Before installing packages, inspect the existing environment and package configuration.

---

# 3. USER ROLES

The system has exactly these primary roles:

1. SUPER_ADMIN
2. CANTEEN_OWNER
3. STUDENT
4. FACULTY

Every protected action must verify the authenticated user's role on the server.

Never rely only on frontend role checks.

---

# 4. REGISTRATION SYSTEM

There are three registration forms.

## 4.1 Canteen Owner Registration

Collect:

### Personal Information

- Full Name
- Father Name
- CNIC
- Phone Number
- Email
- Password

### Canteen Information

- Canteen Name
- Description
- Location
- Building / Block
- Opening Time
- Closing Time
- Logo
- Cover Image

### Verification

- Verification Documents

The registration request should initially have:

PENDING

status.

The user must not receive owner dashboard access until approved.

---

## 4.2 Student Registration

Collect:

- Full Name
- Father Name
- Email
- Phone Number
- Password
- Student ID
- Department
- Program
- Semester
- Section
- Student Card Upload
- Optional University Email

Student registration initially has:

PENDING

status.

Students cannot place orders until their account is approved.

---

## 4.3 Faculty Registration

Collect:

- Full Name
- Father Name
- Email
- Phone Number
- Password
- Employee ID
- Department
- Designation
- Faculty Type
- University ID Card
- Employment Verification

Faculty registration initially has:

PENDING

status.

Faculty members cannot place orders until approved.

---

# 5. ACCOUNT STATUS

Use a proper account status system.

Possible statuses:

- PENDING
- APPROVED
- REJECTED
- SUSPENDED
- ACTIVE
- INACTIVE

Design the status model carefully.

Do not duplicate statuses unnecessarily.

Document the final decision in:

DECISIONS.md

---

# 6. DATABASE MODELS

Design proper MongoDB/Mongoose models.

Recommended models:

- User
- Student
- Faculty
- Canteen
- Product
- Category
- Order
- Notification

You may introduce additional models only when technically justified.

Before implementing models, think carefully about:

- Relationships
- References
- Indexes
- Data ownership
- Query performance
- Validation
- Future scalability

Do not duplicate large amounts of data unnecessarily.

---

# 7. USER MODEL

The User model should support:

- name
- fatherName
- email
- phone
- passwordHash
- role
- status
- createdAt
- updatedAt

Role:

- SUPER_ADMIN
- CANTEEN_OWNER
- STUDENT
- FACULTY

Never store plain-text passwords.

Passwords must be securely hashed.

---

# 8. CANTEEN MODEL

Canteen should support:

- owner reference
- canteen name
- description
- location
- building/block
- opening time
- closing time
- logo
- cover image
- verification documents
- approval status
- active/inactive state
- timestamps

A canteen owner must only be able to manage their own canteen.

---

# 9. PRODUCT MODEL

Products should support:

- canteen reference
- category reference
- name
- description
- price
- discountPrice
- image
- stockQuantity
- isAvailable
- preparationTime
- timestamps

Only the owner of the related canteen may modify its products.

---

# 10. CATEGORY MODEL

Categories may include examples such as:

- Fast Food
- Pakistani Food
- Drinks
- Snacks
- Breakfast
- Desserts
- Other

Categories should be reusable and properly related to products.

---

# 11. ORDER SYSTEM

Initially use:

Cash on Pickup

Do not implement online payment yet.

Order should contain:

- customer reference
- customer type
- canteen reference
- items
- quantities
- prices
- subtotal
- total
- order status
- pickup information
- timestamps

Customer type must clearly identify:

- STUDENT
- FACULTY

Canteen owners must be able to see whether the customer is a student or faculty member.

---

# 12. ORDER STATUS

Use:

- PENDING
- ACCEPTED
- PREPARING
- READY
- COMPLETED
- REJECTED
- CANCELLED

Define valid status transitions.

Do not allow arbitrary status changes.

For example:

PENDING → ACCEPTED
ACCEPTED → PREPARING
PREPARING → READY
READY → COMPLETED

Rejection/cancellation rules should be clearly documented.

---

# 13. SUPER ADMIN

Super Admin should be able to:

- View dashboard statistics
- View pending registrations
- View student registrations
- View faculty registrations
- View canteen owner registrations
- View submitted documents
- Approve registrations
- Reject registrations
- Provide rejection reason
- Suspend accounts
- Activate accounts
- Manage platform-level information

All admin operations must be protected server-side.

Do not rely on hidden frontend buttons for security.

---

# 14. CANTEEN OWNER DASHBOARD

Approved canteen owners should have a dashboard.

Features:

- View canteen profile
- Edit canteen information
- Manage categories
- Add products
- Edit products
- Delete products
- Upload product images
- Set price
- Set discount price
- Manage stock
- Toggle availability
- Set preparation time
- View incoming orders
- Update order status

An owner must never be able to access or modify another owner's canteen or products by changing an ID in the URL or API request.

---

# 15. MARKETPLACE

Public marketplace should display:

- Approved canteens
- Active canteens
- Canteen details
- Canteen logo
- Canteen cover
- Products
- Product images
- Prices
- Discount prices
- Availability

Users should be able to:

- Search products
- Filter by category
- Filter by canteen
- Filter available products
- View canteen details
- View products

Do not display unapproved canteens.

Do not display unavailable products as available.

---

# 16. STUDENT/FACULTY SHOPPING

Approved students and faculty should be able to:

- Browse marketplace
- View products
- Add products to cart
- Update quantity
- Remove items
- Review cart
- Checkout
- Select Cash on Pickup
- Place order
- View order history
- View order details
- Track order status

Cart logic should be carefully designed.

Consider whether products from multiple canteens should be allowed in one cart.

Choose the safest and simplest architecture and document the decision in DECISIONS.md.

---

# 17. NOTIFICATIONS

Design a notification system for important events such as:

- Registration approved
- Registration rejected
- Registration rejection reason
- Order accepted
- Order preparing
- Order ready
- Order completed
- Order rejected

Implement notifications only when the relevant phase is reached.

---

# 18. AUTHENTICATION

Authentication must include:

- Login
- Logout
- Secure password hashing
- Session management
- Protected routes
- Role-based authorization
- Account status checks

Server-side authentication and authorization are mandatory.

Do not trust:

- frontend role values
- URL parameters
- hidden inputs
- client-side state
- localStorage values

for authorization decisions.

---

# 19. VALIDATION

Use strong validation.

Validate on:

- Client
- Server

Forms should use:

- Formik
- Yup

Do not rely only on Formik/Yup client validation.

Server-side validation is mandatory.

Provide meaningful user-friendly error messages.

Avoid technical errors such as:

"Something went wrong"

when a more useful message can be provided.

Do not expose:

- stack traces
- database errors
- internal implementation details
- secrets

to normal users.

---

# 20. FILE UPLOADS

Registration documents and images must be handled securely.

Validate:

- file type
- file size
- upload purpose

Do not blindly trust file extensions.

Use Cloudinary or another suitable image/document storage solution when implementation reaches the upload phase.

Keep credentials in environment variables.

Never commit secrets to Git.

---

# 21. SECURITY REQUIREMENTS

Security is a priority.

Implement:

- Password hashing
- Secure authentication
- Server-side authorization
- Role-based access control
- Input validation
- File validation
- Secure environment variables
- Ownership checks
- Protection against URL manipulation
- Protection against unauthorized API requests
- Safe error handling

Never put:

- passwords
- API keys
- database credentials
- Cloudinary secrets

inside source code.

---

# 22. UI/UX

The UI should be:

- Professional
- Modern
- Clean
- Responsive
- Accessible
- Easy to understand

Use:

- Tailwind CSS
- shadcn/ui
- reusable components
- consistent spacing
- consistent typography
- meaningful loading states
- meaningful empty states
- meaningful error states
- success feedback
- confirmation dialogs where appropriate

Do not over-design the application.

Focus on usability.

---

# 23. TYPESCRIPT RULES

Use strict TypeScript.

Avoid:

any

unless absolutely unavoidable and technically justified.

Prefer:

- interfaces
- types
- enums or appropriate constants
- typed API responses
- typed database interactions
- reusable types

Avoid duplicated types.

Create shared types where appropriate.

---

# 24. PROJECT STRUCTURE

Use a clean scalable Next.js App Router structure.

Separate concerns clearly.

Possible areas:

- app
- components
- lib
- models
- services
- validations
- types
- hooks
- middleware
- API/route handlers

Do not blindly follow this structure if Next.js architecture suggests a better arrangement.

Explain architectural decisions.

---

# 25. ERROR HANDLING

Create a consistent error-handling strategy.

API errors should have predictable structures.

Frontend should display meaningful messages.

Do not expose internal server details.

---

# 26. DATABASE

Use MongoDB with Mongoose.

Create a reusable database connection utility.

Handle:

- connection reuse
- development hot reload
- connection errors
- indexes where useful

Use environment variables for MongoDB credentials.

---

# 27. ENVIRONMENT VARIABLES

Create an appropriate environment configuration.

For example:

MONGODB_URI=
AUTH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Do not commit actual values.

Create:

.env.example

with placeholder values.

---

# 28. DEVELOPMENT DOCUMENTATION

Maintain:

PROJECT_STATUS.md

and:

DECISIONS.md

PROJECT_STATUS.md should contain:

- Current phase
- Completed work
- Remaining work
- Known issues
- Next phase

DECISIONS.md should contain important architecture decisions and their reasons.

Update these documents after meaningful changes.

---

# 29. GIT

Use meaningful Git commits after meaningful development milestones.

Examples:

feat: initialize nextjs project
feat: add database connection
feat: add authentication
feat: add registration system
feat: add admin approval workflow

Do not create meaningless commits for every tiny change.

Do not push secrets.

---

# 30. TESTING

After each meaningful phase:

Run appropriate checks such as:

- TypeScript check
- ESLint
- Build
- Relevant tests

Fix errors before considering the phase complete.

Do not ignore TypeScript or build errors.

---

# 31. DEVELOPMENT PHASES

Build in this exact general sequence:

PHASE 1 — Foundation

PHASE 2 — Authentication

PHASE 3 — Registration System

PHASE 4 — Super Admin

PHASE 5 — Canteen Owner Dashboard

PHASE 6 — Marketplace

PHASE 7 — Cart and Orders

PHASE 8 — Notifications

PHASE 9 — Professional Improvements, Testing, Security and Deployment

Do not skip directly to later phases.

---

# 32. PHASE 1 REQUIREMENTS

For Phase 1 implement only:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- ESLint
- Clean folder structure
- Environment configuration
- MongoDB/Mongoose connection infrastructure
- User model foundation
- Role definitions
- Status definitions
- Shared types
- Basic validation/error infrastructure
- PROJECT_STATUS.md
- DECISIONS.md

Do NOT implement yet:

- Registration pages
- Login system
- Admin dashboard
- Product management
- Cart
- Orders
- Notifications

---

# 33. IMPORTANT DEVELOPMENT RULE

Before implementing Phase 1:

FIRST inspect the current project directory and environment.

Tell me:

1. What files currently exist?
2. What is the current project state?
3. What architecture do you recommend?
4. What database models do you recommend?
5. What relationships do they have?
6. What role/permission matrix do you recommend?
7. What pages will eventually be required?
8. What API/Route Handlers will eventually be required?
9. What validation strategy will be used?
10. What upload strategy will be used?
11. What security risks should we consider?
12. What scalability risks should we consider?
13. What development phases will you follow?

DO NOT CREATE OR MODIFY PROJECT FILES YET.

After providing the architecture and plan, STOP.

Wait for my explicit approval before starting Phase 1.

Do not automatically continue.

---

# 34. COMMUNICATION STYLE

I am learning full-stack development.

Use simple and clear English.

When giving commands:

- Tell me the exact folder/path.
- Give ready-to-paste commands.
- Explain what the command does briefly.
- Do not give multiple unrelated steps at once.
- Wait for my confirmation before moving to the next step.

When modifying code:

- Always provide the exact file path.
- Clearly explain what should be replaced or added.
- Do not silently modify requirements.
- Do not remove existing functionality without explaining why.

---

# 35. FINAL INSTRUCTION

Start by inspecting the current project and environment.

Do NOT write application code yet.

Do NOT create the Next.js project yet.

Do NOT install packages yet unless inspection proves it is necessary.

First provide the complete architecture and implementation plan described above.

Then STOP and wait for my approval.

Only proceed when I explicitly approve Phase 1.