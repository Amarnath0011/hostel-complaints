# Project Overview

## Understanding and Confidence

This overview is based on the tracked repository files plus local configuration/todo files. Generated folders such as `node_modules` and `.next` are treated as build/dependency artifacts, not authored application source.

| Area | Confidence | Notes |
| --- | --- | --- |
| Project type | High | Next.js App Router app using React, Tailwind CSS, Prisma, PostgreSQL, JWT, Cloudinary, and Sonner. |
| Folder structure | High | The repo is small and all authored folders are readable. |
| Frontend flow | High | Page and component fetch calls clearly map to API routes. |
| Backend/API flow | High | Route handlers are all in `app/api` and use Prisma directly. |
| Database schema | High | Prisma schema and migrations define the current data model. |
| Authentication flow | Medium-high | Intended flow is clear, but several token/OTP paths appear inconsistent. |
| State management | High | Auth context is global; everything else is local component state. |
| External services | High | PostgreSQL and Cloudinary are implemented; email delivery is intended but not implemented. |
| Production readiness | Medium | Static analysis found likely runtime issues; the app was not executed during this documentation pass. |

## Architecture Diagram

```text
Browser / React Client
  |
  | Next.js App Router pages
  | - app/page.js
  | - app/login/page.js
  | - app/signup/page.js
  | - app/verify/page.js
  | - app/complaint/[[...id]]/page.js
  | - app/my-complaints/page.js
  | - app/account/page.js
  |
  v
React Components and Context
  |
  | AuthContext keeps:
  | - user
  | - accessToken
  | - refresh()
  | - logout()
  |
  v
Next.js API Routes
  |
  | Auth:
  | - /api/signup
  | - /api/verify
  | - /api/resend-otp
  | - /api/login
  | - /api/auth/refresh
  | - /api/auth/logout
  | - /api/forgot-password
  | - /api/reset-password
  |
  | Complaints:
  | - /api/complaints
  | - /api/complaints/[id]
  | - /api/my-complaints
  |
  | Media:
  | - /api/image-upload
  |
  v
Server Libraries
  |
  | - lib/prisma.js: Prisma client and PostgreSQL adapter
  | - lib/otp.js: OTP generation/persistence
  | - lib/auth.js: auth error helper
  |
  v
External Systems
  |
  | - PostgreSQL database via Prisma
  | - Cloudinary image upload/delete
  | - Email/OTP delivery intended, currently console logged
```

## Folder Structure

```text
hostel-complaints/
  app/
    api/
      auth/
        logout/
        refresh/
      complaints/
        [id]/
      forgot-password/
      image-upload/
      login/
      my-complaints/
      resend-otp/
      reset-password/
      signup/
      verify/
    account/
    complaint/
      [[...id]]/
    components/
    context/
    forgot-password/
    login/
    my-complaints/
    reset-password/
    signup/
    verify/
    globals.css
    layout.js
    page.js
  lib/
  prisma/
    migrations/
    schema.prisma
  public/
  package.json
  package-lock.json
  next.config.mjs
  tailwind.config.js
  postcss.config.js
  postcss.config.mjs
  eslint.config.mjs
  jsconfig.json
  prisma.config.ts
  README.md
  todos.txt
```

## Major Files and Purpose

### Root Configuration

- `package.json`: Defines scripts and dependencies. Scripts are `dev`, `build`, `start`, and `lint`.
- `package-lock.json`: Locks the dependency tree. It contains 557 packages, with root dependencies including Next.js, React, Prisma, PostgreSQL, bcrypt, JWT, Cloudinary, browser image compression, and Sonner.
- `next.config.mjs`: Allows optimized Next images from `https://res.cloudinary.com/**`.
- `tailwind.config.js`: Configures Tailwind content scanning for `app` and `components`.
- `postcss.config.js`: CommonJS PostCSS config using `tailwindcss` and `autoprefixer`.
- `postcss.config.mjs`: ESM PostCSS config using `@tailwindcss/postcss`. This differs from the Tailwind v3 dependency setup.
- `eslint.config.mjs`: Uses Next core web vitals ESLint configuration and ignores generated build folders.
- `jsconfig.json`: Defines `@/*` path alias to the project root.
- `prisma.config.ts`: Loads `.env`, points Prisma to `prisma/schema.prisma`, and reads `DATABASE_URL`.
- `.gitignore`: Ignores dependencies, build output, environment files, generated Prisma output, and `todos.txt`.
- `README.md`: Default create-next-app README.
- `todos.txt`: Local project notes listing completed and pending work.

