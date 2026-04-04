# BuildProcure - Construction Procurement & Project Operations Platform

A comprehensive B2B SaaS platform built specifically for the South African construction industry. BuildProcure streamlines procurement processes including RFQ management, purchase orders, deliveries, contractor compliance, and budget tracking.

## Features

### Core Modules
- **RFQ & Supplier Quote Management** - Create, send, compare, and award RFQs
- **Purchase Order Creation & Tracking** - Generate POs, track status, PDF export
- **Materials Delivery Scheduling** - Schedule deliveries, log receipts, flag issues
- **Contractor & Subcontractor Management** - Track companies, ratings, contracts
- **CIDB Compliance & Grading Tracker** - Monitor compliance, expiry alerts
- **Budget vs Actual Spend Tracking** - Real-time budget burn, variance alerts
- **Site-Level Inventory & Stock Management** - Track materials, stock levels
- **Multi-Project Dashboard & Reporting** - Portfolio overview, exports

### South African Context
- All amounts in ZAR (R) with 15% VAT
- CIDB grading categories (1-9)
- BEE scorecard tracking
- SA cities: Johannesburg, Cape Town, Durban, Pretoria

### Pricing (ZAR)
- **Starter**: R1,999/mo - 1 project, 3 users
- **Growth**: R6,000/mo - 10 projects, 15 users
- **Enterprise**: R15,000/mo - Unlimited, multi-company

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js + Google OAuth |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| PDF | @react-pdf/renderer |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>/buildprocure
cd buildprocure
npm install
```

### 2. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buildprocure"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (optional - for file storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App
NEXT_PUBLIC_APP_NAME="BuildProcure"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── projects/       # Projects CRUD
│   │   ├── rfqs/           # RFQ endpoints
│   │   ├── purchase-orders/
│   │   ├── contractors/
│   │   └── suppliers/
│   ├── auth/
│   │   ├── signin/         # Sign in page
│   │   └── signup/         # Sign up page
│   ├── dashboard/          # Main app (protected)
│   │   ├── projects/       # Project management
│   │   ├── rfqs/           # RFQ management
│   │   ├── purchase-orders/
│   │   ├── deliveries/
│   │   ├── contractors/
│   │   ├── compliance/
│   │   ├── budget/
│   │   ├── inventory/
│   │   ├── reports/
│   │   └── settings/
│   ├── demo-request/       # Public demo request
│   └── page.tsx           # Landing page
├── components/
│   ├── layout/            # Layout components
│   ├── ui/                # shadcn components
│   └── ...
├── lib/
│   ├── prisma.ts          # Database client
│   ├── auth.ts            # NextAuth config
│   └── utils.ts           # Utility functions
└── hooks/
    └── use-toast.ts       # Toast notifications
```

## Demo Data

The platform includes demo data with realistic SA context:
- **Projects**: Sandton Mixed-Use Development, Cape Town Harbour Industrial Park
- **Materials**: Rebar, concrete, shutterboard, waterproofing membrane
- **Cities**: Johannesburg, Cape Town, Durban, Pretoria

## User Roles

| Role | Access |
|------|--------|
| Super Admin | Full access, company settings |
| Project Manager | Full project access |
| Quantity Surveyor | Budget + procurement view |
| Site Manager | Deliveries + stock only |
| Subcontractor | View own POs, submit confirmations |

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project

### RFQs
- `GET /api/rfqs` - List RFQs
- `POST /api/rfqs` - Create RFQ

### Purchase Orders
- `GET /api/purchase-orders` - List POs
- `POST /api/purchase-orders` - Create PO

### Contractors
- `GET /api/contractors` - List contractors
- `POST /api/contractors` - Add contractor

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Add supplier

## Production Deployment

### 1. Build

```bash
npm run build
```

### 2. Environment
Set production environment variables on your hosting platform.

### 3. Database Migration

```bash
npx prisma migrate deploy
```

### 4. Start

```bash
npm start
```

## Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Support

For issues and questions:
- Email: support@buildprocure.co.za
- Documentation: https://docs.buildprocure.co.za

## License

Proprietary - All rights reserved