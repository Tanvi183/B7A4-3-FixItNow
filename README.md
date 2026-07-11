# FixItNow Backend API

FixItNow is a trusted home service platform backend API. It manages users, services, technicians, bookings, payments (via Stripe), and reviews. 

## Tech Stack
- **Node.js** & **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL (Neon DB)**
- **Zod** (Validation)
- **Stripe** (Payments)
- **JWT** (Authentication)

## Prerequisites
- Node.js (v20+)
- PostgreSQL (or Neon DB connection string)
- Stripe Account (for payment processing)

## Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgres://user:password@host:port/dbname?sslmode=require"
JWT_ACCESS_SECRET="your-access-secret"
JWT_ACCESS_EXPIRES_IN="1d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Installation and Setup

1. Install dependencies
```bash
npm install
```

2. Generate Prisma Client
```bash
npx prisma generate
```

3. Push DB Schema
```bash
npx prisma db push
```

4. Seed the Database
```bash
npm run prisma db seed
```

5. Run Development Server
```bash
npm run dev
```

## Available Scripts
- `npm run dev`: Start the server in development mode.
- `npm run build`: Build the project for production.
- `npm start`: Start the production server.
- `npm run stripe:webhook`: Listen to Stripe webhooks locally.

## API Documentation
A Postman collection is included in this repository: `FixItNow_API_Collection.json`.
You can import this file into Postman to explore and test the available endpoints.
