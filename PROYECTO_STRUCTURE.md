# DasaAI — Project Structure

```
dasaai/
├── .github/workflows/          # CI/CD pipeline
│   └── ci.yml
│
├── public/                     # Static assets
│   ├── docs/                   # Evidence screenshots
│   └── img/                    # Logo
│       └── logo-DasaAI.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── globals.css         # Tailwind v4, glassmorphism theme
│   │   ├── page.tsx            # Landing (public) / Dashboard (auth)
│   │   ├── error.tsx           # Global error boundary
│   │   ├── not-found.tsx       # Custom 404 page
│   │   │
│   │   ├── login/page.tsx              # Login (server guard)
│   │   ├── register/page.tsx           # Register (server guard)
│   │   ├── forgot-password/page.tsx    # Password recovery
│   │   ├── reset-password/page.tsx     # Password reset
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx                # Server guard + user provider
│   │   │   └── profile-client.tsx      # Form (4 fields + optional)
│   │   │
│   │   ├── roadmap/
│   │   │   ├── page.tsx                # Server guard
│   │   │   └── roadmap-client.tsx      # Real data from career_roadmaps
│   │   │
│   │   ├── coach/
│   │   │   ├── page.tsx                # Server guard
│   │   │   └── coach-client.tsx        # Chat with DeepSeek via /api/ai/chat
│   │   │
│   │   ├── auth/
│   │   │   ├── confirm/route.ts        # OAuth callback + email confirm
│   │   │   └── logout/route.ts         # Logout handler
│   │   │
│   │   └── api/ai/
│   │       ├── analysis/route.ts       # POST — Generate career roadmap
│   │       └── chat/route.ts           # POST — AI coach conversation
│   │
│   ├── components/
│   │   ├── site-shell.tsx              # ShellHeader, BottomNav, GlassCard, LanguageProvider
│   │   ├── layout-client.tsx           # Client wrapper (language + auth providers)
│   │   └── auth-state-listener.tsx     # Session change listener
│   │
│   ├── views/auth/
│   │   ├── login/login-view.tsx                # Email + Google OAuth form
│   │   ├── register/register-view.tsx          # Registration form
│   │   ├── forgot-password/forgot-password-view.tsx
│   │   └── reset-password/reset-password-view.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser client (@supabase/ssr)
│   │   │   ├── server.ts               # Server client (cookies)
│   │   │   ├── update-session.ts       # Middleware session refresh
│   │   │   └── types.ts                # Database type definitions
│   │   │
│   │   ├── ai/
│   │   │   ├── ai-client.ts            # callFoundry() → DeepSeek-V3.2 via Azure Foundry
│   │   │   └── prompts/
│   │   │       └── roadmap-prompt.ts   # System prompt builder for roadmap generation
│   │   │
│   │   ├── security/
│   │   │   ├── csrf.ts                 # CSRF protection
│   │   │   ├── rate-limit.ts           # API rate limiting
│   │   │   └── redirects.ts            # Safe redirect helpers
│   │   │
│   │   ├── api/api-fetch.ts            # Authenticated fetch wrapper
│   │   └── supabase.ts                 # Legacy client (single instance)
│   │
│   └── proxy.ts                        # Next.js middleware entry point
│
├── supabase/migrations/         # Database migrations
│   ├── 001_auth_schema.sql              # user_profiles, user_preferences, user_roles, audit_logs
│   ├── 002_ai_features.sql              # career_roadmaps, ai_chat_history
│   ├── 003_auth_ai_hardening.sql        # Security hardening
│   ├── 004_harden_user_profiles_rls.sql # RLS improvements
│   ├── 005_api_rate_limits.sql          # API rate limit functions
│   └── _deprecated_001_create_profiles.sql
│
├── tests/                       # Test suite
│   ├── api/api-fetch.test.ts
│   ├── db/migrations.test.ts
│   └── security/
│       ├── csrf.test.ts
│       ├── rate-limit.test.ts
│       └── redirects.test.ts
│
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── postcss.config.mjs          # PostCSS + Tailwind
├── eslint.config.mjs           # ESLint config
├── .gitignore                  # Git ignore rules
├── .env.local                  # Environment variables (gitignored)
└── README.md                   # Project README
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database | PostgreSQL via Supabase |
| AI | DeepSeek-V3.2 via Microsoft Azure AI Foundry |
| Deployment | Vercel |
| Testing | Vitest (planned) |
| CI/CD | GitHub Actions |

---

## Key Features

- **Landing page** — Public marketing page with features and how-it-works
- **Dashboard** — Personalized home with roadmap score and quick actions
- **Profile** — 4 required fields, optional links, saves to `user_profiles`
- **AI Roadmap** — DeepSeek generates 30/60/90 day career plan, stored in `career_roadmaps`
- **AI Coach** — Conversational chat with persistent memory (`ai_chat_history`)
- **Bilingual** — EN/ES language toggle, persisted in `user_preferences`
- **Mobile-first** — Bottom navigation on mobile, top navbar on desktop
- **RLS** — Row Level Security on all user tables
- **Rate limiting** — API protection against abuse

---

**Last updated**: 2026-06-15
