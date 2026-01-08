# Finance Tracker

A full-stack personal finance tracker application built with a monorepo structure.

## Project Structure

```
finance-tracker/
├── packages/
│   ├── backend/     # Node.js + Express + TypeScript API
│   └── frontend/    # (Coming soon)
├── package.json     # Root workspace configuration
└── README.md
```

## Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT with bcrypt password hashing
- **Validation:** Zod schemas

## Getting Started

### Prerequisites
- Node.js 18+
- npm 7+ (for workspaces support)

### Installation

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run backend -- npm run db:generate

# Create/sync database
npm run backend -- npm run db:push
```

### Running the Backend

```bash
# Development mode with hot reload
npm run backend

# Build for production
npm run backend:build

# Run production build
npm run backend:start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in and get JWT token

### Categories (Public)
- `GET /api/categories` - Get all available categories

### Transactions (Protected - requires JWT)
- `GET /api/transactions` - List all transactions (with pagination & filtering)
- `GET /api/transactions/summary` - Get income/expense summary
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create new transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

## API Examples

### Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Transaction (with JWT)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 50.00,
    "description": "Grocery shopping",
    "category": "Food",
    "type": "expense",
    "date": "2024-01-15"
  }'
```

### Get Transactions with Filtering
```bash
curl "http://localhost:3000/api/transactions?type=expense&category=Food&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Categories

### Expense Categories
- Food
- Transport
- Entertainment
- Utilities
- Rent/Mortgage
- Healthcare
- Shopping
- Other

### Income Categories
- Salary
- Freelance
- Other

## Environment Variables

Create a `.env` file in `packages/backend/`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
```

## License

MIT
