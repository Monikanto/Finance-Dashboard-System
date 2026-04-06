# Finance Dashboard Backend API

A production-ready REST API for a Finance Dashboard built with **TypeScript**, **Express 5**, **Prisma 7**, **PostgreSQL**, **JWT**, and **Zod**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users (Admin Only)](#users-admin-only)
  - [Financial Records](#financial-records)
  - [Dashboard Analytics](#dashboard-analytics)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Error Handling](#error-handling)
- [Design Decisions](#design-decisions)

---

## Features

- 🔐 **JWT Authentication** — Signup, login, and token-based auth
- 👥 **Role-Based Access Control** — VIEWER, ANALYST, and ADMIN roles
- 📊 **Dashboard Analytics** — Income/expense summaries, category breakdowns, monthly trends
- 💳 **Financial Records** — Full CRUD with filtering, pagination, and sorting
- 🛡️ **Input Validation** — Request validation via Zod schemas
- 🗑️ **Soft Deletes** — Records and users are soft-deleted (recoverable)
- ⚡ **Rate Limiting** — API rate limiting to prevent abuse
- 🔒 **Security** — Helmet headers, CORS, bcrypt password hashing

---

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript 6 | Type-safe development |
| Express 5 | HTTP framework |
| Prisma 7 | ORM & database toolkit |
| PostgreSQL | Relational database |
| JSON Web Tokens | Authentication |
| Zod 4 | Schema validation |
| bcryptjs | Password hashing |
| Helmet | Security headers |

---

## Project Structure

```
finance-dashboard-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data (admin + sample records)
│   └── migrations/            # Auto-generated migrations
├── prisma.config.ts           # Prisma 7 configuration
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Entry point
│   ├── config/
│   │   └── index.ts           # Environment configuration
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── types/
│   │   └── express.d.ts       # Express type augmentation
│   ├── utils/
│   │   ├── apiResponse.ts     # Standardized response helpers
│   │   ├── appError.ts        # Custom error class
│   │   └── catchAsync.ts      # Async error wrapper
│   ├── middleware/
│   │   ├── authenticate.ts    # JWT verification
│   │   ├── authorize.ts       # Role-based guards
│   │   ├── validate.ts        # Zod validation middleware
│   │   └── errorHandler.ts    # Global error handler
│   └── modules/
│       ├── auth/              # Signup & Login
│       ├── users/             # User management (Admin)
│       ├── records/           # Financial record CRUD
│       └── dashboard/         # Analytics & aggregations
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 (running locally or via Docker)
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd finance-dashboard-backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/finance_dashboard` |
| `JWT_SECRET` | Secret key for signing JWTs | `super-secret-jwt-key-change-in-production` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

> ⚠️ **Important:** Change `JWT_SECRET` to a strong, unique value in production.

### Database Setup

```bash
# Create the database and run migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run seed
```

The seed script creates:

| User | Email | Password | Role |
|---|---|---|---|
| System Admin | `admin@finance.com` | `admin123` | ADMIN |
| Demo Analyst | `analyst@finance.com` | `analyst123` | ANALYST |
| Demo Viewer | `viewer@finance.com` | `viewer123` | VIEWER |

Plus **12 sample financial records** (income & expenses across multiple categories).

### Running the Server

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build
npm start
```

The server starts at `http://localhost:3000`. Verify with:

```bash
curl http://localhost:3000/api/health
```

---

## API Documentation

**Base URL:** `http://localhost:3000/api`

All authenticated endpoints require the header:
```
Authorization: Bearer <token>
```

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "meta": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

### Authentication

#### `POST /api/auth/signup`

Register a new user account. New users default to the `VIEWER` role.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Validation:**
- `email` — must be a valid email
- `password` — 6–100 characters
- `name` — 2–100 characters

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "VIEWER",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### `POST /api/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "admin@finance.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@finance.com",
      "name": "System Admin",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Users (Admin Only)

> 🔒 All user management endpoints require **ADMIN** role.

#### `GET /api/users`

List all users with filtering and pagination.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `role` | string | Filter by role: `VIEWER`, `ANALYST`, `ADMIN` |
| `isActive` | string | Filter by status: `true` or `false` |
| `search` | string | Search by name or email |

**Example:**
```
GET /api/users?page=1&limit=5&role=ANALYST&search=demo
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "email": "analyst@finance.com",
      "name": "Demo Analyst",
      "role": "ANALYST",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### `GET /api/users/:id`

Get a specific user by ID. Includes a count of their financial records.

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "admin@finance.com",
    "name": "System Admin",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "...",
    "_count": { "records": 12 }
  }
}
```

---

#### `PATCH /api/users/:id`

Update a user's name, role, or active status.

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "role": "ANALYST",
  "isActive": false
}
```

**Response (200):** Updated user object.

---

#### `DELETE /api/users/:id`

Soft-delete a user (sets `deletedAt` and `isActive = false`).

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Financial Records

> 🔒 **Read** endpoints require authentication (any role).
> 🔒 **Write** endpoints (create, update, delete) require **ADMIN** role.
> Non-admin users can only see their own records.

#### `POST /api/records`

Create a new financial record. *Admin only.*

**Request Body:**
```json
{
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-03-15",
  "notes": "March salary"
}
```

**Validation:**
- `amount` — positive number
- `type` — `INCOME` or `EXPENSE`
- `category` — 1–50 characters
- `date` — valid date string (ISO format)
- `notes` — optional, max 500 characters

**Response (201):** Created record object.

---

#### `GET /api/records`

List records with filtering, pagination, and sorting.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `type` | string | Filter: `INCOME` or `EXPENSE` |
| `category` | string | Filter by category (case-insensitive partial match) |
| `startDate` | string | Filter records on or after this date |
| `endDate` | string | Filter records on or before this date |
| `search` | string | Search in category and notes |
| `sortBy` | string | Sort field: `date`, `amount`, or `createdAt` (default: `date`) |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) |

**Example:**
```
GET /api/records?type=EXPENSE&category=Rent&startDate=2026-01-01&endDate=2026-03-31&sortBy=amount&sortOrder=desc
```

**Response (200):**
```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "amount": "1500.00",
      "type": "EXPENSE",
      "category": "Rent",
      "date": "2026-03-01T00:00:00.000Z",
      "notes": "Monthly rent",
      "userId": "uuid",
      "createdAt": "...",
      "updatedAt": "...",
      "deletedAt": null,
      "user": {
        "id": "uuid",
        "name": "System Admin",
        "email": "admin@finance.com"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

#### `GET /api/records/:id`

Get a single record by ID. Non-admin users can only access their own records.

---

#### `PATCH /api/records/:id`

Update a record. *Admin only.* Only the record owner can update.

**Request Body (all fields optional):**
```json
{
  "amount": 1600.00,
  "category": "Housing",
  "notes": "Updated rent amount"
}
```

**Response (200):** Updated record object.

---

#### `DELETE /api/records/:id`

Soft-delete a record. *Admin only.*

**Response (200):**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

### Dashboard Analytics

> 🔒 **Summary** — accessible by all authenticated roles.
> 🔒 **All other endpoints** — require **ANALYST** or **ADMIN** role.
> Admins see all data; other roles see only their own.

#### `GET /api/dashboard/summary`

Get overall financial summary.

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard summary retrieved",
  "data": {
    "totalIncome": 18200,
    "totalExpenses": 4500,
    "netBalance": 13700,
    "totalIncomeCount": 5,
    "totalExpenseCount": 7
  }
}
```

---

#### `GET /api/dashboard/category-totals`

Get totals grouped by category and type.

**Response (200):**
```json
{
  "success": true,
  "message": "Category totals retrieved",
  "data": [
    { "category": "Salary", "type": "INCOME", "total": 15000, "count": 3 },
    { "category": "Rent", "type": "EXPENSE", "total": 3000, "count": 2 },
    { "category": "Freelance", "type": "INCOME", "total": 1200, "count": 1 }
  ]
}
```

---

#### `GET /api/dashboard/recent`

Get most recent transactions.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | number | Number of records to return (default: 10) |

**Response (200):** Array of recent record objects with user info.

---

#### `GET /api/dashboard/trends`

Get monthly income vs expense trends.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `months` | number | Number of months to look back (default: 12) |

**Response (200):**
```json
{
  "success": true,
  "message": "Monthly trends retrieved",
  "data": [
    { "month": 1, "year": 2026, "type": "INCOME", "total": 6200, "count": 2 },
    { "month": 1, "year": 2026, "type": "EXPENSE", "total": 1950, "count": 3 },
    { "month": 2, "year": 2026, "type": "INCOME", "total": 7000, "count": 2 },
    { "month": 2, "year": 2026, "type": "EXPENSE", "total": 1000, "count": 2 }
  ]
}
```

---

## Role-Based Access Control (RBAC)

| Endpoint | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| Auth (signup/login) | ✅ | ✅ | ✅ |
| GET /records | ✅ (own) | ✅ (own) | ✅ (all) |
| POST/PATCH/DELETE /records | ❌ | ❌ | ✅ |
| GET /users | ❌ | ❌ | ✅ |
| PATCH/DELETE /users | ❌ | ❌ | ✅ |
| GET /dashboard/summary | ✅ (own) | ✅ (own) | ✅ (all) |
| GET /dashboard/trends | ❌ | ✅ (own) | ✅ (all) |
| GET /dashboard/category-totals | ❌ | ✅ (own) | ✅ (all) |
| GET /dashboard/recent | ❌ | ✅ (own) | ✅ (all) |

---

## Error Handling

The API uses a centralized error handler that catches:

| Error Type | Status Code | Description |
|---|---|---|
| Validation errors (Zod) | 400 | Invalid request body/query/params |
| Authentication errors | 401 | Missing or invalid JWT token |
| Authorization errors | 403 | Insufficient role permissions |
| Not found | 404 | Resource does not exist |
| Duplicate entry (Prisma P2002) | 409 | Unique constraint violation |
| Rate limit exceeded | 429 | Too many requests (100 per 15 min) |
| Server errors | 500 | Unexpected internal errors |

---

## Design Decisions

1. **Soft Deletes** — Users and records use a `deletedAt` timestamp instead of permanent deletion. This preserves data integrity and enables recovery.

2. **Layered Architecture** — Each module follows the pattern: `routes → controller → service`. Controllers handle HTTP concerns, services contain business logic.

3. **Prisma 7 with Driver Adapter** — Uses `@prisma/adapter-pg` with a `pg.Pool` for connection management, following Prisma 7's mandatory driver adapter pattern.

4. **Express 5** — Uses the latest Express with native promise support and improved routing.

5. **Zod 4 Validation** — Request bodies, query params, and URL params are validated through a reusable middleware using Zod schemas.

6. **Scoped Data Access** — Non-admin users only see their own records and dashboard data. Admins see everything.

---

## Scripts Reference

```bash
npm run dev        # Start dev server with hot-reload
npm run build      # Compile TypeScript to dist/
npm start          # Run production build
npm run migrate    # Run Prisma migrations
npm run seed       # Seed database with sample data
npm run generate   # Regenerate Prisma client
```

---

## License

ISC
