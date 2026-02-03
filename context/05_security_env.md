# 05_Security_Env.md

## Overview
Defines the security posture and environment configuration for the production Cloudflare deployment.

## Environment Variables (`.dev.vars` / Dashboard)

| Variable | Description | Security Level |
| :--- | :--- | :--- |
| `GOOGLE_AI_KEY` | API Key for Gemini Models | **Critical** (Secret) |
| `PARALLEL_API_KEY` | API Key for Search/Tools | **Critical** (Secret) |
| `APP_ENV` | `production` / `development` | Info |
| `Rate_Limit_SECRET` | Secret for signing rate limit tokens (future) | High |

## Security Measures

### 1. Input Validation (Zod)
*   All API endpoints wrap logic in a `try/catch` block with Zod parsing.
*   Invalid JSON bodies are rejected immediately with `400 Bad Request`.
*   Sanitization: String inputs are trimmed and stripped of HTML control characters before LLM injection.

### 2. Output Sanitization
*   LLM outputs are parsed as JSON. If the LLM returns Markdown, it is rendered using a safe renderer (e.g., `react-markdown` with strict plugins) to prevent XSS.

### 3. Rate Limiting (Cloudflare WAF)
*   **Zone Level**: Limit `POST /api/*` to 50 requests per IP per 10 minutes.
*   **Function Level**: Simple in-memory counter backup (if needed, though Cloudflare WAF is preferred).

### 4. CORS
*   Strict CORS policy in `functions/_middleware.ts`.
*   Allowed Origins: `https://wondura.pages.dev`, `http://localhost:5173`.
*   Methods: `POST`, `OPTIONS`.

## Secrets Management
*   **Local**: Use `.dev.vars` (Gitignored).
*   **CI/CD**: Set via Cloudflare Dashboard or `wrangler secret put`.
*   **Never** commit API keys to repo.
