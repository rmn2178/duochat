# Duo Chat

[![Netlify Status](https://api.netlify.com/api/v1/badges/9b35c697-cebf-460f-8ac1-eed5dc47c93a/deploy-status)](https://app.netlify.com/projects/duochatrr/deploys)

A private, two-person chat application featuring an iOS glassmorphic UI, real-time messaging, and AI reply suggestions via Gemini.

## Tech Stack
- Next.js 16 (App Router)
- Supabase (Postgres, Realtime, Storage)
- Tailwind CSS v4 & Framer Motion (Glassmorphic Theme)
- Gemini AI API

## Getting Started

1. Set up your Supabase project with the included `schema.sql` and `policies.sql` files.
2. Configure your `.env` variables (see `.env.example`).
3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
