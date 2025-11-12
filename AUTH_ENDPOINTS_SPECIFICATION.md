# Authentication Endpoints Specification

This document confirms the implementation details for all authentication endpoints used by the frontend application.

## Base Configuration

- **Base URL**: `http://localhost:3000/api` (configurable via `VITE_API_BASE_URL` environment variable)
- **Content-Type**: `application/json`
- **Authorization Header**: `Bearer <token>` (for protected endpoints)

---

## 1. POST `/auth/login`

**Purpose**: Authenticate user and receive access tokens

### Request
```json
{
  "email": "string",
  "password": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "string",
  "data": {
    "user": {
      "id": "string (optional)",
      "email": "string (optional)",
      "name": "string (required)",
      "role": "string (required - will be normalized to: Admin | Farm Manager | Worker)",
      "farmId": "string (optional)",
      "isActive": "boolean (optional)",
      "createdAt": "any (optional)",
      "updatedAt": "any (optional)"
    },
    "token": "string (required - JWT access token)",
    "refreshToken": "string (optional)",
    "refresh_token": "string (optional - alternative field name)",
    "expiresIn": "number (optional)"
  },
  "timestamp": "string"
}
```

### Notes
- Frontend accepts both `refreshToken` and `refresh_token` fields
- Role is normalized: `ADMIN` → `Admin`, `MANAGER`/`FARM` → `Farm Manager`, default → `Worker`
- If `email` is missing from user object, frontend attempts to extract it from JWT token payload
- Token is stored in localStorage with key `"token"`
- Refresh token is stored with key `"refresh_token"`

---

## 2. GET `/auth/profile`

**Purpose**: Retrieve current authenticated user's profile

### Request Headers
```
Authorization: Bearer <access_token>
```

### Response (Success - 200)
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "Admin" | "Farm Manager" | "Worker",
  "avatar": "string (optional)",
  "createdAt": "string (ISO date)",
  "lastLogin": "string (ISO date)"
}
```

### Notes
- Requires authentication (Bearer token in header)
- If request fails but user exists in localStorage, frontend returns cached user instead of throwing error
- Response is stored in localStorage with key `"auth"`

---

## 3. PUT `/auth/profile`

**Purpose**: Update current authenticated user's profile

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "role": "Admin" | "Farm Manager" | "Worker (optional)",
  "avatar": "string (optional)"
}
```

### Response (Success - 200)
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "Admin" | "Farm Manager" | "Worker",
  "avatar": "string (optional)",
  "createdAt": "string (ISO date)",
  "lastLogin": "string (ISO date)"
}
```

### Notes
- Requires authentication
- All fields are optional (partial update)
- Updated user is stored in localStorage

---

## 4. POST `/auth/refresh-token`

**Purpose**: Refresh access token using refresh token

### Request Body
```json
{
  "refreshToken": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "string",
  "data": {
    "user": {
      "id": "string (optional)",
      "email": "string (optional)",
      "name": "string (required)",
      "role": "string (required)",
      "farmId": "string (optional)",
      "isActive": "boolean (optional)",
      "createdAt": "any (optional)",
      "updatedAt": "any (optional)"
    },
    "token": "string (required - new JWT access token)",
    "refreshToken": "string (optional - new refresh token)",
    "refresh_token": "string (optional - alternative field name)",
    "expiresIn": "number (optional)"
  },
  "timestamp": "string"
}
```

### Notes
- **Does NOT require Authorization header** (uses refresh token in body)
- Frontend uses direct `fetch()` call (not `makeRequest`) to avoid infinite refresh loops
- If `refreshToken` is missing from response, frontend reuses the old refresh token
- User data is updated in localStorage after successful refresh
- Emits `token_refresh` event on success

---

## 5. GET `/auth/verify-token`

**Purpose**: Verify if current access token is valid

### Request Headers
```
Authorization: Bearer <access_token>
```

### Response (Success - 200)
Any successful response (status 200) indicates token is valid.

### Response (Error - 401)
Token is invalid or expired.

### Notes
- Requires authentication
- Frontend returns `true` on success, `false` on any error
- Used for token validation checks

---

## 6. POST `/auth/change-password`

**Purpose**: Change user's password

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Response (Success - 200)
No specific response body expected. Success is indicated by 200 status code.

### Notes
- Requires authentication
- Frontend doesn't expect specific response data

---

## 7. POST `/auth/logout`

**Purpose**: Logout user and invalidate session

### Request Headers
```
Authorization: Bearer <access_token>
```

### Response (Success - 200)
No specific response body expected. Success is indicated by 200 status code.

### Notes
- Requires authentication
- Frontend clears all tokens from localStorage regardless of API response
- Emits `logout` event after clearing tokens
- If API call fails, frontend still clears local tokens (logout happens client-side)

---

## 8. POST `/auth/revoke-token`

**Purpose**: Revoke a user's token (admin function)

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "userId": "string"
}
```

### Response (Success - 200)
No specific response body expected. Success is indicated by 200 status code.

### Notes
- Requires authentication
- Used for admin operations to revoke tokens for specific users
- Frontend doesn't expect specific response data

---

## Error Response Format

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": {
    "type": "AUTHENTICATION_ERROR" | "AUTHORIZATION_ERROR" | "VALIDATION_ERROR" | "NETWORK_ERROR",
    "code": "string",
    "message": "string",
    "timestamp": "string (ISO date)",
    "stack": "string (optional, development only)"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token, invalid credentials)
- `404` - Not Found (endpoint or resource not found)
- `500` - Internal Server Error

---

## Frontend Behavior Notes

### Token Management
- Access token stored in localStorage: `"token"`
- Refresh token stored in localStorage: `"refresh_token"`
- User data stored in localStorage: `"auth"`

### Automatic Token Refresh
- Frontend automatically attempts token refresh on 401 errors (except for auth endpoints)
- Refresh happens once per request (prevents infinite loops)
- Grace period of 5 seconds after login - refresh failures won't clear tokens during this period

### Role Normalization
Backend roles are normalized to frontend roles:
- `ADMIN`, `ADMINISTRATOR` → `Admin`
- `MANAGER`, `FARM_MANAGER`, `FARM MANAGER` → `Farm Manager`
- Everything else → `Worker`

### Token Expiration
- Frontend checks JWT `exp` field if present
- If token has no `exp` field, it's considered valid (non-expiring token)
- Automatic refresh scheduled 5 minutes before expiration (if `exp` exists)

---

## Testing Checklist

- [ ] POST `/auth/login` - Returns correct AuthResponse format
- [ ] GET `/auth/profile` - Requires Bearer token, returns User object
- [ ] PUT `/auth/profile` - Accepts partial updates, returns updated User
- [ ] POST `/auth/refresh-token` - Accepts refreshToken in body, returns new tokens
- [ ] GET `/auth/verify-token` - Returns 200 if token valid, 401 if invalid
- [ ] POST `/auth/change-password` - Accepts currentPassword and newPassword
- [ ] POST `/auth/logout` - Invalidates session (frontend clears tokens regardless)
- [ ] POST `/auth/revoke-token` - Accepts userId, revokes that user's tokens

