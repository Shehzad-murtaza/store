# SHEZY

SHEZY is a responsive Next.js 15 catalogue starter using TypeScript, Tailwind CSS, shadcn/ui-style components, Lucide React, and Supabase. The home page currently uses placeholder product and category cards; catalogue queries and CRUD are outside this phase.

## Supabase setup

1. Visit [supabase.com](https://supabase.com), sign in, and choose **New project**.
2. Select an organization, name the project **SHEZY**, create a strong database password, and select a region close to your customers. Keep the database password somewhere secure.
3. Once the project is ready, open **SQL Editor → New query**. Copy the full contents of [`supabase/schema.sql`](supabase/schema.sql) into the editor and choose **Run**. This creates the three catalogue tables, indexes, timestamp triggers, row level security policies, and the public `product-images` storage bucket.
4. In **Authentication → Sign In / Providers**, enable the Email provider with email/password sign-in.
5. In **Authentication settings**, turn off **Allow new users to sign up**. This prevents public account creation.
6. Open **Authentication → Users → Add user** and manually create the one administrator using the chosen email and a strong password. Confirm the account if the dashboard asks. Create no other users.
7. In **Project Settings → API** (or **API Keys**), copy the Project URL and the public/publishable key (or legacy `anon` key). Do not use the service-role key in the app.

The `/admin` route requires a valid Supabase Auth session. RLS allows catalog writes only to the `authenticated` role; with sign-ups disabled and one account created manually, that is the store administrator.

## Environment variables

Add the two values from the Supabase project settings to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-project-publishable-or-legacy-anon-key
```

The public key is intended for browser use and is protected by the database's RLS policies. Never add a service-role key to a `NEXT_PUBLIC_` variable.

For production, also set the canonical origin so sitemaps, canonical links and social previews point at the live domain:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Without it the app falls back to `VERCEL_URL` and then `http://localhost:3000`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The public catalogue is at `/`; the protected admin area is at `/admin` and its sign-in page is `/admin/login`.

Useful commands:

```bash
npm run typecheck
npm run build
npm start
```

## Vercel deployment

Import the repository into Vercel, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` under **Project Settings → Environment Variables**, and deploy. Run the SQL against the Supabase project used by the deployment.
