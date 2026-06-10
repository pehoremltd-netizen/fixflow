# FixFlow CMMS Platform - Deployment Guide

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- Supabase account (free tier works)
- Vercel account (for deployment)

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Database Setup (Supabase)

1. Create a new Supabase project
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/00001_initial_schema.sql`
4. Run the SQL to create all tables, RLS policies, and triggers
5. (Optional) Run `supabase/seed.sql` for demo data

## Supabase Configuration

### Authentication
- Enable Email/Password sign-in in Auth > Providers
- (Optional) Configure additional providers

### Storage
- Create a bucket called `inspection-photos` for inspection media
- Create a bucket called `attendance-photos` for attendance photos
- Create a bucket called `documents` for tenant/stakeholder documents

### API Settings
- Copy the Project URL and anon key from Settings > API
- Add them to your environment variables

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Option 2: Deploy via Git Integration

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables in Vercel

Add these in Vercel Dashboard > Project > Settings > Environment Variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

## Post-Deployment Verification

### Check List
- [ ] Login page loads
- [ ] Registration works
- [ ] Admin dashboard loads
- [ ] User management works
- [ ] Site/facility management works
- [ ] Inspection creation and submission works
- [ ] QR code generation works
- [ ] GPS attendance verification works
- [ ] Work order management works
- [ ] Asset management works
- [ ] Inventory management works
- [ ] Reports and analytics load
- [ ] Stakeholder portal (read-only)
- [ ] Tenant portal (request submission)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode toggle works
- [ ] All demo users can sign in

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing/marketing page
│   ├── layout.tsx            # Root layout with fonts
│   ├── globals.css           # Global styles + Tailwind
│   ├── (auth)/               # Auth pages (login, register)
│   ├── (dashboard)/          # All portal dashboards
│   │   ├── admin/            # Admin portal
│   │   ├── manager/          # Manager portal
│   │   ├── supervisor/       # Supervisor portal
│   │   ├── staff/            # Staff portal
│   │   ├── stakeholder/      # Stakeholder portal
│   │   └── tenant/           # Tenant portal
│   └── layout.tsx            # Dashboard layout
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── layout/               # Layout components
│   └── landing/              # Landing page components
├── lib/
│   ├── supabase/             # Supabase client, server, middleware
│   └── utils.ts              # Utility functions
├── types/                    # TypeScript types
└── middleware.ts             # Auth + role-based redirects
```

## Key Features

- **Multi-Tenant SaaS**: Each organization gets isolated data
- **Role-Based Access**: 6 roles: admin, manager, supervisor, staff, stakeholder, tenant
- **QR Attendance**: Site-specific QR codes with GPS verification
- **GPS Geofencing**: 100m radius attendance zones
- **Digital Inspections**: Forms with checklists, photos, videos, signatures
- **Work Orders**: Full lifecycle management
- **Asset Management**: Tracking, lifecycle, warranty
- **Inventory**: Stock management with reorder alerts
- **Contracts**: Vendor management with SLA monitoring
- **Analytics**: Real-time dashboards and KPI tracking
- **Mobile-First**: Fully responsive design

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fixflow.com | (set in Supabase) |
| Manager | manager@fixflow.com | (set in Supabase) |
| Supervisor | supervisor@fixflow.com | (set in Supabase) |
| Staff | staff@fixflow.com | (set in Supabase) |
| Stakeholder | stakeholder@fixflow.com | (set in Supabase) |
| Tenant | tenant@fixflow.com | (set in Supabase) |

## Support

For issues: https://github.com/anomalyco/opencode/issues
