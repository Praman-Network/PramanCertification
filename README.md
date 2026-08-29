# Praman Network — Next.js Certificate Verification System

A modern, full-stack **Next.js (App Router + TypeScript + PostgreSQL)** platform for issuing, batch-generating, cryptographically hashing, and publicly verifying internship & achievement certificates.

---

## 1. How It Works

1. **Admin Issuance**: The administrator signs in to the protected dashboard and issues certificates individually or in batch via drag-and-drop CSV upload.
2. **Atomic ID & Cryptographic Hashing**: An atomic PostgreSQL sequence guarantees a unique certificate number (eliminating race conditions), while a SHA-256 fingerprint is calculated from the intern's details and secret salt.
3. **Automated Asset Generation**: High-resolution QR codes and formal landscape A4 PDF certificates are generated automatically using `pdf-lib`.
4. **Public Verification & Tamper Detection**: When an employer or verifier scans the QR code or visits `/verify`, the server recomputes the cryptographic hash to mathematically confirm authenticity and immediately detect forged or altered data.
5. **Real-Time Audit Logging**: Every verification query and credential scan is logged in PostgreSQL with timestamp, result status, and verifier client details.

---

## 2. Key Features & Highlights

- **⚡ Full-Stack Next.js (App Router) + PostgreSQL**: Powered by standard `pg` connection pooling for fast queries and ACID compliance.
- **🛡️ Cryptographic Tamper Detection**: Fingerprints every certificate with SHA-256 against a secret server salt.
- **📱 Real QR Code & PDF Generation**: Automatic creation of QR codes and formal A4 landscape PDF certificates.
- **🔍 Public Rate-Limited Verification**: Rate-limited public verification portal with animated glowing status seals (Valid, Revoked, Invalid).
- **🔐 Secure Admin Console**: Session authentication with HTTP-only cookies and dynamic environment variables.
- **📁 Bulk CSV Batch Generation**: Upload a `.csv` file to issue dozens of certificates in one click with progress tracking.
- **📊 Real-Time Analytics & Registry**: Live counter metrics, status filters, instant search, and certificate revocation flow.

---

## 3. Project Structure

```
praman-cert-system-v2/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     → Root layout (Navbar, Footer, Fonts)
│   │   ├── page.tsx                       → Home verification portal
│   │   ├── verify/page.tsx                → Public verification page (?certId=...)
│   │   ├── certificate/[certId]/page.tsx  → Public direct credential view
│   │   ├── login/page.tsx                 → Admin sign-in page
│   │   ├── admin/page.tsx                 → Admin console (Stats, Single/Bulk form, Table)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts         → Sets secure HTTP-only session cookie
│   │       │   ├── logout/route.ts        → Clears session cookie
│   │       │   └── status/route.ts        → Checks admin login state
│   │       ├── certificates/
│   │       │   ├── route.ts               → GET: lists all certificates (PostgreSQL)
│   │       │   ├── generate/route.ts      → POST: single certificate generation
│   │       │   ├── bulk-generate/route.ts → POST: multipart CSV or JSON batch generation
│   │       │   └── [certId]/
│   │       │       ├── pdf/route.ts       → GET: serves / generates PDF on-demand
│   │       │       └── revoke/route.ts    → PATCH: revokes certificate
│   │       └── verify/[certId]/route.ts   → GET: public rate-limited verification endpoint
│   ├── components/
│   │   ├── Navbar.tsx                     → Navigation bar with status pill & logout
│   │   ├── Footer.tsx                     → Security branding footer
│   │   ├── StatCard.tsx                   → Glowing metric cards
│   │   ├── SingleCertForm.tsx             → Single intern certificate generator
│   │   ├── BulkCertForm.tsx               → Drag-and-drop CSV batch generator
│   │   ├── CertificatesTable.tsx          → Filterable registry table with revoke dialog
│   │   └── VerificationResult.tsx         → Animated verified/revoked/invalid seal cards
│   ├── lib/
│   │   ├── db.ts                          → PostgreSQL pool (`pg`) & auto-schema init
│   │   ├── auth.ts                        → JWT / cookie session helpers
│   │   ├── hash.ts                        → SHA-256 tamper-evident hash generator
│   │   ├── qrgen.ts                       → QR code generator
│   │   ├── pdfgen.ts                      → A4 PDF builder with `pdf-lib`
│   │   ├── cert-service.ts                → Certificate lifecycle business logic
│   │   └── types.ts                       → TypeScript domain interfaces
│   └── styles/
│       └── globals.css                    → Dark cyberpunk/fintech design system
├── public/
│   ├── praman-logo.png                    → Praman Network brand logo
│   └── sample-template.csv                → Downloadable CSV template for bulk batches
├── scripts/
│   ├── setup-postgres.js                  → Database connection test & schema init
│   ├── clear-database.js                  → Clears tables and resets sequences
│   └── regenerate-all-pdfs.js             → Mass PDF regenerator
├── next.config.mjs                        → Next.js configuration
├── package.json                           → Project dependencies & scripts
├── tsconfig.json                          → TypeScript configuration
└── .env.local                             → Environment variables & DATABASE_URL
```

---

## 4. Database Setup (PostgreSQL)

Set your PostgreSQL connection string in `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```
*(Supports any PostgreSQL provider: Supabase, Neon, Render, Railway, AWS RDS, or local PostgreSQL).*

---

## 5. Quick Start & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Database & Initialize Tables
```bash
npm run db:init
```

### 3. Run Development Server
```bash
npm run dev
```

Access the application in your browser:
- **Admin Login**: <http://localhost:3000> (or `/login`)
- **Admin Dashboard**: <http://localhost:3000/admin>
- **Public Verification Portal**: <http://localhost:3000/verify>

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Reset / Clear Database (Optional)
```bash
npm run db:clear
```

---

## 6. Bulk CSV Format

When using **Bulk Generate**, upload a CSV file with the following column headers:
```csv
name,email,role,startDate,endDate
Aditi Sharma,aditi@example.com,AI/ML Engineer Intern,2026-06-01,2026-09-01
Rohan Verma,rohan@example.com,Backend Developer Intern,2026-07-01,2026-10-01
```
