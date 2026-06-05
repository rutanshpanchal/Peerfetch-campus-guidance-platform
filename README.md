# PeerFetch - Engineering Student Networking Platform

A full-stack networking platform for engineering students to facilitate mentorship between seniors and juniors.

## Features

✨ **Authentication & Admin Gatekeeping**
- Login/Sign-up with Student ID (format: 25EL011)
- Admin dashboard at `/admin` for approval workflow
- Password-protected accounts

🎓 **Organized Navigation**
- LinkedIn-style feed with 10 engineering branches
- Branch-specific views with year tabs (1st, 2nd, 3rd, 4th year)
- Student cards with profile pictures, bios, skills, and badges

🔍 **Search & Filtering**
- Global search bar for finding students by name
- Activity-based filtering (TRS, TSA, BAHA, IEEE, IEI)
- Real-time filtering within branch views

👤 **Profile System**
- Editable profiles with bio, skills, and extracurriculars
- Profile pictures via UI Avatars
- "Request Mentorship" button for connections

💾 **Database**
- SQLite with Prisma ORM
- Pre-populated with 2000+ students (50 per branch per year)
- Realistic mock data with Indian names

🎨 **Design**
- Tailwind CSS with custom color palette
- Dark mode support
- Smooth animations and micro-interactions
- Premium, professional design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma
- **Styling**: Tailwind CSS
- **Authentication**: Custom session-based auth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed database with mock data**
   ```bash
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Credentials

### Admin Account
- **Student ID**: `ADMIN001`
- **Password**: `admin123`

### Student Accounts
All students use the password: `password123`

Examples:
- `25EL001` - 1st year Electronics student
- `24CP015` - 2nd year Computer student
- `23EE020` - 3rd year Electrical student
- `22ME005` - 4th year Mechanical student

## Branch Codes

- **EL** - Electronics
- **CP** - Computer Science
- **EC** - Electronics & Communication
- **EE** - Electrical
- **ME** - Mechanical
- **CE** - Civil
- **PE** - Production
- **IT** - Information Technology

## Project Structure

```
peerfetch/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── branch/[branch]/    # Branch-specific views
│   ├── dashboard/          # Main dashboard
│   ├── profile/            # User profile
│   ├── search/             # Search results
│   ├── student/[id]/       # Student profile view
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Auth page
├── lib/
│   ├── auth.ts             # Authentication utilities
│   ├── prisma.ts           # Prisma client
│   └── session.ts          # Session management
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Database seeding
└── package.json
```

## Key Features Explained

### Student ID Format

Student IDs follow the format: `YYBBBRRR`
- `YY` - Batch year (e.g., 25 for batch 2025)
- `BBB` - Branch code (e.g., EL, CP, EC)
- `RRR` - Roll number (001-999)

Example: `25EL011` = Batch 2025, Electronics, Roll #011

### Admin Approval System

1. New users sign up with their student ID
2. Account is created but marked as "pending approval"
3. Admin logs in to `/admin` dashboard
4. Admin clicks "Approve" for pending users
5. Approved users can now access the platform

### Mentorship System

- Students can browse other students by branch and year
- View detailed profiles with skills and activities
- Click "Request Mentorship" to connect
- Requests are tracked in the database

## Development

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Seed database
npm run db:seed

# Open Prisma Studio
npx prisma studio
```

### Build for Production

```bash
npm run build
npm start
```

## Contributing

This is a demo project created for educational purposes.

## License

MIT License - feel free to use this project as a template!

---

Built with ❤️ using Next.js, Prisma, and Tailwind CSS
