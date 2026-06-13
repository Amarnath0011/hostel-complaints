# TODO Analysis

## Completed Features

These features have visible implementation in the current codebase.

- Next.js App Router project scaffold.
- Tailwind CSS styling setup.
- Prisma schema and migration history.
- PostgreSQL connection through Prisma adapter.
- Public complaint feed on the home page.
- Complaint cards and detail popup.
- Local filtering by category, hostel, status, and sort order.
- Signup page with NITJSR email validation.
- Password validation for signup and password change.
- Bcrypt password hashing.
- User creation and verified/unverified account handling.
- OTP table and OTP generation helper.
- Login route and login page.
- JWT access token generation.
- HTTP-only refresh-token cookie creation.
- Refresh route for new access tokens.
- Logout route that clears refresh-token cookie.
- Auth context for user/access-token state.
- Complaint creation route.
- Complaint creation form.
- Client-side image compression.
- Cloudinary image upload route.
- My Complaints page.
- Current-user complaints API.
- Complaint edit page using optional catch-all route.
- Complaint owner update route.
- Complaint owner delete route.
- Best-effort Cloudinary image deletion when complaint/image is removed.
- Supervisor-only status update route logic.
- Supervisor status selector in complaint popup.
- Forgot-password route and page.
- Reset-password route and form.
- Account page with profile display and password change form.
- Sonner toast notifications.

## Partially Completed Features

- OTP verification: Database storage and verification exist, but actual email sending is not implemented. OTPs are logged to the server console.
- Signup verification: Intended flow exists, but the verification route appears to use the reset-password secret for all token types.
- Password reset: End-to-end screens and routes exist, but OTP delivery is still console-only.
- Protected routes: Some pages redirect client-side when unauthenticated, but there is no central middleware guard and some actions depend on in-memory access tokens.
- JWT implementation: Access and refresh tokens exist, but lifetimes are extremely short and refresh retry behavior is inconsistent.
- Complaint status workflow: Status can be changed, but there is no status history/timeline.
- Account management: Profile and password change exist, but account deletion is placeholder-only.
- Comments: UI placeholder exists in the complaint popup, but no model, API route, or comment UI is implemented.
- Block number: `todos.txt` says block number is done, but the current schema/form do not include a block field and the complaint page still has a TODO comment for block.
- Image lifecycle: Upload/delete paths exist, but uploaded images are not tied transactionally to complaint creation/update.
- Supervisor support: Role exists and status updates are restricted, but there is no UI/API for promoting users or managing supervisors.

## Missing Features

- Real OTP email sending through Nodemailer or another email service.
- Central route protection middleware.
- Account deletion API and database cleanup behavior.
- Comments data model, API routes, and UI.
- Complaint status timeline/history model and UI.
- Roll number parsing/display on complaints.
- Block number field in schema, API, and forms if still required.
- Pagination controls on the frontend home feed.
- Search by text/title/room/hostel.
- Server-side filtering endpoints for category/status/hostel.
- Dedicated supervisor dashboard.
- User role management.
- Validation library/schema shared between frontend and backend.
- Automated tests.
- Production deployment documentation.
- Seed data or local database setup instructions beyond the default README.

## Technical Debt

- `app/page.js` fetches `http://localhost:3000/api/complaints`, which is environment-specific and likely breaks outside local development or when hosted under a different origin.
- `postcss.config.js` and `postcss.config.mjs` both exist and use different plugin conventions. The dependency list has Tailwind v3, while `postcss.config.mjs` references `@tailwindcss/postcss`, which is commonly associated with Tailwind v4.
- Auth token durations are set to seconds: access token `15s`, refresh token JWT `30s`, cookie `maxAge: 15`. This is useful for testing refresh logic but fragile for real use.
- API handlers repeat auth parsing and JWT verification logic instead of using a shared helper.
- Error handling is inconsistent. Some JWT errors use `handleAuthError`; others return generic `500`.
- There is no middleware-level protection for authenticated pages.
- Frontend and backend validation rules are duplicated manually.
- Several files contain old commented-out Prisma client code.
- Some imports/state values are unused, such as `passwords`, `accessToken`, and `refresh` in the account page.
- `README.md` is still the default create-next-app README and does not describe this project.
- No test files were found.
- No explicit database seed/setup guide exists.
- OTP secrets and token purpose handling are inconsistent across signup and reset flows.
- Cloudinary public ID extraction assumes the URL structure is always `folder/file.ext`.
- Complaint create/upload flow can orphan a Cloudinary image if upload succeeds but complaint creation fails.
- UI strings contain mojibake/encoding artifacts such as `Â·`, `â€¢`, `â†“`, `ðŸ“¸`, and `âœ•`.

