# v-ray

An internal tool to inspect response headers, see framework and provider usage, and display the IP and ASN.

## Providers API

**Request:**

```bash
curl -X POST https://v-ray.app/api/providers \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://vercel.com"
  }'
```

**Response:**

```json
{
  "frameworks": ["Next.js App Router", "React"],
  "providers": ["Vercel"]
}
```

### Request Body

The API expects a JSON payload containing the following field:

- **`url`** (string): The URL to analyze. This is a required field.

### Response

- **`200 OK`**: Returns an object with details about the frameworks and providers detected.
- **`400 Bad Request`**: Returned if the `url` field is missing, invalid, or cannot be processed.
- **`405 Method Not Allowed`**: Returned if a `GET` request is made instead of a `POST`.
