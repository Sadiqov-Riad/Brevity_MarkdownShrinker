# Security Policy

Brevity is a standalone, client-side application and API designed to sanitize Markdown documents by stripping visual noise. Since version 1.0, Brevity's core sanitization runs locally in your browser.

## Supported Versions

Security fixes are handled on the `main` branch until formal releases are cut.

## Deployment Guidance

Brevity can be run in two modes:
1. **Serverless Frontend (Default)**: Next.js frontend where processing happens via in-browser JavaScript.
2. **Backend API**: FastAPI Python backend for server-side processing.

When hosting the Brevity API or Frontend:
- Keep `AUTH_ENABLED=true` for any network-accessible deployment of the backend API.
- Use HTTPS when exposing the app beyond localhost.
- Put the authenticated Brevity web/API entrypoint behind a trusted reverse proxy or private access layer such as Cloudflare Access, Tailscale, or a VPN.
- Treat generated media, uploads, and data files as internal-only.
- Disable open signup unless you intentionally want new accounts (if integrating with an auth provider).
- Rotate API keys and webhook secrets if they appear in logs or screenshots.

## Publishing A Fork

Before pushing a public fork, ensure you do not commit any private keys or local `.env` files:

```bash
git status --short
git check-ignore -v .env data/auth.json
```

Only `.env.example`, `docs/`, `frontend/`, `backend/`, tests, and static assets should be committed. Never commit live `.env` values or private data.

## Reporting

Please report vulnerabilities privately via GitHub security advisories if available, or by opening a minimal issue that does not disclose exploit details.