### `app`

- `app/layout.js`: Root layout. Loads Geist fonts, global CSS, `AuthProvider`, and Sonner `Toaster`.
- `app/page.js`: Server-rendered home page. Fetches `/api/complaints?page=1&limit=50` from `http://localhost:3000`, renders `Navbar` and `ComplaintFeed`.
- `app/globals.css`: Tailwind directives and basic body font styling.

### Frontend Pages

- `app/login/page.js`: Login form. Calls `POST /api/login`, stores returned user/access token in auth context, redirects home.
- `app/signup/page.js`: Signup form. Validates NITJSR email and password, calls `POST /api/signup`, then redirects to `/verify?token=...&type=SIGNUP`.
- `app/verify/page.js`: OTP verification page for signup and password reset. Calls `POST /api/verify`; includes resend UI.
- `app/forgot-password/page.js`: Starts password reset. Calls `POST /api/forgot-password`, then redirects to `/verify?token=...&type=PASSWORD_RESET`.
- `app/reset-password/page.js`: Reads reset token from query params and renders `ChangePassword` in reset mode.
- `app/account/page.js`: Protected account page. Shows profile data, renders password change, and contains placeholder account deletion logic.
- `app/my-complaints/page.js`: Protected page. Fetches `GET /api/my-complaints`, lists the current user's complaints, allows edit/delete while status is `PENDING`.
- `app/complaint/[[...id]]/page.js`: Complaint create/edit form. Without an ID, creates a complaint. With an ID, fetches existing complaint and patches it. Compresses image client-side and uploads to Cloudinary through `/api/image-upload`.

### Components

- `app/components/Navbar.js`: Main navigation, login/signup links, make complaint button, user dropdown, logout.
- `app/components/ComplaintFeed.js`: Holds local complaint list, filters, sorting, selected complaint modal, and status update reflection.
- `app/components/ComplaintCard.js`: Displays complaint summary card.
- `app/components/ComplaintPopUp.js`: Complaint detail modal. Supervisors can update complaint status.
- `app/components/FilterBar.js`: Local feed filters for status, category, hostel, and sort order.
- `app/components/ChangePassword.js`: Shared password form for account password change and password reset flow.
- `app/context/AuthContext.js`: Global auth state provider. Refreshes access token on mount using refresh-token cookie.

### `app/api`

All backend routes use Next.js route handlers.

- `app/api/signup/route.js`: Creates or updates an unverified user, hashes password, creates signup OTP, logs OTP, returns signup verification JWT.
- `app/api/verify/route.js`: Verifies OTP and marks signup users verified or returns a password reset token after password-reset OTP verification.
- `app/api/resend-otp/route.js`: Regenerates OTP for a user/type and logs it.
- `app/api/login/route.js`: Validates credentials, requires verified user, returns access token and sets refresh token cookie.
- `app/api/auth/refresh/route.js`: Reads refresh token cookie and returns a new access token plus user data.
- `app/api/auth/logout/route.js`: Clears refresh-token cookie.
- `app/api/forgot-password/route.js`: Creates password reset OTP and reset token for a verified user.
- `app/api/reset-password/route.js`: Changes password using either reset token or access token.
- `app/api/complaints/route.js`: `GET` lists paginated complaints; `POST` creates a complaint for an authenticated user.
- `app/api/complaints/[id]/route.js`: `GET` one owned complaint, `PATCH` owner content or supervisor status, `DELETE` owned complaint and attempts Cloudinary cleanup.
- `app/api/my-complaints/route.js`: Lists complaints for authenticated current user.
- `app/api/image-upload/route.js`: Uploads multipart image file to Cloudinary.

### `lib`

- `lib/prisma.js`: Creates PostgreSQL pool, Prisma adapter, and cached Prisma client.
- `lib/otp.js`: Deletes existing OTPs for a user/type, generates a six-digit OTP, stores it with a five-minute expiry.
- `lib/auth.js`: Converts JWT token errors into `401 Unauthorized` and other errors into `500 Server Error`.

### `prisma`

