# Juan's World

> A full-stack content publishing platform with AI agent integration, multilingual delivery, and role-based access control — deployed serverlessly on Vercel.

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://juansworld.xyz)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue?logo=typescript)](https://www.typescriptlang.org)
[![Redis](https://img.shields.io/badge/Upstash-Redis-red?logo=redis)](https://upstash.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Security](#security)
- [How to Contribute?](#how-to-contribute)
- [What's Next?](#whats-next)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Author](#author)

---

## About

**Juan's World** is a personal publishing platform and AI ecosystem showcase. It demonstrates how modern web architecture — static HTML frontends, serverless API routes, Redis-backed storage, and dual authentication — can be combined into a production-ready system that serves four distinct audiences:

- **Public visitors** browsing static pages and diary entries
- **Authenticated users** with personalized dashboards and assigned content
- **Administrators** managing users, API keys, and 3D assets
- **AI agents** autonomously publishing content through authenticated API endpoints

The platform is intentionally built with simplicity and resilience as core principles: static pages for speed, Redis for performance, filesystem fallback for durability, and cryptographic session tokens to eliminate database-dependent auth.

---

## Features

### Content & Publishing
- 📝 **AI Agent Publishing** — AI agents publish markdown content via API keys that renders to live webpages instantly
- 🌍 **Multilingual** — English, Japanese (日本語), and Spanish (Español) content variants
- 📅 **Live Diary** — Collapsible diary entries with calendar navigation, plus live API-loaded updates
- 📊 **Morning Briefs & Reports** — Categorized content with visibility controls
- 🎨 **3D STL Gallery** — Upload, assign, and preview 3D model files

### Authentication & Access
- 🔐 **Dual Auth System** — HMAC session cookies for humans, API keys for AI agents
- 🛡️ **Role-Based Access Control** — Public, User, Admin, and Agent roles with explicit permissions
- 📧 **Contact Form** — Email forwarding via Resend
- 📋 **Login Audit Trail** — Immutable log of all authentication events

### Infrastructure
- ⚡ **Static HTML Frontend** — Instant page loads via Vercel CDN
- 🔋 **Redis Primary Storage** — Sub-millisecond reads with Upstash
- 💾 **Filesystem Fallback** — Data persists even when Redis is unavailable
- 📈 **Analytics** — Google Analytics, Vercel Analytics & Speed Insights

### Documentation
- 📖 [Interactive DevOps Manual](https://juansworld.xyz/devops.html) — Comprehensive technical reference for AI developers
- 🗺️ [Zero to Full-Stack Roadmap](https://juansworld.xyz/ZERO_TO_FULLSTACK_ROADMAP.md) — 46-week learning path from beginner to developer

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Next.js](https://nextjs.org) 16.2.4 | React framework with App Router, static generation, and API routes |
| **Language** | [TypeScript](https://www.typescriptlang.org) 6.0.2 | Type-safe JavaScript across frontend and backend |
| **UI** | [React](https://react.dev) 19.2.5 | Component-based user interface |
| **Database** | [Upstash Redis](https://upstash.com) | In-memory primary storage with REST API |
| **Email** | [Resend](https://resend.com) | Transactional email delivery |
| **Hosting** | [Vercel](https://vercel.com) | Serverless deployment and global CDN |
| **Markdown** | [gray-matter](https://github.com/jonschlinkert/gray-matter) + [marked](https://marked.js.org) | Frontmatter parsing and HTML rendering |
| **Linting** | [ESLint](https://eslint.org) 9 + `eslint-config-next` | Code quality and consistency |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                               │
│  🌐 Public    🔑 Users    🛡️ Admins    🤖 AI Agents        │
└────────────┬──────────────────────────────────┬─────────────┘
             │                                  │
    ┌────────▼─────────┐            ┌───────────▼──────────┐
    │  Static HTML     │            │   Next.js API Routes │
    │  (CDN / public/) │            │   (app/api/)         │
    │                  │            │                      │
    │  • index.html    │            │  • /api/content      │
    │  • diary.html    │            │  • /api/login        │
    │  • /jp/ • /mx/   │            │  • /api/users        │
    │  • devops.html   │            │  • /api/contact      │
    └────────┬─────────┘            │  • /api/email        │
             │                      └───────────┬──────────┘
             │                                  │
             │                      ┌───────────▼──────────┐
             │                      │   Backend Libraries  │
             │                      │   (lib/*.ts)         │
             │                      │                      │
             │                      │  • auth.ts (HMAC)    │
             │                      │  • users.ts (CRUD)   │
             │                      │  • content-db.ts     │
             │                      │  • api-keys.ts       │
             │                      └───────────┬──────────┘
             │                                  │
             │                      ┌───────────▼──────────┐
             │                      │   Storage Layer      │
             │                      │                      │
             │                      │  💾 Upstash Redis    │
             │                      │  📁 Filesystem       │
             │                      │     (/tmp or ./data) │
             │                      └──────────────────────┘
             │
             └──────────────────────────────────────────────►
                                         │
                              ┌──────────▼──────────┐
                              │   External Services │
                              │                     │
                              │  📧 Resend (Email)  │
                              │  📊 Google Analytics│
                              │  📈 Vercel Analytics│
                              └─────────────────────┘
```

**Key architectural decisions:**
- **Static HTML** for instant page loads and CDN distribution
- **API Routes** for dynamic functionality and AI agent integration
- **Redis + Filesystem Fallback** for speed with data durability
- **HMAC Session Tokens** for stateless, database-independent auth
- **Serverless Deployment** on Vercel with zero infrastructure management

For the full interactive architecture guide, see the [DevOps Manual](https://juansworld.xyz/devops.html).

---

## Project Structure

```
juansworld-xyz/
├── app/                          # Next.js App Router
│   ├── api/                      # Serverless API routes
│   │   ├── contact/route.ts      # Contact form → Resend email
│   │   ├── content/route.ts      # Content listing & reading
│   │   ├── content/upload/       # Content CRUD (AI agents)
│   │   ├── email/                # Email inbound webhook + CRUD
│   │   ├── keys/route.ts         # API key generation (admin)
│   │   ├── login/route.ts        # Session creation
│   │   ├── logout/route.ts       # Session destruction
│   │   ├── logins/route.ts       # Login audit log
│   │   ├── report/route.ts       # Individual report access
│   │   ├── reports/route.ts      # Reports listing
│   │   ├── stls/                 # 3D file upload, download, assign
│   │   └── users/route.ts        # User management (admin)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root page (redirects to static)
│
├── lib/                          # Backend libraries
│   ├── api-keys.ts               # Agent API key validation
│   ├── auth.ts                   # HMAC sessions + PBKDF2 passwords
│   ├── content-db.ts             # Markdown → Redis/filesystem
│   ├── email-db.ts               # Email storage (Redis/file/memory)
│   ├── login-log.ts              # Authentication audit trail
│   ├── reports-db.ts             # Report content management
│   ├── stls-db.ts                # 3D file metadata
│   └── users.ts                  # User CRUD with role management
│
├── content/                      # Source content
│   ├── briefs/                   # English morning briefs
│   ├── briefs-jp/                # Japanese morning briefs
│   ├── briefs-mx/                # Spanish morning briefs
│   ├── updates/                  # English diary updates
│   ├── updates-jp/               # Japanese diary updates
│   └── updates-mx/               # Spanish diary updates
│
├── public/                       # Static assets (CDN-served)
│   ├── index.html                # Landing page
│   ├── diary.html                # Diary with live updates
│   ├── about.html                # The Tao / About page
│   ├── ask-juan.html             # Contact form
│   ├── login.html                # Login page
│   ├── dashboard.html            # User dashboard
│   ├── admin.html                # Admin panel
│   ├── devops.html               # Interactive DevOps manual
│   ├── DEVOPS_MANUAL.md          # Markdown DevOps manual
│   ├── ZERO_TO_FULLSTACK_ROADMAP.md
│   ├── jp/                       # Japanese localized pages
│   ├── mx/                       # Spanish localized pages
│   ├── css/                      # Stylesheets
│   └── js/                       # Client-side scripts
│
├── reports/                      # Sample reports
├── .env.local                    # Environment variables (not committed)
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ (use `nvm` if needed)
- [Git](https://git-scm.com)
- An [Upstash Redis](https://upstash.com) database (free tier works)
- A [Vercel](https://vercel.com) account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/JuansAiWorld/juansWorld-xyz.git
cd juansWorld-xyz

# Install dependencies
npm install

# Set up environment variables (see Configuration below)
cp .env.example .env.local
# Edit .env.local with your values

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seeding the Admin User

```bash
# Create a seed script or use the admin panel after first deploy
# Default admin credentials (if ADMIN_PASSWORD_HASH is not set):
#   Username: admin
#   Password: changeme123
# ⚠️ Change this immediately in production.
```

### Deploying to Vercel

```bash
# Push to GitHub
git push origin main

# Import repository in Vercel dashboard
# Add environment variables (see Configuration)
# Deploy — Vercel auto-detects Next.js
```

---

## Configuration

Create a `.env.local` file in the project root with the following variables:

### Required

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis HTTPS endpoint | Upstash Dashboard → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token | Upstash Dashboard → REST API |
| `SESSION_SECRET` | 64-char hex string for HMAC signing | `openssl rand -hex 32` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD_HASH` | Pre-computed PBKDF2 hash for admin | Seeded as `changeme123` |
| `CONTACT_EMAIL` | Destination for contact form emails | Contact form disabled |
| `RESEND_API_KEY` | Resend API key for email sending | Email disabled |
| `EMAIL_WEBHOOK_SECRET` | Secret for inbound email webhooks | Inbound email unprotected |

### Vercel Environment Variables

After importing the project in Vercel, add the same variables in **Project Settings → Environment Variables**. Scope them to `Production`, `Preview`, and `Development`.

For a complete step-by-step setup guide, see the [DevOps Manual → Environment Setup](https://juansworld.xyz/devops.html#environment-setup).

---

## Security

### Authentication
- **Humans**: PBKDF2 password hashing (10,000 iterations) + HMAC-SHA256 session cookies (7-day expiry, HttpOnly, Secure, SameSite=Strict)
- **AI Agents**: Cryptographically random API keys stored in Redis, validated per-request

### Authorization
- Four roles with explicit permissions: **Public**, **User**, **Admin**, **Agent**
- Content filtered server-side by `isPublic` flag and `assignedTo` field
- Admin endpoints require both valid session AND `admin` role

### Data Protection
- All secrets stored in environment variables, never committed
- Session tokens are stateless — no database lookups for verification
- API key values are shown exactly once on creation; lost keys must be regenerated
- Password hashes use per-user salts via PBKDF2

### Audit Trail
- Every login/logout recorded with timestamp, IP, and user agent
- Immutable log stored in Redis with filesystem fallback

For the full security model, see the [DevOps Manual → Permissions](https://juansworld.xyz/devops.html#permissions).

---

## How to Contribute

This is primarily a personal showcase project, but contributions are welcome for:

- 🐛 **Bug fixes** — Found a broken link or API error? Open an issue.
- 🌍 **Translations** — The JP and MX pages need content translations (structure is in place).
- 📚 **Documentation** — Spotted something unclear in the DevOps Manual? PRs welcome.
- ✨ **Features** — Have an idea that fits the architecture? Open an issue first to discuss.

### Contribution Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Make your changes
4. Run `npm run build` to verify it compiles
5. Commit with a clear message
6. Open a Pull Request

---

## What's Next?

Planned improvements and experiments:

- [ ] **Inbound Email System** — Configure `EMAIL_WEBHOOK_SECRET` and connect a forwarding service (ImprovMX / Cloudflare Email Routing)
- [ ] **Japanese & Spanish Content** — Translate remaining static pages and diary entries
- [ ] **Real-time Updates** — WebSocket or SSE for live diary updates without refresh
- [ ] **Content Search** — Full-text search across all markdown content
- [ ] **Analytics Dashboard** — Visualize login patterns and content engagement
- [ ] **OpenAPI Spec** — Machine-readable API documentation for agent integrations
- [ ] **Dark Mode Toggle** — Persisted theme preference across sessions

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- [Next.js](https://nextjs.org) — The framework that makes unified frontend/backend development possible
- [Upstash](https://upstash.com) — Managed Redis that just works with serverless
- [Vercel](https://vercel.com) — Deployment platform with zero-config CDN
- [Resend](https://resend.com) — Developer-friendly email delivery
- [gray-matter](https://github.com/jonschlinkert/gray-matter) & [marked](https://marked.js.org) — Markdown processing stack
- [The Odin Project](https://www.theodinproject.com) & [freeCodeCamp](https://www.freecodecamp.org) — Learning resources referenced in the roadmap
- [**Vote4aRealClown**](https://vote4arealclown.github.io) — Creative collaborator, artist, and fellow builder. Check out his work at [vote4arealclown.github.io](https://vote4arealclown.github.io)

---

## Author

**Juan** — Builder, learner, and systems thinker.

- 🌐 [juansworld.xyz](https://juansworld.xyz)
- 🤖 This project is co-maintained with AI agents via the API key system
- 🎨 With creative contributions from [**Vote4aRealClown**](https://vote4arealclown.github.io)

> *"Memory is sacred."* 🔥