## Potential Bugs

### High Risk

- Signup verification likely fails because `POST /api/signup` signs the token with `SIGNUP_SECRET`, but `POST /api/verify` verifies every token with `RESET_PASSWORD_SECRET`.
- `/api/complaints/route.js` calls `handleAuthError(error)` in `POST` but does not import `handleAuthError`, so certain complaint creation failures may throw a new server error.
- `app/verify/page.js` resend OTP handler sends `{ userId, type }`, but `userId` is not defined in that component.
- `app/my-complaints/page.js` calls `setSelectedImage(c.imageUrl)`, but `setSelectedImage` is not defined.
- The status filter uses `"IN PROGRESS"` while database values use `"IN_PROGRESS"`, so filtering for in-progress complaints will not match.

### Medium Risk

- `app/complaint/[[...id]]/page.js` retry after refresh in edit-mode fetch obtains `newToken` but then reuses `accessToken` in the second request.
- `app/complaint/[[...id]]/page.js` computes `isEditMode = !!params.id`; because this is an optional catch-all route, `params.id` may be an array, and fetch URLs may become surprising if more segments are present.
- `POST /api/auth/refresh` assumes a user is found after decoding the refresh token. If the user was deleted, `user.id` access can throw.
- `POST /api/reset-password` does not check whether `password` exists before testing regex/whitespace.
- `POST /api/verify` does not explicitly branch token secret by OTP type.
- `POST /api/verify` returns generic `500` for JWT verification failure instead of `401`/`400`.
- `POST /api/resend-otp` trusts a raw `userId` in the request body and does not verify the original verification token.
- `POST /api/image-upload` has no auth check, so any client can upload to the configured Cloudinary account if the route is reachable.
- `GET /api/complaints/[id]` returns only owner-visible complaints, but supervisors may reasonably need access for status review/edit flows.
- In `PATCH /api/complaints/[id]`, `isChangingContent` uses truthiness for fields, so empty strings and some field removal cases may not be detected consistently.
- In `PATCH /api/complaints/[id]`, owner updates include all owner fields even when undefined, which may unintentionally set fields to undefined/null depending on Prisma behavior.
- Login returns the same generic error for unverified users, which is safer for enumeration but may make UX confusing after signup.

### Low Risk / UX Bugs

- `toast.error(error)` in complaint form may display an object instead of a message.
- Forgot-password `loading` state starts as an empty string and is never set to `true` before the request.
- Account password change does not require entering the current password.
- `ChangePassword` destructures `user` but does not use it.
- `Navbar` destructures `loading` but does not use it.
- `FilterBar` imports `useState` but does not use it.
- Complaint category select in edit mode does not bind `value={formData.category}`, so the UI may not show the existing category even though state is loaded.
- The home feed fetches only 50 complaints and has no load-more/pagination UI.
- Modal does not lock background scroll.
- Placeholder comments section may confuse users because it appears in the production UI.

## Notes From Existing `todos.txt`

Marked done in `todos.txt` and supported by code:

- Add room number and hostel in database/routes.
- Set up image adding functionality.
- Make home page.
- Add OTP functionality.
- Make account page.
- Make my complaints page.
- Forgot-password route messaging was intended to be changed.
- Implement JWT appears partially done; access/refresh token flow exists.

Still pending or only partially represented:

- Protected routes.
- Nodemailer.
- Status timeline.
- Roll number display.
- Stop scroll when popup appears.
- Stop scroll on signup and login.
- Bug in popup status change.

Potential mismatch:

- `todos.txt` says block number was added, but current schema and form do not implement a block field.

## Suggested Priority Order

This is not a refactor proposal; it is a risk-ranked completion order based on the current implementation.

1. Fix auth/OTP correctness issues so signup and password reset are reliable.
2. Implement real OTP email delivery.
3. Add middleware or consistent page guards for protected routes.
4. Fix known runtime errors in resend OTP and My Complaints image click.
5. Stabilize token durations and refresh retry logic.
6. Add account deletion only if product requirements still include it.
7. Add status timeline/comments if they are part of the intended MVP.
8. Add tests around auth, complaint CRUD, and role-based status updates.
