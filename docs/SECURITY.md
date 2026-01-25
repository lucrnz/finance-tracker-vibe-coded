# Security and Compliance

Secrets handling, environment variables, and authentication-related security practices.

## Secrets handling

- `JWT_SECRET` is required in production and must be kept secret.
- `DATABASE_URL` defaults to `file:./dev.db` for local development.
- Never commit `.env*` files to version control.

## Authentication security

- Passwords are hashed with bcrypt (12 salt rounds).
- JWT tokens expire after 7 days.
- User-scoped data access is enforced at the service layer.
- The frontend stores the JWT in localStorage; avoid storing other sensitive data there.
