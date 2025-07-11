# Node.js + TypeScript Boilerplate

A production-ready Node.js boilerplate using TypeScript, Express, Prisma, Passport (local & social login), Nodemailer (Mailgun, SendGrid, AWS SES), AWS S3, Winston logger with Logtail integration, and Swagger docs (with authentication).

## Features

- TypeScript-first Express app
- Secure environment variable management
- Prisma ORM with PostgreSQL
- Passport.js authentication (local, Google, Facebook)
- Email sending via SMTP (Mailgun, SendGrid, AWS SES)
- AWS S3 file uploads (SDK v3)
- Advanced logging with Winston + Logtail (Better Stack)
- Global error handling with structured responses
- Security best practices (Helmet, CORS, rate limiting, input validation)
- Swagger API docs (protected by login)
- Hot reloading with Nodemon

## Getting Started

### 1. Clone and Install

```bash
git clone <repo-url>
cd node-ts-boilerplate
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your secrets:

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret

# Email Configuration
EMAIL_FROM=your@email.com
EMAIL_SERVICE_PROVIDER=MAILGUN # or SENDGRID or SES
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Swagger Documentation
SWAGGER_USER=devuser
SWAGGER_PASS=devpass

# Logging Configuration
LOG_LEVEL=info # error, warn, info, http, verbose, debug, silly
LOGTAIL_SOURCE_TOKEN=src_your_logtail_token # Optional: for cloud logging
LOGTAIL_INGESTING_HOST=https://your-region.betterstackdata.com # Optional: custom endpoint
```

### 3. Database Setup & Prisma Scripts

- **Generate Prisma Client:**
  ```bash
  npm run generate
  ```
- **Apply Migrations (Development):**
  ```bash
  npm run migrate
  ```
- **Deploy Migrations (Production):**
  ```bash
  npm run dbdeploy
  ```

> **Note:** Use a new migration name for each schema change. Only use `--name init` for the first migration.

### 4. Run the App

#### Development

```bash
npm run dev
```

#### Production

```bash
npm run build
npm start
```

## API Endpoints

- `POST /auth/register` — Register new user
- `POST /auth/login` — Local login
- `POST /auth/logout` — Logout
- `GET /auth/google` — Google login
- `GET /auth/facebook` — Facebook login
- `POST /email` — Send email (requires authentication)
- `POST /file` — Upload file to S3 (requires authentication, multipart/form-data)
- `GET /docs` — Swagger API docs (requires developer basic auth)

## Security

- All sensitive config is loaded and validated from `.env` at startup
- Helmet, CORS, rate limiting, and input validation enabled by default
- Swagger docs are protected by HTTP Basic Auth (set `SWAGGER_USER` and `SWAGGER_PASS`)
- Session-based authentication with secure cookie settings

## Logging

### Local Logging

- **Winston logger** with structured JSON and readable console output
- **Daily log rotation** with date-based filenames
- **Separate error logs** retained for 90 days
- **All logs** retained for 30 days
- **Configurable log levels** via `LOG_LEVEL` environment variable

### Cloud Logging (Optional)

- **Logtail (Better Stack)** integration for error monitoring
- **Error-only logging** to cloud (all logs still stored locally)
- **Real-time error tracking** with rich context (userId, IP, method, URL, etc.)
- **Custom endpoint support** for different regions/sources

### Log Files Structure

```
logs/
├── 2025-07-11-all.log     # All logs for today
├── 2025-07-11-error.log   # Only errors for today
├── 2025-07-10-all.log     # Yesterday's logs
├── 2025-07-10-error.log   # Yesterday's errors
└── ...
```

### Log Levels

- `error` - Only errors (production critical)
- `warn` - Warnings and errors (high-volume environments)
- `info` - Info, warnings, and errors (recommended for production)
- `debug` - Debug, info, warnings, and errors (development)

## Error Handling

- **Global error handler** with structured responses
- **Rich error context** including userId, IP address, method, URL, and user agent
- **User-friendly error messages** for common scenarios
- **Development details** when `NODE_ENV=development`
- **Consistent API responses** with `{ success: boolean, data/error: object }` format

## Folder Structure

```
src/
  auth/         # Passport strategies
  config/       # Env/secret management
  controllers/  # Route controllers
  docs/         # Swagger setup
  logging/      # Winston logger with Logtail integration
  middleware/   # Custom middleware (response handler, error handler)
  models/       # (Optional) Custom models
  routes/       # All routes (index.ts centralizes)
  services/     # Email, S3, etc.
  types/        # Custom TypeScript types
  utils/        # Utility functions
  app.ts        # Express app setup
  server.ts     # App entry point
logs/           # Daily rotated log files
```

## Third-Party Integrations

### Logtail (Better Stack) Setup

1. Create a free account at [Better Stack](https://betterstack.com/logs/)
2. Create a new **source** in Logtail
3. Copy the **Source token**
4. Add to your `.env`:
   ```
   LOGTAIL_SOURCE_TOKEN=src_your_token_here
   LOGTAIL_INGESTING_HOST=https://your-region.betterstackdata.com
   ```

### AWS S3 Setup

- Uses AWS SDK v3 for modern performance
- Supports public-read ACL for uploaded files
- Automatic file naming with UUID for security

### Email Providers

- **Mailgun**: SMTP configuration
- **SendGrid**: Service-based configuration
- **AWS SES**: AWS SDK integration

## License

MIT
