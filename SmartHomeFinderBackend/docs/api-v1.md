# SmartHomeFinder API v1

## Base URL
- Local: `http://localhost:5000/api/v1`

## Auth
- JWT in header: `Authorization: Bearer <token>`
- Tokens issued via `/auth/login` or `/auth/signup`

## Common Headers
- `Content-Type: application/json`
- `Authorization` when required

## Public Endpoints
- `GET /auth/health` (use `/` root if needed) — simple reachability (use server root)
- `GET /users/properties` — list published, approved properties
- `GET /users/properties/:id` — single published property by id
- `POST /auth/forgot-password` — request reset link
- `POST /auth/reset-password` — complete password reset

## Authenticated User Endpoints
- `POST /auth/signup` — create account (roles: tenant, landlord, admin)
- `POST /auth/login` — login
- `GET /auth/profile` — current user profile
- `PUT /auth/avatar` — update avatar (base64 or URL)
- `POST /users/property-request` — submit property request (any logged-in user)
- `GET /users/properties/mine` — list own properties (landlord)
- `PATCH /users/properties/:id/verify-location` — set lat,long for owned property (landlord)
- `POST /users/properties` — create property (landlord)

## Media
- `POST /media/upload` — multipart file upload to Cloudinary (expects `file` field). Returns `url`, `public_id`, `resource_type`, `format`, `bytes`.

## Admin (requires role admin)
- `GET /admin/properties?page=1&limit=10&q=search` — paginated properties (all states)
- `PUT /admin/properties/:id/approve` — mark approved
- `PUT /admin/properties/:id/reject` — mark rejected
- `PUT /admin/properties/:id/toggle-publish` — toggle publish flag
- `DELETE /admin/properties/:id` — delete property and media

## Legacy vs v1
- Legacy routes remain at `/api/*` for compatibility.
- New clients should use `/api/v1/*` paths above.

## Sample cURL
```sh
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Create property (landlord)
curl -X POST http://localhost:5000/api/v1/users/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test","description":"Nice","price":100000,"location":"Lagos","propertyType":"apartment","purpose":"Rent","yearBuilt":2020,"numBedrooms":2,"numBathrooms":2,"landSize":100,"hasGarage":false,"images":["https://.../image.jpg"]}'
```

## Notes for Mobile Clients
- CORS is configured to allow common mobile dev hosts (Expo/React Native) and to accept requests with no `Origin` header.
- Keep tokens in secure storage (Keychain/Keystore) and send via `Authorization` header.
- Large payloads are limited by Express to 200mb; prefer uploading media via `/media/upload` to get URLs, then include URLs in JSON payloads.
