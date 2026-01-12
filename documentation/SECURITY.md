# Security Details & Protocols

BrainBytes implements comprehensive security measures to protect user data and API endpoints.

## Key Security Features
- **Authentication**: Auth0-based user authentication with JWT tokens.
- **Middleware Protection**: Edge-level authentication for protected routes via Next.js middleware.
- **API Security**: All sensitive endpoints require authentication and authorization.
- **Webhook Verification**: External webhooks (Stripe/Pusher) verified with signatures.
- **Rate Limiting**: Per-user rate limiting on API endpoints to prevent abuse.

## Automated Security Scanning
Our GitHub Actions CI/CD pipeline includes:
- **Dependency Audit**: Vulnerability scanning using `pnpm audit`.
- **SAST**: Static Application Security Testing with **CodeQL**.
- **Container Security**: Filesystem vulnerability scanning with **Trivy**.



## Security Checklist for Contributors
All API endpoints must follow these patterns:
- User-facing APIs must use `requireUser()` for session validation.
- Webhooks must verify service-specific signatures.
- Sensitive data must never be logged to the console.
- Input validation must be handled via Drizzle/Zod schemas.

---
[⬅️ Back to README](../README.md)
