# Blogs REST API — Express.js + TypeScript + MongoDB

A full-featured REST API with a real MongoDB database using Mongoose.

## Project Structure

```
blogs-api/
├── src/
│   ├── app.ts                          # Entry point
│   ├── config/
│   │   └── db.ts                       # MongoDB connection
│   ├── models/
│   │   └── blog.model.ts               # Mongoose schema & model
│   ├── controllers/
│   │   └── blog.controller.ts          # All route handlers
│   ├── routes/
│   │   └── blog.routes.ts              # Route definitions
│   ├── middleware/
│   │   └── validation.middleware.ts    # Request validation
│   └── types/
│       └── blog.types.ts               # TypeScript interfaces & DTOs
├── .env                                # Environment variables
├── tsconfig.json
└── package.json
```

## Setup & Run

```bash
npm install
npm run dev
```

Make sure MongoDB is running locally before starting.

## API Endpoints

| Method | URL | Description | Status Codes |
|--------|-----|-------------|--------------|
| GET | `/api/blogs` | Get all blogs | 200 |
| GET | `/api/blogs?published=true` | Filter by published | 200 |
| GET | `/api/blogs?author=Furqan` | Filter by author | 200 |
| GET | `/api/blogs?tag=javascript` | Filter by tag | 200 |
| GET | `/api/blogs/:id` | Get single blog | 200, 400, 404 |
| POST | `/api/blogs` | Create new blog | 201, 409, 422 |
| PUT | `/api/blogs/:id` | Full replacement | 200, 400, 404, 409, 422 |
| PATCH | `/api/blogs/:id` | Partial update | 200, 400, 404, 409, 422 |
| DELETE | `/api/blogs/:id` | Delete one | 200, 400, 404 |
| DELETE | `/api/blogs` | Delete all | 200 |

## Blog Schema

```typescript
{
  title: string       // required, 3–150 chars
  content: string     // required, min 10 chars
  author: string      // required
  slug: string        // required, unique, lowercase, letters/numbers/hyphens only
  tags: string[]      // optional, default []
  published: boolean  // optional, default false
  createdAt: Date     // auto-generated
  updatedAt: Date     // auto-updated
}
```

## Example Requests (Postman)

### POST — Create Blog
```json
POST http://localhost:3000/api/blogs
Content-Type: application/json

{
  "title": "Getting Started with TypeScript",
  "content": "TypeScript is a strongly typed programming language that builds on JavaScript.",
  "author": "Furqan",
  "slug": "getting-started-typescript",
  "tags": ["typescript", "javascript", "programming"],
  "published": true
}
```

### GET — All Blogs
```
GET http://localhost:3000/api/blogs
GET http://localhost:3000/api/blogs?published=true
GET http://localhost:3000/api/blogs?author=Furqan
GET http://localhost:3000/api/blogs?tag=typescript
```

### PATCH — Partial Update
```json
PATCH http://localhost:3000/api/blogs/:id
Content-Type: application/json

{ "published": true }
```

### PUT — Full Replace (all fields required)
```json
PUT http://localhost:3000/api/blogs/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content goes here.",
  "author": "Furqan",
  "slug": "updated-title",
  "tags": ["updated"],
  "published": true
}
```

### DELETE
```
DELETE http://localhost:3000/api/blogs/:id
DELETE http://localhost:3000/api/blogs
```

## Difference from Todo API

| | Todo API | Blogs API |
|---|---|---|
| Storage | In-memory array | Real MongoDB |
| Persistence | Lost on restart | Permanent |
| Queries | JS array filter | MongoDB queries |
| Validation | Manual checks | Mongoose schema |
| IDs | Custom strings | MongoDB ObjectId |
