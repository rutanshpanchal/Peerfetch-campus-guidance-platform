# Deploying PeerFetch to Vercel with PostgreSQL

## Problem
SQLite doesn't work on Vercel because Vercel uses serverless functions with read-only filesystems.

## Solution: Use Vercel Postgres

### Step 1: Create Vercel Postgres Database

1. Go to your project on [vercel.com](https://vercel.com)
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose **Hobby** plan (Free)
6. Click **Create**
7. Vercel will show you environment variables - keep this tab open

### Step 2: Update Your Local Project

#### 2.1 Replace schema.prisma
```bash
# Backup old schema
mv prisma/schema.prisma prisma/schema-sqlite-backup.prisma

# Use the new PostgreSQL schema
mv prisma/schema-postgres.prisma prisma/schema.prisma
```

Or manually update `prisma/schema.prisma`:
- Change `provider = "sqlite"` to `provider = "postgresql"`
- Change `url = "file:./dev.db"` to `url = env("DATABASE_URL")`

#### 2.2 Create .env file
Create a `.env` file in your project root:
```env
DATABASE_URL="your-vercel-postgres-url-here"
```
(Copy the DATABASE_URL from Vercel dashboard)

#### 2.3 Install PostgreSQL dependencies
```bash
npm install
```

#### 2.4 Generate Prisma Client and Push Schema
```bash
npx prisma generate
npx prisma db push
```

#### 2.5 Seed the database (optional)
```bash
npm run db:seed
```

### Step 3: Configure Vercel Environment Variables

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. The `DATABASE_URL` should already be there from creating the database
3. Make sure it's enabled for **Production**, **Preview**, and **Development**

### Step 4: Deploy

```bash
git add .
git commit -m "Migrate to PostgreSQL for Vercel deployment"
git push
```

Vercel will automatically redeploy with PostgreSQL!

---

## Alternative: Deploy to Railway (Supports SQLite)

If you want to keep using SQLite:

1. Go to [railway.app](https://railway.app)
2. Click **Start a New Project** → **Deploy from GitHub**
3. Select your `peerfetch` repository
4. Railway will automatically detect Next.js and deploy
5. Your SQLite database will work there!

---

## Testing

After deployment succeeds:
1. Visit your Vercel URL
2. Login with: **ADMIN001** / **admin123**
3. If you see the dashboard, it worked! 🎉

---

## Important Notes

- ✅ PostgreSQL is production-ready and scales better
- ✅ Vercel Postgres free tier is generous (256 MB storage, 60 hours compute)
- ✅ All your code works the same - only the database changed
- ⚠️ Don't commit `.env` file to Git (it's in `.gitignore`)
