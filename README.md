# VibeSafe 🛡️

**Security scanning for vibe-coded apps.** Paste a GitHub URL or live URL and get a full vulnerability report in minutes — no CLI, no setup, no jargon.

![VibeSafe](https://img.shields.io/badge/status-beta-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

## What is VibeSafe?

VibeSafe scans apps built with AI coding tools (Lovable, Bolt, Cursor, v0) for real security vulnerabilities that these tools commonly introduce:

- 🔑 **Secrets & API keys** hardcoded in source code
- 🔓 **Missing authentication** on API routes
- 💉 **SQL injection** via string concatenation
- ⚡ **XSS** via `dangerouslySetInnerHTML`
- 🗄️ **Supabase RLS** misconfigurations
- 🌐 **Exposed files** (`.env`, `.git/config`, `phpinfo.php` etc.)
- 🔒 **Security headers** (CSP, HSTS, X-Frame-Options)
- 🍪 **Cookie flags** (HttpOnly, Secure, SameSite)
- 🤖 **AI-powered fix suggestions** for every finding

## Stack

- **Frontend:** React + TanStack Router + Tailwind CSS
- **Auth:** Clerk
- **API:** Node.js + Express + TypeScript *(private)*
- **Queue:** BullMQ + Redis *(private)*
- **Database:** MongoDB Atlas *(private)*
- **AI:** Azure OpenAI *(private)*

## Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account for auth

### Installation

```bash
git clone https://github.com/kunalraha-ai/vibesafe
cd vibesafe
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL of the VibeSafe API (see below) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
| `VITE_API_SECRET` | Shared secret between frontend and API |

### Running locally

```bash
npm run dev
```

The app runs on `http://localhost:8081` by default.

## Self-hosting the API

The scan engine (static analysis, AI triage, secrets detection, IDOR testing) is **closed source** and runs as a separate service. To use VibeSafe:

1. Use the hosted API at `https://api.vibesafe.dev` *(coming soon)*
2. Or contact us to discuss self-hosting options

## Scan modes

| Mode | What it does |
|------|-------------|
| **GitHub repo** | Clones repo, runs static analysis, AI triage, secrets detection |
| **Live URL** | Probes for exposed files, security headers, CORS, cookies |
| **Both** | Full scan + IDOR dynamic testing against your deployed app |

## Contributing

Contributions to the frontend are welcome! Please open an issue before submitting a PR.

## License

MIT — see [LICENSE](LICENSE)

---

Built by [@kunalraha-ai](https://github.com/kunalraha-ai)
