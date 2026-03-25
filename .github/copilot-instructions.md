# SmartHomeFinder Copilot Instructions

## Project Overview
SmartHomeFinder is a full-stack real estate platform with a **React frontend** (port 3000) and **Node.js/Express backend** (uses PostgreSQL). The app connects property buyers with landlords, with admin oversight for property approvals.

## Architecture
- **Frontend**: React 19 with React Router (7.x), context-based state management, localStorage for auth
- **Backend**: Express (ES6 modules), PostgreSQL database, Cloudinary for media storage
- **Key Layers**: Controllers → Routes → Context/API endpoints → Services

## Authentication & Authorization

### JWT Token Flow
- **Generation**: On signup/login, backend returns JWT token (expires in 7 days by default, see `JWT_EXPIRES_IN` in `.env`)
- **Token payload**: `{ id, email, role }` (signed with `JWT_SECRET`)
- **Header format**: `Authorization: Bearer <token>` (note: space between Bearer and token)
- **Frontend storage**: localStorage keys: `token`, `user` (JSON), `isLoggedIn` (true/false string)

### Backend Authentication Middleware
**File**: [authMiddleware.js](../SmartHomeFinderBackend/src/middleware/authMiddleware.js)

1. **`protect()` middleware** - Validates JWT token
   - Extracts token from `Authorization: Bearer <token>` header
   - Verifies token using `JWT_SECRET`
   - Populates `req.user = { id, email, role }`
   - Returns 401 if missing/invalid, 500 if `JWT_SECRET` not set
   - Used on: `/api/auth/profile`, `/api/users/properties`, `/api/admin/*`

2. **`isLandlord()` middleware** - Role-based guard
   - Requires `req.user.role === "landlord"`
   - Returns 403 if not landlord
   - Used on: `/api/users/properties` (property submission)

3. **`isAdmin()` middleware** - Admin-only guard
   - Requires `req.user.role === "admin"`
   - Returns 403 if not admin
   - Used on: `/api/admin/*` (all admin operations)

### Frontend Authentication (App.js)
**File**: [App.js](../SmartHomeFinderApp/src/App.js) - `ProtectedRoute` component

```javascript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```
- Checks `localStorage.getItem("isLoggedIn") === "true"`
- Redirects to `/login` if not logged in
- If `requiredRole` specified, validates `user.role` from localStorage
- Redirects to `/` if role doesn't match

### User Registration & Login
**File**: [authController.js](../SmartHomeFinderBackend/src/controllers/authController.js)

1. **`registerUser()`** - Creates new user account
   - Input: `{ full_name, email, password, role? }`
   - Default role: `"tenant"` (or specify: `"landlord"`, `"admin"`)
   - Password: hashed with bcrypt (salt factor 10)
   - Email: must be unique (409 Conflict if duplicate)
   - Response: `{ user, token }` - auto-login after signup

2. **`loginUser()`** - Authenticates user
   - Input: `{ email, password }`
   - Validates bcrypt hash match
   - Response: `{ user, token }`
   - Stores in localStorage: `user`, `token`, `isLoggedIn="true"`

3. **`getProfile()`** - Fetch current user (protected)
   - Requires: `protect` middleware
   - Uses: `req.user.id` from decoded token
   - Response: `{ user: { id, full_name, email, role, ... } }`

