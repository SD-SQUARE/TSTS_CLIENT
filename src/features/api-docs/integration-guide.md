# TSTS API Integration Guide

This guide shows external systems how to authenticate and use the TSTS API with an API key.

## Getting an API Key

Contact your TSTS administrator to issue an API key scoped to the endpoints you need. Keys are created under **Settings → API Integrations**.

When you receive a key it looks like:

```
tsts_live_a1b2c3d4e5_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Store it securely. It is shown only once and cannot be recovered — only revoked and reissued.

---

## Authentication

Add the key to every request using the `X-API-Key` header:

```bash
curl https://your-tsts-host/api/v1/tickets \
  -H "X-API-Key: tsts_live_xxxxxxxxxx_secret"
```

Alternatively, use the `Authorization` header with the `ApiKey` scheme:

```bash
curl https://your-tsts-host/api/v1/tickets \
  -H "Authorization: ApiKey tsts_live_xxxxxxxxxx_secret"
```

---

## Checking Your Key Scope

Before making requests, verify which zones and methods your key is authorized for:

```http
GET /api/v1/api-integrations/scope
X-API-Key: tsts_live_xxxxxxxxxx_secret
```

**Response:**

```json
{
  "apiKey": {
    "name": "My Integration",
    "keyPrefix": "xxxxxxxxxx",
    "zones": ["tickets", "lookups"],
    "methods": ["GET", "POST"],
    "isActive": true
  },
  "zones": [
    {
      "key": "tickets",
      "label": "Tickets",
      "description": "Create, read, and update ticket data.",
      "paths": ["/api/v1/tickets"]
    }
  ],
  "methods": ["GET", "POST"]
}
```

---

## Available Zones

| Zone | Endpoints | Description |
|------|-----------|-------------|
| `tickets` | `/api/v1/tickets` | Create and read support tickets |
| `knowledge_base` | `/api/v1/knowledge-base` | Read knowledge base articles |
| `custom_forms` | `/api/v1/custom-forms` | Read custom forms and submit responses |
| `reports` | `/api/v1/reports` | Read operational reports |
| `lookups` | `/api/v1/lookups`, `/api/v1/specializations`, `/api/v1/problems`, etc. | Reference data for building forms |
| `notifications` | `/api/v1/notifications` | Read notification data |

---

## Example: List Tickets

```bash
curl https://your-tsts-host/api/v1/tickets \
  -H "X-API-Key: tsts_live_xxxxxxxxxx_secret"
```

**Response (200):**

```json
{
  "tickets": [
    {
      "id": "uuid",
      "ticket_number": 42,
      "title": "Cannot access portal",
      "status": "Open",
      "priority": "NA",
      "createdAt": "2026-06-01T10:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page_index": 1, "page_size": 20 }
}
```

## Example: Create a Ticket

Requires the `tickets` zone with `POST` method.

```bash
curl -X POST https://your-tsts-host/api/v1/tickets \
  -H "X-API-Key: tsts_live_xxxxxxxxxx_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot access student portal",
    "description": "Error 403 when logging in since this morning.",
    "specializationId": "uuid-of-specialization",
    "problemId": "uuid-of-problem"
  }'
```

## Example: Get Specializations (Lookups)

Requires the `lookups` zone.

```bash
curl https://your-tsts-host/api/v1/specializations \
  -H "X-API-Key: tsts_live_xxxxxxxxxx_secret"
```

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `401 Unauthorized` | Missing or invalid API key |
| `403 Forbidden` | Key is inactive, expired, or not allowed for this zone/method |
| `404 Not Found` | Resource does not exist |
| `400 / 422` | Validation error — check the request body |
| `500` | Server error — contact your administrator |

---

## Rate Limiting

The API allows **1000 requests per 15 minutes** per IP address. Exceeding this returns `429 Too Many Requests`.

---

## Key Expiry and Revocation

- Keys can have an optional expiry date set by the administrator.
- An expired or revoked key returns `403 Forbidden`.
- Request a new key from your administrator if yours expires.
