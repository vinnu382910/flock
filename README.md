# Urja Meter Ops API Reverse Engineering

## Project Overview

This project builds a clean REST API over the legacy **Urja Meter Ops** portal used by electricity distribution utilities.

The legacy portal does not provide a public API. By inspecting the browser's network traffic, the internal APIs used by the portal were identified and documented. These APIs are consumed by the backend service and exposed through a clean REST interface.

---

# Authentication Flow

```
User
   │
   ▼
POST /login
   │
   ▼
Session Cookie Created
(__Secure-better-auth.session_token)
   │
   ▼
Authenticated Requests
```

The portal uses **session-based authentication**.

After successful login, the server returns the following cookie:

```
__Secure-better-auth.session_token
```

Every subsequent request requires this cookie.

---

# Internal APIs Discovered

| No | Module | Method | Endpoint | Purpose | Authentication |
|----|----------|--------|----------|----------|----------------|
| 1 | Login | POST | `/login` | Authenticate user | ❌ |
| 2 | Logout | POST | `/api/auth/sign-out` | Logout current user | ✅ |
| 3 | Meter Page Loader | GET | `/meters/__data.json?x-sveltekit-invalidated=010` | Loads SvelteKit page data | ✅ |
| 4 | Meter Search | GET | `/portal/meters/search?q=&page=1` | Returns paginated meter list | ✅ |
| 5 | Meter Search | GET | `/portal/meters/search?q={search}&page=1` | Search meters | ✅ |
| 6 | Meter Pagination | GET | `/portal/meters/search?q=&page={page}` | Next/Previous pages | ✅ |
| 7 | Meter Details | GET | `/meters/{meterId}/__data.json` | Loads selected meter page | ✅ |
| 8 | Meter Geo | GET | `/portal/meters/{meterId}/geo` | Meter latitude & longitude | ✅ |
| 9 | Meter Energy | GET | `/portal/meters/{meterId}/energy` | Energy consumption history | ✅ |
| 10 | Export Metadata | GET | `/portal/keys` | Export metadata before download | ✅ |
| 11 | Export Dataset | GET | `/portal/export?page=1` | Downloads complete meter dataset | ✅ |
| 12 | Transformers | GET | `/portal/dts?page=1` | Returns transformer list | ✅ |

---

# API Details

---

## 1. Login

### Endpoint

```
POST /login
```

### Request Type

```
application/x-www-form-urlencoded
```

### Form Data

```
username=operator@urja.local
password=urja-ops-2026
```

### Important Headers

```
Accept: application/json

Content-Type: application/x-www-form-urlencoded

x-sveltekit-action: true
```

### Response

```
HTTP 200 OK
```

Returns

```
Set-Cookie

__Secure-better-auth.session_token=...
```

---

## 2. Logout

### Endpoint

```
POST /api/auth/sign-out
```

Purpose

- Clears session
- Removes authentication cookies

---

## 3. Meter Dashboard Loader

### Endpoint

```
GET /meters/__data.json?x-sveltekit-invalidated=010
```

Purpose

Loads SvelteKit route data before displaying the dashboard.

---

## 4. Meter Search

### Endpoint

```
GET /portal/meters/search
```

### Query Parameters

| Parameter | Description |
|------------|-------------|
| q | Search text |
| page | Page number |

### Examples

```
GET /portal/meters/search?q=&page=1
```

```
GET /portal/meters/search?q=v&page=1
```

```
GET /portal/meters/search?q=&page=2
```

Returns

- Meter List
- Search Results
- Pagination

---

## 5. Meter Details

### Endpoint

```
GET /meters/{meterId}/__data.json
```

Example

```
GET /meters/J100000/__data.json
```

Purpose

Loads page data for the selected meter.

---

## 6. Meter Geo

### Endpoint

```
GET /portal/meters/{meterId}/geo
```

Example

```
GET /portal/meters/J100000/geo
```

Returns

```
Latitude

Longitude
```

---

## 7. Meter Energy

### Endpoint

```
GET /portal/meters/{meterId}/energy
```

Example

```
GET /portal/meters/J100000/energy
```

Returns

- Energy History
- Consumption Data

---

## 8. Export Keys

### Endpoint

```
GET /portal/keys
```

Purpose

This request is triggered immediately before exporting all meters.

It appears to provide metadata required for the export process.

---

## 9. Export All Meters

### Endpoint

```
GET /portal/export?page=1
```

Purpose

Downloads the complete meter dataset.

Each exported record contains:

```
meterId

serialNo

make

phaseType

installStatus

installType

build

dtCode

geo

hierarchy
```

---

### Hierarchy Object

```
Zone

Circle

Division

Subdivision

Substation

Feeder

Distribution Transformer
```

---

### Geo Object

```
lat

lng
```

---

## 10. Transformers

### Endpoint

```
GET /portal/dts?page=1
```

Purpose

Returns the list of Distribution Transformers.

Each transformer contains information such as:

- DT Code
- DT Name
- Feeder
- Capacity

---

# Authentication

The application uses session-based authentication.

After login, the server creates

```
__Secure-better-auth.session_token
```

This cookie must be included with every request.

---

# Complete Internal API Inventory

| Module | Endpoint |
|----------|----------|
| Authentication | POST `/login` |
| Authentication | POST `/api/auth/sign-out` |
| Dashboard | GET `/meters/__data.json` |
| Meter Search | GET `/portal/meters/search` |
| Meter Details | GET `/meters/{id}/__data.json` |
| Geo Location | GET `/portal/meters/{id}/geo` |
| Energy | GET `/portal/meters/{id}/energy` |
| Export Metadata | GET `/portal/keys` |
| Export Dataset | GET `/portal/export?page=1` |
| Transformers | GET `/portal/dts?page=1` |

---

# Network Hierarchy

The exported dataset reveals the electrical hierarchy used by the portal.

```
Zone
    │
Circle
    │
Division
    │
Subdivision
    │
Substation
    │
Feeder
    │
Distribution Transformer
    │
Meter
```

---

# Notes

The APIs documented above were identified through browser network inspection while interacting with the portal.
