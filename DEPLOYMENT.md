# Deploy to Vercel

## Database

Production uses PostgreSQL. Create a hosted Postgres database first, for example Neon, Supabase, or Vercel Postgres.

Set this environment variable in Vercel:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
```

## Environment Variables

Copy the values from `.env.example` into Vercel Project Settings, then change the passwords and secrets.

Required:

```text
DATABASE_URL
AUTH_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
ADMIN_USERNAME
ADMIN_PASSWORD
```

`NEXTAUTH_URL` must match the deployed URL, for example:

```text
NEXTAUTH_URL=https://your-project.vercel.app
```

## Apply Database Schema

After setting `DATABASE_URL` locally to the production database URL, run:

```powershell
npm.cmd run db:deploy
```

For a new empty database during setup, this also works:

```powershell
npm.cmd run db:push
```

## Deploy

Push the project to GitHub, import it in Vercel, set the environment variables, then deploy.

The build command is:

```text
npm run build
```

## Local Development with Postgres

Start the included local database:

```powershell
docker compose up -d
```

Then sync schema:

```powershell
npm.cmd run db:push
```

Run the app:

```powershell
npm.cmd run dev
```

SQLite `prisma/dev.db` is no longer used after this change.
