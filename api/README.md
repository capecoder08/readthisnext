# Read This Next API

FastAPI-based REST API for the Read This Next book recommendation platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the `api` directory with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. Run the API server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Endpoints

### User Profile

- `GET /api/users/me` - Get current user's profile
- `PUT /api/users/me` - Update current user's profile

### Library

- `GET /api/library` - Get user's library
- `POST /api/library` - Add a book to library
- `DELETE /api/library/{book_id}` - Remove a book from library

## Authentication

All endpoints require authentication via Bearer token. Include the Supabase JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Example Usage

### Get User Profile
```bash
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer <token>"
```

### Add Book to Library
```bash
curl -X POST "http://localhost:8000/api/library" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "status": "want_to_read",
    "genres": ["Literary Fiction"]
  }'
```

