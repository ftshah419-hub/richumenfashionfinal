# RICHU Authentication API

Base URL: `http://localhost:5001/api`

Every response has a `success` boolean. Successful authentication responses contain a safe `user` object and an access `token`. The user object never includes a password hash, failed-attempt count, lock state, or internal token data.

## Shared rules

- Send JSON with `Content-Type: application/json`.
- Protected routes require `Authorization: Bearer <access-token>`.
- Registration and password changes require 8–128 characters, with at least one uppercase letter, lowercase letter, and number.
- Public registration ignores every extra role-related field and always creates `role: "customer"`.
- Access JWTs are signed by the backend and are checked against a SHA-256 hash stored in `auth_tokens`. Logging out revokes the current session; changing a password revokes every existing session and returns a new token.
- Customer, admin, and registration endpoints share a 15-minute rate limiter. The default maximum is 15 attempts; it is configurable through `AUTH_RATE_LIMIT_MAX`.

Safe user shape:

```json
{
  "id": "mongo-object-id",
  "name": "RICHU Customer",
  "email": "customer@example.com",
  "phone": "+919876543210",
  "role": "customer",
  "isEmailVerified": false,
  "accountStatus": "ACTIVE",
  "lastLoginAt": "2026-11-15T00:00:00.000Z",
  "createdAt": "2026-11-15T00:00:00.000Z"
}
```

## Endpoints

### `POST /auth/register`

Creates a customer account and access session. This endpoint cannot provision an admin.

```json
{
  "name": "RICHU Customer",
  "email": "customer@example.com",
  "phone": "+91 98765 43210",
  "password": "TailoredPass9"
}
```

Returns `201 Created`:

```json
{ "success": true, "user": { "id": "...", "role": "customer" }, "token": "eyJ..." }
```

Returns `409` when the normalized email already exists, or `422` with `errors` for invalid input.

### `POST /auth/login`

Signs in an existing **customer** account.

```json
{ "email": "customer@example.com", "password": "TailoredPass9" }
```

Returns `200 OK` with the same `user`/`token` shape. Invalid credentials return `401`; a valid account for the wrong portal or an inactive account returns `403`; a temporary lock returns `429`.

### `POST /auth/admin/login`

Signs in an existing **admin** account. Request and success response match `/auth/login`. A customer cannot use this endpoint, even with correct credentials.

### `GET /auth/me`

Requires authentication. Returns `200 OK`:

```json
{ "success": true, "user": { "id": "...", "role": "customer" } }
```

### `POST /auth/logout`

Requires authentication. Revokes the exact access session represented by the bearer token. Returns `200 OK`:

```json
{ "success": true, "message": "Logged out successfully" }
```

### `PUT /auth/change-password`

Requires authentication.

```json
{ "currentPassword": "TailoredPass9", "newPassword": "NewTailoredPass9" }
```

Returns `200 OK` with `message`, `user`, and a replacement `token`. All previous sessions are revoked, including the current token; clients must replace their stored token with the response token.

## Role authorization for teammate routes

Use the shared middleware in this order:

```js
const { protect, authorize } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.get("/customer-resource", protect, customerController.list);
router.post("/admin-resource", protect, adminOnly, adminController.create);
// Or allow a defined set of roles:
router.get("/shared-resource", protect, authorize("customer", "admin"), controller.list);
```

`protect` verifies signature, expiration, issuer/audience, account status, and that the server-side access session is still active. It then exposes the safe Mongoose user document as `req.user`. Never make authorization decisions from a role sent by the browser or read from the unsigned request body.

## Secure admin provisioning

Admins are deliberately not created through any HTTP endpoint. Set the following values only in `backend/.env`, then run the provisioning command from `backend`:

```powershell
$env:ADMIN_NAME = "RICHU Store Administrator"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PHONE = "+919876543210"
$env:ADMIN_PASSWORD = "UseAUniqueStrongPass9"
npm run provision:admin
```

The script validates and hashes the password, creates an account with `role: "admin"`, and refuses to auto-promote any existing customer account. Never put these values in source control or a frontend environment file.

## Configuration

Copy `backend/.env.example` to `backend/.env`, then set a real Atlas `MONGO_URI` and a cryptographically random `JWT_SECRET`. The backend defaults to port `5001`; `frontend/.env` should use `VITE_API_URL=http://localhost:5001/api`.

Optional authentication configuration:

| Variable | Default | Purpose |
| --- | --- | --- |
| `JWT_EXPIRES_IN` | `1d` | JWT/session expiry duration |
| `JWT_ISSUER` | `richu-api` | JWT issuer enforced during verification |
| `JWT_AUDIENCE` | `richu-web` | JWT audience enforced during verification |
| `AUTH_MAX_FAILED_ATTEMPTS` | `5` | Failed passwords before a temporary lock |
| `AUTH_LOCK_MINUTES` | `15` | Temporary account-lock duration |
| `AUTH_RATE_LIMIT_MAX` | `15` | Public auth requests permitted per 15 minutes |

## Testing

Install dependencies once in each workspace, then run:

```powershell
cd backend
npm test

cd ..\frontend
npm run build
```

For a manual smoke test, set `MONGO_URI` and `JWT_SECRET`, run `npm run dev` in `backend`, then `npm run dev` in `frontend`. Register a customer through `/register`, reload to confirm session restoration, visit `/account` to change the password, confirm the old token fails, and confirm `/admin` redirects non-admin users. Provision an admin with the script above and use the Atelier Admin tab on `/login` to verify `/auth/admin/login`.
