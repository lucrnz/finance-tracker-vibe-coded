# Finance Tracker

A personal finance management application that helps you take control of your money. Track your income and expenses, set budgets, and gain insights into your spending habits.

## Features

- **Transaction Tracking** — Record and categorize your income and expenses with ease
- **Budget Management** — Set monthly budgets for different spending categories and monitor your progress
- **Financial Reports** — Visualize your spending patterns with intuitive charts and summaries
- **Category Organization** — Organize transactions into meaningful categories (Food, Transport, Entertainment, Utilities, and more)
- **Secure Authentication** — Your financial data is protected with secure user accounts

## Getting Started

### Environment Variables

Create a `.env` file in `packages/backend/`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
```

### Running the Application

**Backend:**

```bash
# Install dependencies
npm install

# Setup database
npm run backend -- npm run db:generate
npm run backend -- npm run db:push

# Start development server
npm run backend
```

The API will be available at `http://localhost:3000`

**Frontend:**

```bash
# Start development server
npm run frontend
```

The app will be available at `http://localhost:5173`

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
