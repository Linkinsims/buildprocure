# BuildProcure - Specification Document

## 1. Project Overview

**Project Name:** BuildProcure
**Type:** B2B SaaS - Construction Procurement & Project Operations Platform
**Target Market:** South African construction industry
**Target Customers:** Construction companies, main contractors, quantity surveyors, project managers, property developers, subcontractors & specialists

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth & Storage | Supabase (Auth + File Storage) |
| Authentication | NextAuth.js (Email/Password + Google OAuth) |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Charts | Recharts |
| PDF Generation | React PDF / @react-pdf/renderer |
| Currency | ZAR with VAT (15%) |

## 3. South African Context

- All amounts in ZAR (R) format
- VAT at 15%
- CIDB grading categories (1-9)
- BEE scorecard tracking
- SA cities: Johannesburg, Cape Town, Durban, Pretoria

## 4. Core Modules

### 4.1 RFQ & Supplier Quote Management
- Create RFQs per materials category
- Send to multiple suppliers simultaneously
- Side-by-side quote comparison
- Award RFQ to winning supplier
- Full RFQ history per project

### 4.2 Purchase Order Creation & Tracking
- Generate POs from awarded RFQs or manually
- PO number sequencing
- Line items, delivery address, dates, payment terms
- Status tracking: draft → sent → acknowledged → partially delivered → fully delivered → closed
- PDF export per PO

### 4.3 Materials Delivery Scheduling
- Schedule expected deliveries per PO
- Log actual deliveries
- Capture delivery notes, condition, signatures
- Flag short deliveries, damage, late deliveries
- Supplier performance scorecard

### 4.4 Contractor & Subcontractor Management
- Register contractors per project
- Track CIDB grading, tax clearance, BEE, insurance
- Contract value tracking
- Payment certificate management
- Performance rating

### 4.5 CIDB Compliance & Grading Tracker
- Track CIDB registration and grading
- Expiry alerts at 90, 60, 30 days
- Project grading vs contractor grading validation
- CIDB renewal workflow
- BEE scorecard tracking

### 4.6 Budget vs Actual Spend Tracking
- Project budget per cost code
- Track committed spend (POs) and actual spend (deliveries + invoices)
- Real-time budget burn dashboard
- Variance alerts at 80% and 100%
- PDF/CSV export

### 4.7 Site-Level Inventory & Stock Management
- Materials received vs consumed
- Log material issues to cost codes
- Running stock balance
- Low stock alerts
- Wastage tracking
- Stock take with variance

### 4.8 Multi-Project Dashboard & Reporting
- Portfolio-level dashboard
- All projects: budget, spend, % complete, overdue deliveries
- Drill down into projects
- Reports: procurement, budget variance, supplier performance, compliance, delivery
- Export to PDF/CSV

## 5. Auth & Onboarding

### 5.1 Authentication
- NextAuth with email/password + Google OAuth
- Demo request flow with admin activation
- 14-day free trial (no credit card)

### 5.2 Roles
- Super Admin (company owner/director)
- Project Manager (full project access)
- Quantity Surveyor (budget + procurement view)
- Site Manager (deliveries + stock only)
- Subcontractor (view own POs, submit delivery confirmations)

## 6. Pricing Tiers (ZAR)

| Tier | Price | Features |
|------|-------|----------|
| Starter | R1,999/mo | 1 active project, up to 3 users, all core features |
| Growth | R6,000/mo | 10 active projects, up to 15 users, full dashboard |
| Enterprise | R15,000/mo | Unlimited projects/users, multi-company, custom branding |

## 7. Multi-Tenancy

- Each company is fully isolated
- Enterprise accounts can manage multiple legal entities
- Separate project views per entity

## 8. Demo Data

- Projects: Sandton Mixed-Use Development, Cape Town Harbour Industrial Park, Pretoria Highway Upgrade Phase 2, Durban Waterfront Hotel
- Suppliers: BuildMax SA, SteelPro, ConcreteCo, ShutterBoard Solutions, Waterproofing Experts
- Materials: Rebar, Concrete, Shutterboard, Waterproofing membrane
- All amounts in ZAR

## 9. Database Schema (Prisma)

### Core Entities:
- Organisation (multi-tenant)
- User
- Project
- Budget & CostCodes
- RFQ & Quotes
- PurchaseOrder
- Delivery
- Inventory
- Contractor
- ComplianceDocuments
- Supplier

## 10. Compliance Requirements

- CIDB grading categories 1-9
- BEE terminology throughout
- VAT treatment (15%)
- Document expiry alerts
- CIDB grade mismatch warnings