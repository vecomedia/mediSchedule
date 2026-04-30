# Plan: MediSchedule — React/Next.js Learning App

## Status: Draft — awaiting user approval

## Context
- Fresh Next.js 16 + React 19 + TypeScript + TailwindCSS 4
- DesignSystem.tsx exists, imports ui/ components that don't exist yet (button, input, label, card, badge) and lucide-react (not installed)
- No auth, no DB, no validation installed
- Auth: NextAuth.js v5 (credentials)
- Data: pure @faker-js/faker, no DB now
- Validation: Zod + react-hook-form
- Skill: project-level .github/skills/

---

## Phase 1: Foundation — Install & scaffold UI (blocks everything)

1. Install packages: `@faker-js/faker`, `zod`, `react-hook-form`, `@hookform/resolvers`, `next-auth@5` (beta), `lucide-react`
2. Scaffold ui/ components that DesignSystem.tsx already imports:
   - `src/app/components/ui/button.tsx`
   - `src/app/components/ui/input.tsx`
   - `src/app/components/ui/label.tsx`
   - `src/app/components/ui/card.tsx`
   - `src/app/components/ui/badge.tsx`
   Use Tailwind utility classes matching the design system color palette (blue-600 primary, emerald success, amber warning, slate neutral).
3. Register DesignSystem as a viewable route: `src/app/design-system/page.tsx`

## Phase 2: Types & Faker Data Layer

4. Define TypeScript types in `src/lib/types.ts`:
   - `Patient` (id, name, dob, email, phone, status)
   - `Doctor` (id, name, specialty, avatar)
   - `Appointment` (id, patientId, doctorId, date, time, status: confirmed|pending|cancelled)
   - `AuthUser` (id, email, name, role: admin|receptionist)
5. Create `src/lib/faker-data.ts` — generates seeded, deterministic fake data:
   - 20 patients, 8 doctors, 50 appointments
   - Uses `faker.seed(42)` for reproducibility
6. Create `src/lib/data.ts` — in-memory store + query functions (getAppointments, getPatients, getDoctors, getAppointmentById) to be swapped for Prisma later

## Phase 3: Auth (NextAuth latest save)

