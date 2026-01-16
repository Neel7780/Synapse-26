# Synapse '26

The official codebase for the Synapse 2026 Website.

## DA Ka Tyohaar

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Overview

A Next.js web application powering the Synapse 2026 website. This repository contains the frontend application, admin interfaces, API routes, components, utilities, and integration code used to run and maintain the public site and admin panels.

**Key goals:** present event information, enable registrations and payments, manage artists and sponsors, and provide a small CMS for admins.

**Tech stack (high level):** Next.js, React, Tailwind CSS, Supabase, various React animation/3D libraries (GSAP, react-three), and TypeScript.

### Contents of this README
- **Overview:** project purpose and features
- **Repository structure:** high-level folder map
- **Local setup:** prerequisites, install, run
- **Environment:** required env variables (non-secret guidance)
- **Development & build:** scripts and commands
- **Deployment & notes:** tips for production
- **Contributing & license**

**Project status:** actively used for Synapse 2026 event site and admin workflows.

### Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start local development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts
- **dev**: runs the app in development mode (`next dev`)
- **build**: builds the production app (`next build`)
- **start**: runs the built app (`next start`)
- **lint**: runs ESLint across the project

See `package.json` for the exact script definitions.

### Repository Structure (high level)

- `app/` — Next.js App Router pages and layouts for the public site and admin sections
- `components/` — shared React components (UI, admin, pages, and utilities)
- `components/admin/` — admin-specific components and guards
- `hooks/` — custom React hooks (e.g. `useAuth`)
- `lib/` — helper libraries (e.g. `checkAdmin`, `cors`, `utils`)
- `utils/supabase/` — Supabase client setups and server helpers
- `public/` — static assets (fonts, images)
- `styles/` — global design tokens and Tailwind configuration
- `types/` — shared TypeScript types
- `app/api/` — API route implementations for server actions

This repository follows a conventional Next.js layout with App Router routing and server/client components. The `admin` subtree contains routes and components used for administrative workflows (managing events, artists, sponsors, users, etc.).

### Development Notes

- Recommended Node.js: 18 or newer.
- Package manager: `npm` is used in examples; `pnpm` or `yarn` can also be used.
- TypeScript is enabled; ensure your editor picks up the workspace `tsconfig.json`.

### Environment Variables

The app integrates with Supabase and third-party services. Do not commit secrets. Example variables (names may vary in your deployment):

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon public key (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only, secret)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — payment integration credentials (if used)

Place environment variables in a `.env.local` file for local development. Example `.env.local` (never commit this file):

```text
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Authentication and Admin

- Auth flows are implemented under `app/auth` and `app/admin`. The `components/admin/AdminAuthGuard.tsx` component controls protected admin routes.
- `lib/checkAdmin.ts` contains helper logic for server-side admin checks.

### Styling and Assets

- Tailwind CSS is used for styling. Custom tokens live in `styles/design-tokens.css` and `tailwind.config.js`.
- Static images and fonts are in `public/` organized by domain (home, events, merch, sponsors, etc.).

### Third-party Services & Libraries

- Supabase for authentication and data
- Razorpay for payments
- GSAP and `react-three` libraries for animations and 3D visuals

### Building for Production

1. Create a production build:

```bash
npm run build
```

2. Start the production server (after build):

```bash
npm start
```

### Deployment

- The project is compatible with Vercel (Next.js recommended), Netlify, or other Node.js hosts. If deploying to Vercel, set the environment variables in the project settings and enable any preview branch protections you need.
- Make sure server-only secrets (like `SUPABASE_SERVICE_ROLE_KEY`) are stored only in secure environment settings and never exposed to client bundles.

### Contributing

- Fork the repo and open pull requests for changes.
- Keep UI and behavior consistent with existing components in `components/`.
- Run `npm run lint` and fix lint errors before submitting PRs.

### Maintainers & Contact

- Project maintainers and event leads typically manage this repo. For questions about deployment or admin access, contact the Synapse web team (contact details not stored in repo).

### License

- See the `LICENSE` file at the repository root for license details.

### Files to Review First

- `app/layout.tsx` — application-level layout and providers
- `app/page.tsx` — public home page entry
- `app/admin/layout.tsx` — admin-specific layout and middleware
- `utils/supabase/` — Supabase client and server helpers

### More Information

If you need a walkthrough of any specific area (auth flow, payments, admin tables, or component patterns), open an issue or request a guided code tour.

---

This README was updated to reflect the repository layout and provide actionable setup and development guidance.