### Password Reset Flow
**Files**: [forgotPassword](../SmartHomeFinderBackend/src/controllers/authController.js#L176), [resetPassword](../SmartHomeFinderBackend/src/controllers/authController.js#L208)

1. **`POST /api/auth/forgot-password`** - Request reset
   - Input: `{ email }`
   - Creates row in `password_resets` table with bcrypt-hashed token (15 min expiry)
   - Logs reset link to console: `http://localhost:3000/reset-password/{rawToken}`
   - Returns 200 for both valid & invalid emails (security best practice)

2. **`POST /api/auth/reset-password`** - Complete reset
   - Input: `{ token, password }`
   - Finds matching token hash (not expired, not used)
   - Hashes new password with bcrypt
   - Sets `password_resets.used = true` after update

### Role-Based Access Control
| Role | Can Do | Routes |
|------|--------|--------|
| **tenant** | Browse properties, search | `/`, `/login`, `/signup`, `/profile` |
| **landlord** | Add properties, manage listings | `/add-property`, `/profile`, `/property-request` |
| **admin** | Approve/reject/publish properties, audit trail | `/admin` (protected) |

### API Endpoint Protection Pattern
**Example**: Property submission endpoint
```javascript
// In userRoutes.js
router.post("/properties", protect, isLandlord, addProperty);
// ↑ public          ↑ must have token  ↑ must be landlord  ↑ controller
```
- **Order matters**: Always apply `protect` before role checks
- **Error precedence**: 401 (auth) before 403 (authorization)

### Common Auth Mistakes to Avoid
- Missing `Bearer ` prefix in Authorization header (e.g., just `token` instead of `Bearer token`)
- Sending token in body instead of header
- Forgetting to set `JWT_SECRET` in `.env`
- Using plain passwords instead of hashed in comparison
- Checking role before verifying token (wrong middleware order)

## Data Flow & Key Services

### Frontend Data Management
- [PropertiesContext.js](../SmartHomeFinderApp/src/context/PropertiesContext.js) provides global property list & functions
- Local storage keys: `app_properties_v1`, `app_img_cards_v1` (caching)
- API calls use **axios** (check [src/api/](../SmartHomeFinderApp/src/api/))
- Routes in [AppNavigator.js](../SmartHomeFinderApp/src/navigation/AppNavigator.js)

### Backend API Routes
- `/api/auth/*` → [authController.js](../SmartHomeFinderBackend/src/controllers/authController.js) (signup, login, password reset)
- `/api/admin/*` → [adminController.js](../SmartHomeFinderBackend/src/controllers/adminController.js) (property approval, listing)
- `/api/media/*` → [mediaRoutes.js](../SmartHomeFinderBackend/src/routes/mediaRoutes.js) (Cloudinary uploads)
- `/api/users/*` → [userRoutes.js](../SmartHomeFinderBackend/src/routes/userRoutes.js)

## Database & Migrations
- PostgreSQL (host/port from `.env`: PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE)
- Run migrations: `npm run migrate` (executes [runMigrations.js](../SmartHomeFinderBackend/runMigrations.js))
- All migrations in [migrations/](../SmartHomeFinderBackend/migrations/) folder run in order

### Database Schema

#### `users` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID/SERIAL PRIMARY KEY | User identifier |
| `full_name` | VARCHAR(255) | Display name |
| `email` | VARCHAR(255) UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | bcrypt hash (never return raw) |
| `role` | VARCHAR(50) | `'tenant'`, `'landlord'`, `'admin'` (default: tenant) |
| `avatar_url` | TEXT | Profile picture (base64 or URL) |
| `is_verified` | BOOLEAN | Email verification status |
| `created_at` | TIMESTAMPTZ | Account creation time |

#### `properties` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | Property identifier |
| `landlord_id` | UUID FK → users | Owner of property |
| `name` | VARCHAR(255) | Property title |
| `description` | TEXT | Full details |
| `price` | DECIMAL(15,2) | Rental/sale price |
| `location` | VARCHAR(255) | Address (supports ILIKE search) |
| `property_type` | VARCHAR(50) | 'Bungalow', 'Apartment', 'Land', etc. |
| `purpose` | VARCHAR(50) | 'Rent' or 'Sell' |
| `year_built` | INTEGER | Construction year |
| `num_bedrooms` | INTEGER | Count |
| `num_bathrooms` | INTEGER | Count |
| `land_size` | INTEGER | Square meters |
| `has_garage` | BOOLEAN DEFAULT FALSE | Amenity flag |
| `property_doc` | TEXT | Cloudinary URL for sale documents |
| `property_doc_id` | INTEGER FK → media | Alternative: binary document storage |
| `is_approved` | BOOLEAN DEFAULT FALSE | Admin approval status |
| `is_published` | BOOLEAN DEFAULT FALSE | Public listing visibility |
| `created_at` | TIMESTAMPTZ | Submission time |
| `updated_at` | TIMESTAMPTZ | Last modified time |
| **Indexes**: `idx_properties_landlord_id`, `idx_properties_is_approved`, `idx_properties_is_published` |

#### `media` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | Media file identifier |
| `property_id` | INTEGER FK → properties | Associated property (CASCADE delete) |
| `file_type` | VARCHAR(50) | `'image'`, `'video'`, `'document'` |
| `mime_type` | VARCHAR(100) | `'image/jpeg'`, `'video/mp4'`, etc. |
| `file_size` | INTEGER | Bytes |
| `file_data` | BYTEA | Binary file content (for direct DB storage) |
| `created_at` | TIMESTAMPTZ | Upload time |
| **Index**: `idx_media_property_id` |
| **Note**: Currently Cloudinary URLs stored in `properties.property_doc` (preferred), but table structure supports binary storage |

#### `password_resets` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | Reset token identifier |
| `user_id` | UUID FK → users | User requesting reset |
| `token_hash` | VARCHAR(255) | bcrypt hash of reset token (never plaintext) |
| `used` | BOOLEAN DEFAULT FALSE | Flag after password updated |
| `expires_at` | TIMESTAMPTZ | Token validity (15 min default) |

#### `admin_audit` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PRIMARY KEY | Audit log entry |
| `admin_id` | UUID FK → users | Admin who performed action |
| `property_id` | INTEGER FK → properties | Affected property (nullable) |
| `action` | VARCHAR(100) | `'approve'`, `'reject'`, `'toggle_publish'` |
| `details` | JSONB | Contextual data: `{by: email, new_state: bool}` |
| `created_at` | TIMESTAMPTZ | When action occurred |
| **Indexes**: `idx_admin_audit_admin_id`, `idx_admin_audit_property_id` |

## Property Submission Workflow

### Landlord Property Submission (Frontend)
**File**: [AddProperty.js](../SmartHomeFinderApp/src/screens/AddProperty.js)

1. **Form Data Collection**: Landlord fills form with property details:
   - Basic info: name, description, price, location, property_type, purpose (Rent/Sell)
   - Specs: year_built, num_bedrooms, num_bathrooms, land_size, has_garage
   - Media: images (array), video_url, property_doc (Cloudinary URLs)

2. **Cloudinary Direct Upload** (Client-side):
   - Images → `https://api.cloudinary.com/v1_1/{cloud_id}/image/upload`
   - Videos → `https://api.cloudinary.com/v1_1/{cloud_id}/video/upload`
   - Documents → `https://api.cloudinary.com/v1_1/{cloud_id}/raw/upload`
   - Each requires `upload_preset` (e.g., `smartHomeFinderImage`)
   - Returns `response.data.secure_url` (stored in formData)

3. **Special Handling**: If `propertyType === "land"`, fields `numBedrooms`, `numBathrooms`, `hasGarage` are removed before submission

4. **POST Submission**:
   ```javascript
   POST /api/users/properties
   Headers: { Authorization: "Bearer <token>", Content-Type: "application/json" }
   Body: { name, description, price, location, propertyType, purpose, images[], video_url, propertyDoc, ... }
   ```

### Backend Property Storage
**File**: [propertyController.js](../SmartHomeFinderBackend/src/controllers/propertyController.js) → `addProperty()`

1. **Transaction Block** (atomic operation):
   - `BEGIN` transaction
   - Insert property row into `properties` table with `landlord_id = req.user.id`
   - For each image/video/document: Insert into `media` table with `property_id` FK (uses `parseBase64File()` if base64, otherwise stores Cloudinary URL)
   - `COMMIT` on success, `ROLLBACK` on error

2. **Key Fields Set by Backend**:
   - `is_approved = FALSE` (default) - requires admin approval
   - `is_published = FALSE` (default) - not visible to tenants yet
   - `created_at = NOW()`, `updated_at = NOW()`

3. **Media Handling**: Two approaches coexist:
   - **Cloudinary** (preferred): `property_doc` stores Cloudinary URL directly
   - **Binary DB**: `media` table stores `file_data` (BYTEA) for images/videos (legacy)

### Admin Approval Flow
**File**: [AdminDashboard.js](../SmartHomeFinderApp/src/screens/AdminDashboard.js)

1. **Fetch Properties** (paginated + searchable):
   ```javascript
   GET /api/admin/properties?page=1&limit=10&q=search_term
   Headers: { Authorization: "Bearer <token>" }
   Response: { properties[], total, page, pages, limit }
   ```
   - Admin sees all properties (approved/unapproved, published/unpublished)
   - Search via ILIKE on: name, location, landlord email

2. **Actions Available**:
   - **Approve**: PUT `/api/admin/properties/{id}/approve` → sets `is_approved = TRUE`, creates audit log
   - **Reject**: PUT `/api/admin/properties/{id}/reject` → sets `is_approved = FALSE`, creates audit log
   - **Toggle Publish**: PUT `/api/admin/properties/{id}/toggle-publish` → toggles `is_published`, creates audit log

3. **Admin Audit Trail** (automatic):
   - Each action inserts row into `admin_audit` table
   - Records: admin_id, property_id, action, details (JSONB: `{by: email, new_state: bool}`)

### Property State Transitions
```
Landlord submits → is_approved=F, is_published=F (Draft)
                 ↓
Admin approves → is_approved=T, is_published=F (Approved, Hidden)
                 ↓
Admin publishes → is_approved=T, is_published=T (Live/Visible)
```
- Approved properties show in tenant searches/home
- Unapproved properties appear only in admin dashboard
- Rejected properties revert to draft state

## Admin Operations & Audit Logging

### Backend Admin Operations
**File**: [adminController.js](../SmartHomeFinderBackend/src/controllers/adminController.js)

All admin operations use **transaction blocks** (BEGIN/COMMIT/ROLLBACK) for atomicity:

1. **`getAllProperties()`** - Fetch paginated + searchable properties
   - Query params: `page` (default 1), `limit` (default 20, max 100), `q` (search term)
   - Search: ILIKE on `properties.name`, `properties.location`, `users.email`
   - Response includes `total`, `page`, `pages`, `limit`
   - Returns all properties regardless of approval/publish status (admins need full view)

2. **`approveProperty()`** - Mark property as approved
   - **Transaction**:
     - `BEGIN`
     - `UPDATE properties SET is_approved = TRUE, updated_at = NOW() WHERE id = $1`
     - `INSERT INTO admin_audit(...)`  
     - `COMMIT` on success, `ROLLBACK` on error
   - Returns 404 if property not found, 500 on error
   - **Audit entry**: `{ admin_id, property_id, action: "approve", details: {by: email} }`

3. **`rejectProperty()`** - Mark property as not approved
   - Same transaction pattern as approve
   - Sets `is_approved = FALSE`
   - **Audit entry**: `{ action: "reject", ... }`

4. **`togglePublish()`** - Toggle property visibility
   - Sets `is_published = NOT COALESCE(is_published, FALSE)`
   - **Audit entry**: `{ action: "toggle_publish", details: {by: email, new_state: boolean} }`
   - Returns updated property with new state

### Audit Logging
**Table**: `admin_audit` (see Database Schema)

- **Automatic**: Every admin action inserts audit record (within same transaction)
- **Fields**:
  - `admin_id`: UUID of admin who performed action (from `req.user.id`)
  - `property_id`: Target property ID (nullable for future non-property audits)
  - `action`: String code (`"approve"`, `"reject"`, `"toggle_publish"`)
  - `details`: JSONB with contextual data
    - `by`: Admin email or ID
    - `new_state`: For publish toggle (boolean)
    - Extensible for future audit metadata
  - `created_at`: Timestamp (auto-set)
- **Indexes**: `idx_admin_audit_admin_id`, `idx_admin_audit_property_id` for fast queries

### Frontend Admin Dashboard
**File**: [AdminDashboard.js](../SmartHomeFinderApp/src/screens/AdminDashboard.js)

1. **Two-Phase Actions** (Confirm modal):
   - Click Approve/Reject/Publish → Opens `ConfirmModal` with action type
   - User confirms → `executeAction()` fires API call
   - **Optimistic update**: Update UI immediately, rollback on error

2. **Pagination & Search**:
   - Fetches on: component mount, page change, search change
   - Search resets pagination to page 1
   - Uses query params: `?page=1&limit=10&q=search+term`

3. **State Management**:
   - Local state: `properties`, `page`, `pages`, `search`, `error`
   - Modal state: `{ open, action, propertyId }`
   - Real-time property list updates on action confirmation

### Transaction Pattern (Critical)
All multi-step admin operations use connection pooling with explicit transaction control:

```javascript
const client = await pool.connect();
try {
  await client.query("BEGIN");
  // Step 1: Update property
  const result = await client.query("UPDATE properties SET ... WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    await client.query("ROLLBACK");
    return res.status(404).json({ message: "Not found" });
  }
  // Step 2: Insert audit log (within same transaction)
  await client.query("INSERT INTO admin_audit(...) VALUES (...)", [admin_id, property_id, action, details]);
  // Commit if both succeed
  await client.query("COMMIT");
  return res.json({ property: result.rows[0] });
} catch (err) {
  await client.query("ROLLBACK");
  return res.status(500).json({ message: "Server error" });
} finally {
  client.release();
}
```

**Why transactions matter**: If audit insert fails, property update rolls back automatically. Prevents orphaned property updates without audit trails.

### Common Admin Workflows

| Task | Frontend | Backend | Audit |
|------|----------|---------|-------|
| View pending properties | AdminDashboard fetches with `?q=` filter | `getAllProperties` ILIKE search | N/A |
| Approve property | Click "Approve" → Confirm modal | `approveProperty` + audit insert | ✓ recorded |
| Reject property | Click "Reject" → Confirm modal | `rejectProperty` + audit insert | ✓ recorded |
| Make visible | Click "Publish" → Confirm modal | `togglePublish` + audit insert | ✓ recorded with new_state |
| Batch operations | Not yet implemented | Would need loop over IDs in transaction | N/A |
- Backend wraps async routes in try/catch, returns `{ message, code }`
- Frontend checks `response.status` and localStorage for auth state
- Admin operations use transaction blocks (`BEGIN`/`COMMIT`) in [adminController](../SmartHomeFinderBackend/src/controllers/adminController.js#L51)

### Pagination
- [getAllProperties](../SmartHomeFinderBackend/src/controllers/adminController.js#L3): `page`, `limit` (default 20, max 100), `offset = (page-1)*limit`
- Returns `{ properties, total, page, pages, limit }`

### Search
- ILIKE queries for case-insensitive search (e.g., property name, location)
- Pagination + search example in adminController

### Media Handling
- Cloudinary integration for image/video uploads (see [server.js](../SmartHomeFinderBackend/server.js#L19))
- Multer middleware for file parsing (limit: 200mb)

## Development Workflow

### Frontend
```bash
cd SmartHomeFinderApp
npm start           # Port 3000, auto-reload
npm test            # Test runner in watch mode
npm run build       # Production build → /build folder
```

### Backend
```bash
cd SmartHomeFinderBackend
npm run dev         # nodemon (auto-reload on file changes)
npm start           # Direct Node execution
npm run migrate     # Run pending DB migrations
```

### Environment Setup
Create `.env` in both directories:
- **Backend .env**: `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`, `JWT_SECRET`, `CLOUDINARY_*`
- **Frontend .env** (optional): API base URL for axios

## Cross-Component Communication
- Frontend → Backend: Axios calls to `/api/*` endpoints with JWT token
- Backend → Database: Pool queries with parameterized statements (`$1`, `$2` in postgres)
- State updates: React Context re-renders child components on state change

## File Organization Notes
- Controllers handle business logic, routes handle HTTP mapping
- Components in [/components](../SmartHomeFinderApp/src/components/) are mostly presentational
- Screens in [/screens](../SmartHomeFinderApp/src/screens/) are page-level components with auth checks
- Static data in [/data](../SmartHomeFinderApp/src/data/) (cardList.js, imgCardList.js)

## Testing & Debugging
- Backend: Check server logs for "❌" / "✅" prefixes (structured logging in authMiddleware, controllers)
- Frontend: Browser DevTools, check localStorage for auth state
- Database: Test queries with `psql` directly or via pool.query() test scripts

## Quick Troubleshooting
- **401 errors**: Missing/invalid JWT token → check `Authorization` header format
- **CORS issues**: Backend allows only `http://localhost:3000` → update [server.js](../SmartHomeFinderBackend/server.js#L27) if needed
- **DB connection fails**: Verify `.env` variables and PostgreSQL is running
- **Build fails**: Ensure all imports use relative paths, no missing dependencies (run `npm install`)
