# Notely

Notely is a collaborative notes platform built with Next.js, Prisma, and PostgreSQL.
It supports file-based notes (PDF/image/text), real-time discussions, AI study tools, and leaderboard/group features.

## Core Features

- Authentication with NextAuth (credentials + Prisma adapter)
- Upload and share notes (PDF, image, text)
- AI summary generation and MCQ quiz generation
- RAG-style chat on indexed note content
- Real-time note discussion (Pusher)
- Tags suggestion, groups, upvotes, and leaderboard
- CI/CD with GitHub Actions and Vercel deployment

## Tech Stack

- Framework: Next.js 16 (App Router), React 19, TypeScript
- Database: PostgreSQL (Neon), Prisma ORM
- Auth: NextAuth
- Realtime: Pusher
- AI: Google Generative AI (Gemini)
- UI: Tailwind CSS, Framer Motion, shadcn/ui

## Project Structure

```text
src/
	app/                 # Pages + API routes (App Router)
	components/          # UI and feature components
	lib/                 # Auth, DB, AI, helpers, services
prisma/
	schema.prisma        # Data models
.github/workflows/
	ci-cd.yml            # CI/CD pipeline
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database (Neon or local)
- (Optional) Vercel account for deployment

## Environment Variables

Create a `.env` file in project root.

Required for core app:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Required for realtime:

- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

Required for AI features (true AI mode):

- `GOOGLE_API_KEY`

Required if using UploadThing provider route:

- `UPLOADTHING_TOKEN`

Legacy keys (`UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`) are not used by UploadThing v7 runtime.

Notes:

- If `GOOGLE_API_KEY` is missing/invalid, AI routes return fallback responses.
- `.env*` and `.vercel/` are ignored by git.

## Local Development

1. Install dependencies

```bash
npm install
```

2. Sync Prisma schema to database

```bash
npx prisma generate
npx prisma db push
```

3. Start development server

```bash
npm run dev
```

4. Open app

`http://localhost:3000`

## Scripts

- `npm run dev` - Run local dev server
- `npm run build` - Production build check
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Overview

Main route groups:

- `api/auth/*` - Registration and NextAuth
- `api/notes/*` - Note CRUD, summary, MCQ, chat, comments, upvotes
- `api/groups/*` - Group list/create/join
- `api/leaderboard` - Leaderboard data
- `api/tags/suggest` - Tag suggestions
- `api/files/[filename]` - Locally uploaded file serving

## CI/CD

Workflow file: `.github/workflows/ci-cd.yml`

- CI: runs on push/PR and executes build validation
- CD: runs on `main` push after CI and deploys to Vercel

GitHub Actions secrets required for CD:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` can be read from `.vercel/project.json` after running `vercel link` locally.

## Deployment (Vercel)

1. Import repository in Vercel
2. Add application environment variables in Vercel Project Settings
3. Push to `main` or run workflow manually from GitHub Actions

## Troubleshooting

- AI endpoint returns fallback:
	Check `GOOGLE_API_KEY` format and validity.

- Vercel deploy error `Project not found` in CI:
	Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` exactly match `.vercel/project.json` and contain no extra spaces/quotes.

- Dev server says port is in use:
	Stop existing process or run with another port.

## Security Notes

- Never commit `.env` files or production credentials.
- Rotate keys immediately if shared accidentally.