7. Create `src/auth.ts` — NextAuth config with CredentialsProvider, hardcoded test users (admin@medi.dev / password123), Zod schema for credentials validation
8. Create `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler
9. Create `src/app/(auth)/login/page.tsx` — login form using react-hook-form + Zod, ui/ components
10. Create `src/middleware.ts` — protect all routes except /login

## Phase 4: App Pages

11. `src/app/(app)/layout.tsx` — sidebar nav (Dashboard, Appointments, Patients)
12. `src/app/(app)/dashboard/page.tsx` — stats cards (total patients, today's appointments, pending), upcoming appointments list using Faker data
13. `src/app/(app)/appointments/page.tsx` — appointments table with status badges, filter by date/status
14. `src/app/(app)/patients/page.tsx` — patient list with search
15. `src/app/(app)/appointments/new/page.tsx` — booking form, Zod schema validation

---

## Relevant files
- `src/app/components /DesignSystem.tsx` — reference for colors, components, badge variants
- `medical-scheduler/package.json` — add all new deps here

## Verification
1. `npm run dev` — app loads, /design-system renders all components
2. /login → valid credentials redirect to /dashboard, invalid shows Zod error
3. Direct access to /dashboard without session redirects to /login
4. Dashboard shows Faker-generated appointments and patient counts
5. Appointment form submits → Zod validates, success toast shown

## Decisions
- DB used with prisma — Faker data used (expected for learning)
- DB integration later: replace `src/lib/data.ts` functions with Prisma equivalents — types stay unchanged
- shadcn/ui NOT used — build ui/ components manually to learn React component patterns
- Auth.js v5 (beta) used because it works natively with Next.js App Router and React 19

Current State

You have a frontend-only prototype with:

    ✅ React + Tailwind UI
    ✅ Mock authentication (AuthContext)
    ✅ Mock data (patients, appointments, doctors)
    ✅ Complete user flows (staff + patient portals)
    ❌ No real backend/database
    ❌ No real authentication
    ❌ No API endpoints

Steps to Production
1. Export Your Code

Since you're in Figma Make, you'll need to move this to a standard development environment:

# Copy all files from src/app to your local machine
# Set up a new Vite + React project locally:

npm create vite@latest medischedule -- --template react-ts
cd medischedule
npm install

Then copy over:

    All components from src/app/components/
    Routes from src/app/routes.ts
    Styles from src/styles/
    Install the same dependencies from your current package.json

2. Build the Backend (Since you said you'll do this yourself)

You'll need to create:

Database Schema:

-- Users table (staff + patients)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL, -- 'staff' or 'patient'
  phone VARCHAR,
  created_at TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  specialty VARCHAR NOT NULL,
  avatar VARCHAR
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES doctors(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL,
  type VARCHAR NOT NULL,
  status VARCHAR NOT NULL, -- 'confirmed', 'pending', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP
);

Backend API Endpoints (example with Node.js/Express):

// Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// Appointments (Staff)
GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id

// Appointments (Patient)
GET  /api/patients/:id/appointments
POST /api/patients/:id/appointments/request

// Patients
GET  /api/patients
GET  /api/patients/:id
POST /api/patients

// Doctors
GET  /api/doctors

3. Replace Mock Data with API Calls

Replace your mock code:

Before (Mock):

// AuthContext.tsx
const login = (email: string, password: string) => {
  setUser({ id: "123", name: "Dr. Smith", email, role: "staff" });
};

After (Real API):

const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  setUser(data.user);
  localStorage.setItem('token', data.token);
};

4. Choose Your Tech Stack

Backend Options:

    Node.js + Express (JavaScript/TypeScript)
    Python + FastAPI (Python)
    Ruby on Rails (Ruby)
    Django (Python)

Database Options:

    PostgreSQL (Recommended for production)
    MySQL
    MongoDB (if you prefer NoSQL)

Authentication:

    JWT tokens (self-managed)
    Auth0 (managed service)
    Supabase Auth (managed service)
    Firebase Auth (managed service)

5. Deploy to Production

Frontend Deployment:

# Build your React app
npm run build

# Deploy to:
# - Vercel (recommended, easiest)
# - Netlify
# - AWS S3 + CloudFront
# - Render

Vercel Example:

npm install -g vercel
vercel --prod

Backend Deployment:

    Railway (easiest for Node.js/Python)
    Render (free tier available)
    AWS EC2/ECS (more control)
    Digital Ocean
    Heroku

Database Hosting:

    Supabase (PostgreSQL, free tier)
    Railway (PostgreSQL, free tier)
    AWS RDS
    PlanetScale (MySQL)

6. Environment Variables

Create .env files:

# .env (backend)
DATABASE_URL=postgresql://user:pass@host:5432/medischedule
JWT_SECRET=your-secret-key
PORT=3000

# .env (frontend)
VITE_API_URL=https://api.yourapp.com

7. Security Considerations ⚠️

CRITICAL for healthcare apps:

    ✅ HTTPS only (SSL certificates)
    ✅ Password hashing (bcrypt, argon2)
    ✅ JWT token expiration
    ✅ Input validation & sanitization
    ✅ CORS configuration
    ✅ Rate limiting
    ✅ HIPAA compliance (if handling PHI in US)
    ✅ Data encryption at rest
    ✅ Regular security audits

8. Recommended Quick Start Path

Easiest production setup:

    Frontend: Deploy to Vercel

    vercel --prod

    Backend + Database: Use Supabase (all-in-one)
        PostgreSQL database
        Built-in authentication
        Auto-generated REST/GraphQL APIs
        Free tier available

    Connect them:

    // Install Supabase client
    npm install @supabase/supabase-js

    // Create client
    import { createClient } from '@supabase/supabase-js'
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Use in your app
    const { data, error } = await supabase
      .from('appointments')
      .select('*')

9. Testing Before Production

# Run tests
npm run test

# Check build
npm run build
npm run preview

# Load testing
# Use tools like Apache JMeter or k6

10. Post-Launch Checklist

    Domain name configured
    SSL certificate active
    Error monitoring (Sentry, LogRocket)
    Analytics (Google Analytics, Plausible)
    Backup strategy for database
    Email service configured (SendGrid, AWS SES)
    SMS notifications (Twilio) if needed
    Legal compliance (HIPAA, GDPR, etc.)
    Terms of Service & Privacy Policy

Quick Demo Deploy (No Backend)

If you want to deploy just the UI prototype as-is:

# 1. Build the project
npm run build