- `prisma/schema.prisma`: Source schema for Prisma client and migrations.
- `prisma/migrations/20260116171654_init/migration.sql`: Initial `User`, `Complaint`, and enums.
- `prisma/migrations/20260125220411_add_otp_system/migration.sql`: Adds user verification and OTP table.
- `prisma/migrations/20260205224322_add_rejected_status_and_hostel_room/migration.sql`: Adds `REJECTED` status plus `hostel` and `room`.
- `prisma/migrations/migration_lock.toml`: Locks migration provider to PostgreSQL.

### `public`

- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`: Default static assets from the Next.js template.

## Feature List

- Public complaint feed.
- Local filtering by status, category, hostel, and sort direction.
- Student signup restricted to `@nitjsr.ac.in` emails.
- Password strength validation.
- OTP-based signup verification, currently logged to console.
- Login with bcrypt password verification.
- JWT access token plus HTTP-only refresh-token cookie.
- Automatic access-token refresh on app load.
- Complaint creation with title, description, category, hostel, room, and optional image.
- Client-side image compression before upload.
- Cloudinary upload and best-effort Cloudinary deletion.
- Current-user complaint history.
- Complaint editing while owned by the user.
- Complaint deletion while owned by the user.
- Supervisor-only status updates.
- Password reset through OTP verification.
- Account password change while logged in.
- Toast notifications.

## User Flow

### Public Feed

1. User visits `/`.
2. `app/page.js` fetches complaints from `/api/complaints`.
3. `ComplaintFeed` renders cards.
4. User filters or sorts locally.
5. User opens a complaint modal.
6. If the logged-in user is a supervisor, the modal shows a status selector.

### Signup and Verification

1. User visits `/signup`.
2. Frontend validates official email and password.
3. `POST /api/signup` creates or updates an unverified user.
4. Server hashes password and creates `OTP` with type `SIGNUP`.
5. Server logs OTP to console and returns a signed verification token.
6. Frontend redirects to `/verify?token=...&type=SIGNUP`.
7. User enters OTP.
8. `POST /api/verify` checks OTP, marks user `isVerified=true`, and deletes signup OTP.
9. Frontend redirects to `/login`.

### Login and Session Refresh

1. User visits `/login`.
2. `POST /api/login` validates email/password and requires `isVerified=true`.
3. Server returns access token and sets `refreshToken` HTTP-only cookie.
4. `AuthContext` stores user/access token in memory.
5. On page load, `AuthContext` calls `POST /api/auth/refresh`.
6. Refresh route reads cookie and returns a new access token/user.
7. Protected frontend calls use `Authorization: Bearer <accessToken>`.

### Complaint Creation

1. User clicks "Make a Complaint".
2. If logged in, frontend navigates to `/complaint`.
3. User fills complaint form.
4. If an image is selected, browser compresses it and sends it to `POST /api/image-upload`.
5. Image route uploads to Cloudinary and returns URL.
6. Form calls `POST /api/complaints` with JWT access token and complaint fields.
7. Server creates complaint with `PENDING` status.
8. Frontend redirects to `/my-complaints`.

### Complaint Editing

1. User opens `/my-complaints`.
2. Frontend fetches `GET /api/my-complaints`.
3. For `PENDING` complaints, user can click Edit.
4. Frontend navigates to `/complaint/{id}`.
5. Form fetches `GET /api/complaints/{id}` to prefill data.
6. On submit, form calls `PATCH /api/complaints/{id}`.
7. Server allows owner content changes; supervisors can change status.

### Password Reset

1. User visits `/forgot-password`.
2. `POST /api/forgot-password` validates verified account.
3. Server creates `PASSWORD_RESET` OTP, logs it, and returns reset token.
4. Frontend redirects to `/verify?token=...&type=PASSWORD_RESET`.
5. User enters OTP.
6. `POST /api/verify` returns a short-lived reset token.
7. Frontend redirects to `/reset-password?token=...`.
8. `ChangePassword` calls `POST /api/reset-password` with reset token and new password.

## API Documentation

### `POST /api/signup`

Purpose: Register a student account and start OTP verification.

Request body:

```json
{
  "name": "Student Name",
  "email": "student@nitjsr.ac.in",
  "password": "Password!"
}
```

Responses:

- `201`: `{ "success": true, "token": "..." }`
- `400`: missing fields, invalid email domain, weak password, or spaces in password
- `409`: verified email already registered
- `500`: internal server error

### `POST /api/verify`

Purpose: Verify signup or password-reset OTP.

Request body:

```json
{
  "enteredOTP": "123456",
  "token": "...",
  "type": "SIGNUP"
}
```

Responses:

- `200`: signup verified or password reset token returned
- `400`: expired/invalid OTP
- `404`: OTP not found
- `500`: verification error

### `POST /api/resend-otp`

Purpose: Regenerate an OTP for a user/type.

Request body:

```json
{
  "userId": "user-id",
  "type": "SIGNUP"
}
```

Responses:

- `200`: `{ "success": true, "message": "OTP Resent" }`
- `400`: missing info or already verified signup
- `404`: user not found
- `500`: server error

### `POST /api/login`

Purpose: Authenticate a verified user.

Request body:

```json
{
  "email": "student@nitjsr.ac.in",
  "password": "Password!"
}
```

Responses:

- `200`: access token, user object, and refresh token cookie
- `400`: missing fields
- `401`: invalid credentials or unverified account
- `500`: internal server error

### `POST /api/auth/refresh`

Purpose: Exchange refresh-token cookie for a new access token.

Responses:

- `200`: `{ "accessToken": "...", "user": { ... } }`
- `401`: no refresh token
- `403`: invalid refresh token

### `POST /api/auth/logout`

Purpose: Clear refresh-token cookie.

Responses:

- `200`: `{ "message": "Logged out successfully" }`

### `POST /api/forgot-password`

Purpose: Start password reset.

Request body:

```json
{
  "email": "student@nitjsr.ac.in"
}
```

Responses:

- `200`: `{ "resetToken": "..." }`
- `400`: missing fields
- `404`: no verified account found
- `500`: internal server error

### `POST /api/reset-password`

Purpose: Change password using either a reset token or logged-in access token.

Request body:

```json
{
  "token": "...",
  "password": "NewPassword!"
}
```

Headers for logged-in password change:

```text
Authorization: Bearer <access-token>
```

Responses:

- `200`: `{ "message": "Password changed" }`
- `400`: weak password or spaces
- `401`: unauthorized
- `500`: internal server error

### `GET /api/complaints`

Purpose: Public paginated complaint feed.

Query params:

- `page`: defaults to `1`
- `limit`: defaults to `10`

Response:

```json
{
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

### `POST /api/complaints`

Purpose: Create an authenticated user's complaint.

Headers:

```text
Authorization: Bearer <access-token>
```

Request body:

```json
{
  "title": "Issue title",
  "description": "Issue details",
  "category": "ELECTRICAL",
  "hostel": "Boys Hostel E",
  "room": "E-511",
  "imageUrl": "https://res.cloudinary.com/..."
}
```

Responses:

- `201`: created complaint
- `400`: missing required fields
- `401`: missing/invalid token
- `500`: server error

### `GET /api/complaints/[id]`

Purpose: Fetch one complaint for its owner.

Headers:

```text
Authorization: Bearer <access-token>
```

Responses:

- `200`: complaint
- `401`: missing token
- `403`: not owner
- `404`: complaint not found
- `500`: server error

### `PATCH /api/complaints/[id]`

Purpose: Update complaint content as owner or status as supervisor.

Headers:

```text
Authorization: Bearer <access-token>
```

Request body examples:

```json
{
  "title": "Updated title",
  "description": "Updated details",
  "category": "PLUMBING",
  "hostel": "Girls Hostel A",
  "room": "A-101",
  "imageUrl": null
}
```

```json
{
  "status": "IN_PROGRESS"
}
```

Responses:

- `200`: updated complaint
- `401`: missing/invalid token
- `403`: unauthorized action
- `404`: complaint not found
- `500`: update failed

### `DELETE /api/complaints/[id]`

Purpose: Delete an owned complaint and attempt Cloudinary image cleanup.

Headers:

```text
Authorization: Bearer <access-token>
```

Responses:

- `200`: deleted
- `401`: missing/invalid token
- `403`: not owner
- `404`: complaint not found
- `500`: server error

### `GET /api/my-complaints`

Purpose: List authenticated user's complaints.

Headers:

```text
Authorization: Bearer <access-token>
```

Responses:

- `200`: `{ "data": [] }`
- `401`: missing/invalid token
- `500`: server error

### `POST /api/image-upload`

Purpose: Upload an image to Cloudinary.

Request: multipart form data with `file`.

Responses:

- `200`: `{ "message": "Image upload successful", "url": "..." }`
- `400`: no file found
- `500`: upload failed

## Database Schema Explanation

### Enums

- `Role`: `STUDENT`, `SUPERVISOR`
- `Status`: `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`
- `Category`: `PLUMBING`, `ELECTRICAL`, `CIVIL`, `MESS`, `OTHER`
- `OTPType`: `SIGNUP`, `PASSWORD_RESET`

### `User`

Represents an account.

- `id`: UUID primary key.
- `email`: Unique email.
- `password`: Bcrypt hash.
- `name`: User display name.
- `role`: `STUDENT` by default.
- `isVerified`: False until signup OTP succeeds.
- `complaints`: One-to-many relation to `Complaint`.
- `createdAt`: Creation timestamp.
- `otps`: One-to-many relation to `OTP`.

### `Complaint`

Represents a hostel issue report.

- `id`: UUID primary key.
- `title`: Short issue title.
- `description`: Detailed issue text.
- `hostel`: Optional text in schema, required by current create API.
- `room`: Optional text in schema, required by current create API.
- `category`: Complaint category enum.
- `imageUrl`: Optional Cloudinary URL.
- `status`: Workflow status, default `PENDING`.
- `userId`: Foreign key to `User`.
- `user`: Relation to reporter.
- `createdAt`: Creation timestamp.
- `updatedAt`: Auto-updated timestamp.

### `OTP`

Represents one-time codes for signup verification and password reset.

- `id`: CUID primary key.
- `code`: Six-digit string.
- `type`: `SIGNUP` or `PASSWORD_RESET`.
- `expiresAt`: Expiry timestamp, currently five minutes after generation.
- `createdAt`: Creation timestamp.
- `userId`: Foreign key to `User`.
- `user`: Relation to user with cascade delete.
- Index: `@@index([userId, type])` for lookup by user and OTP type.

## External Services

- PostgreSQL: Used by Prisma through `DATABASE_URL`.
- Cloudinary: Used for image uploads and deletion with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- JWT secrets: `ACCESS_SECRET`, `REFRESH_SECRET`, `RESET_PASSWORD_SECRET`, and `SIGNUP_SECRET`.
- Email delivery: Intended for OTP sending, but no Nodemailer/email service is implemented yet. OTPs are logged to the server console.

## State Management

- Global auth state: `AuthContext`.
- Auth context state: `user`, `accessToken`, `loading`.
- Auth context actions: `refreshTokens`, `refresh`, `logout`, plus direct setters.
- Complaint feed state: local list, filters, selected complaint modal.
- Form state: local component state in login, signup, complaint form, forgot/reset password, and account page.
- There is no persistent client store besides the HTTP-only refresh-token cookie.

## Entry Points

- Application root layout: `app/layout.js`.
- Home route: `app/page.js`.
- Main navigation: `app/components/Navbar.js`.
- API route entry points: all `app/api/**/route.js` files.
- Database client: `lib/prisma.js`.
- Database schema: `prisma/schema.prisma`.

## Current Implementation Status

### Implemented

- Next.js app shell and routing.
- Public complaint feed.
- Complaint creation with optional image upload.
- User complaint history.
- Complaint owner edit/delete routes.
- Supervisor status update route and modal UI.
- Signup/login/password reset pages.
- Bcrypt password hashing.
- JWT access and refresh token flow.
- Prisma schema and migrations.
- Cloudinary upload/delete integration.

### Partially Implemented

- OTP verification exists, but OTP delivery is console logging only.
- Protected routes are partially handled client-side, but not centrally enforced by middleware.
- Token refresh exists, but very short lifetimes and retry inconsistencies may make sessions fragile.
- Account page exists, but delete account is placeholder-only.
- Comments section exists only as placeholder text.
- Status workflow exists, but no timeline/history table exists.

### Not Implemented

- Nodemailer or real email OTP delivery.
- Comments feature.
- Account deletion API.
- Status timeline/history.
- Roll number extraction/display.
- Central authorization middleware.
- Automated tests.
- Admin/supervisor management UI.

## Suspected Incomplete Features

- Real OTP email sending.
- Protected-route middleware.
- Account deletion.
- Complaint comments.
- Status timeline.
- Roll number display on complaints.
- Block number support, despite `todos.txt` saying it is done; the current form comment says block support is still TODO and the schema has no block field.
- Popup scroll locking.
- Login/signup page scroll polish.
- Popup status-change bug noted in `todos.txt`.
