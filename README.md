# DasaAI

Next.js App Router application with Supabase Auth, Supabase PostgreSQL/RLS, and AI roadmap/coach features.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

Client-safe variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Server-only variables:

```env
FOUNDRY_ENDPOINT=https://your-foundry-resource.openai.azure.com
FOUNDRY_API_KEY=your-server-only-key
FOUNDRY_DEPLOYMENT=your-deployment-name
FOUNDRY_TIMEOUT_MS=30000
```

Do not expose Foundry secrets with `NEXT_PUBLIC_`.

## Supabase Migrations

Apply migrations in order:

1. `supabase/migrations/001_auth_schema.sql`
2. `supabase/migrations/002_ai_features.sql`
3. `supabase/migrations/003_auth_ai_hardening.sql`
4. `supabase/migrations/004_harden_user_profiles_rls.sql`
5. `supabase/migrations/005_api_rate_limits.sql`

Recommended CLI flow:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

SQL Editor alternative:

1. Open Supabase Dashboard > SQL Editor.
2. Run each migration file in numeric order.
3. Stop if any migration fails and fix before continuing.

Verify after applying:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'user_profiles';

select indexname
from pg_indexes
where schemaname = 'public' and tablename = 'ai_chat_history';

select proname
from pg_proc
where proname = 'check_api_rate_limit';
```

Take a database backup before applying migrations in production.

## Google OAuth Checklist

Supabase Dashboard:

- Authentication > Providers > Google: enable provider.
- Add Google Client ID and Client Secret.
- Authentication > URL Configuration > Site URL:
  - Local: `http://localhost:3000`
  - Staging: `https://your-staging-domain.com`
  - Production: `https://your-production-domain.com`
- Authentication > URL Configuration > Redirect URLs:
  - `http://localhost:3000/auth/confirm`
  - `https://your-staging-domain.com/auth/confirm`
  - `https://your-production-domain.com/auth/confirm`

Google Cloud Console:

- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://your-staging-domain.com`
  - `https://your-production-domain.com`
- Authorized redirect URI:
  - `https://your-project-ref.supabase.co/auth/v1/callback`

Manual tests:

- New Google user can sign in and reaches `/profile`.
- Existing Google user can sign in and remains logged in after refresh.
- Protected-route login preserves `next` and returns to the original page.
- OAuth cancellation redirects safely to login/error UI.

## Rate Limiting

AI endpoints use Supabase-backed distributed rate limiting through `public.check_api_rate_limit`.

Protected routes:

- `/api/ai/chat`: 20 requests per 60 seconds per user/IP.
- `/api/ai/analysis`: 6 requests per 60 seconds per user/IP.

If the RPC is unavailable in local development, the app falls back to in-memory rate limiting and logs a server-side warning. Production should apply `005_api_rate_limits.sql`.

Responses over the limit return `429` with:

- `Retry-After`
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`

## Supabase Types

Generate database types after schema changes:

```bash
npx supabase gen types typescript --project-id your-project-ref --schema public > src/types/supabase.ts
```

Regenerate after every migration that changes tables, views, functions, or enums.

## CI

The GitHub Actions workflow runs:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Configure repository secrets or environment variables in GitHub for real deployments. The CI build uses safe placeholder public Supabase variables and server-only dummy Foundry values.
