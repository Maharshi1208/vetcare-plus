# VetCare+ — Software Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
Define functional and non-functional requirements for VetCare+, enabling owners, vets, and admins to manage pets, appointments, and health records with strong QA coverage.

### 1.2 Scope
Owner/Admin portals, appointment booking (conflict-free), pet health (vaccination/medication), mock payments, and reporting. Aligns with the approved proposal and stack.

### 1.3 References
- VetCare+ Capstone Project Proposal v1.2 (Sept 8, 2025).
- Project repository documentation.

## 2. Overall Description
### 2.1 Users & Roles
**OWNER**, **VET**, **ADMIN** (RBAC enforced).
### 2.2 Assumptions & Constraints
Dockerized Postgres; API (Node/Express/TypeScript); Web (React/Vite/Tailwind); CI with GitHub Actions.

## 3. Functional Requirements (FR)
> Priority labels: **Must** / **Should**. Each FR includes sample Acceptance Criteria (AC).

### AUTH — Authentication & Access
- **AUTH_FR001 (Must)** Registration  
  **AC**: 201 on unique email; 409 duplicate; password policy enforced.
- **AUTH_FR002 (Must)** Login  
  **AC**: 200 returns access/refresh tokens; 401 invalid creds.
- **AUTH_FR003 (Should)** Token refresh  
  **AC**: valid refresh → 200 new access; invalid → 401.
- **AUTH_FR004 (Must)** RBAC  
  **AC**: OWNER/VET/ADMIN routes enforce role checks.

### PET — Pet Management
- **PET_FR001 (Must)** Create/Edit Pet (validation, owner-scoped)  
- **PET_FR002 (Must)** View Pets (owner sees only own pets)  
- **PET_FR003 (Should)** Pet History timeline (appts/vaccines/meds)  
- **PET_FR004 (Should)** Archive/Restore (archived hidden from new bookings)

### VET — Vet Management
- **VET_FR001 (Should)** Vet Profiles CRUD (admin only)  
- **VET_FR002 (Should)** Availability (overlap prevention)

### APPT — Appointments
- **APPT_FR001 (Must)** View availability  
- **APPT_FR002 (Must)** Book  
- **APPT_FR003 (Should)** Reschedule  
- **APPT_FR004 (Must)** Cancel  
- **APPT_FR005 (Must)** Lifecycle: BOOKED → COMPLETED/CANCELLED  
**AC shared**: conflicts prevented; audit timestamps recorded.

### HEALTH — Vaccinations & Medications
- **HEALTH_FR001 (Must)** Record Vaccination (immutable)  
- **HEALTH_FR002 (Must)** Record Medication (dosage/frequency/duration)  
- **HEALTH_FR003 (Should)** Health history view

### PAY — Mock Payments
- **PAY_FR001 (Should)** Mock checkout (SUCCESS/FAILED)  
- **PAY_FR002 (Should)** Status linked to appointment  
- **PAY_FR003 (Should)** Receipt record (ref, timestamp)

### ADMIN — Administration
- **ADMIN_FR001 (Should)** Manage Users (suspend/reactivate)  
- **ADMIN_FR002 (Should)** Manage Vets  
- **ADMIN_FR003 (Should)** Manage Appointments (override)

### REPORT — Reports & Dashboard
- **REPORT_FR001 (Should)** KPI cards (bookings, cancels, due vaccines, mock revenue)  
- **REPORT_FR002 (Should)** Operational views (today’s schedule per vet)  
- **REPORT_FR003 (Stretch)** CSV/PDF export

## 4. Non-Functional Requirements (NFR)
**Performance**: P95 API ≤ 400ms @ 100 conc.; page load ≤ 2.5s.  
**Security**: bcrypt; RBAC; input validation/sanitization; token hygiene.  
**Usability & A11y**: responsive; WCAG 2.1 AA baseline checks.  
**Reliability**: ≥ 99% during demo.  
**Observability**: structured logs; error tracking.

## 5. Out of Scope
No real payment gateway/SMS; no native mobile app.

## 6. Traceability
See RTM: `docs/RTM/RTM_v0.1.md`.
