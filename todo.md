 # Tripos Gaffer – TODO

## 0) Pre-flight
- [ ] Add `.env.example` + brief setup notes (Neon / Vercel env vars)
- [ ] One-pass audit to ensure **no static catalog imports** remain (everything uses `catalogClient`)

---

## 1) Bug hunt + stability pass
- [ ] Click-through test every route:
  - Dashboard
  - Modules
  - Module Detail
  - Tasks
  - Task Detail
  - Settings (stub)
- [ ] Edge cases:
  - No course selected
  - Empty modules
  - Empty tasks
  - Invalid `taskId`
  - Deleted task
  - Slow / failed network
- [ ] Date correctness:
  - Overdue logic
  - Future lectures excluded from backlog
  - `<input type="date">` ↔ ISO consistency
- [ ] Mobile layout sanity check (cards, forms, long titles)
- [ ] Fix issues + add brief regression notes where needed

---

## 2) Separate modules by term
- [ ] Decide term model:
  - `Michaelmas | Lent | Easter | Unknown` (optionally `Vacation`)
- [ ] Add term to catalog schema (or derive if feasible)
- [ ] Update seed data to include term
- [ ] Update API queries + catalog types
- [ ] Group modules by term in:
  - Dashboard
  - Modules page

---

## 3) Settings page + authentication
- [ ] Build Settings page MVP:
  - [ ] Current course + year display
  - [ ] Change course / year (move logic out of Dashboard)
  - [ ] Reset / delete all local data
- [ ] Decide auth strategy:
  - [ ] Raven (Cambridge)
  - [ ] Optional Google login
- [ ] Define user identity model (`userId`, `email` / `crsid`)
- [ ] Implement login + session handling

---

## 4) Introduce user data to the database
- [ ] Decide which data moves server-side first:
  - [ ] Selected course / year
  - [ ] Tasks
  - [ ] Completed lectures
  - [ ] Module ratings
- [ ] Design DB schema for user data
- [ ] Write migrations
- [ ] Create authenticated API routes for user data
- [ ] Update client:
  - [ ] Sync `useStudyState` with server
  - [ ] Decide local-first vs server-first strategy

---

## 5) Tighten data boundaries + API restrictions
- [ ] Clearly document boundaries:
  - Catalog = public, read-only
  - User data = authenticated, per-user
- [ ] Add auth guards / middleware for user routes
- [ ] Enforce per-user row scoping in DB queries
- [ ] Validate inputs on write endpoints (e.g. Zod)
- [ ] Add basic rate limiting to public catalog endpoints (if needed)

---

## 6) Final UX polish + bug fixes
- [ ] Improve loading and empty states (especially module dropdowns)
- [ ] Quality-of-life improvements:
  - [ ] Mark all lectures complete / incomplete
  - [ ] Task bulk actions (optional)
  - [ ] Consistent badges (Overdue / Completed)
- [ ] Performance pass:
  - [ ] Remove any remaining N+1 queries
  - [ ] Cache catalog reads where appropriate

---

## 7) Go live
- [ ] Set production environment variables
- [ ] Verify production database + seeds
- [ ] Smoke test production deployment
- [ ] Optional: basic analytics / error tracking
- [ ] Soft launch with a small group of testers

---

## 8) Post-launch backlog
- [ ] KuDoS integration (after auth + permissions are solid)
- [ ] Recurring tasks
- [ ] Notifications / reminders
- [ ] Import from Cambridge course pages / timetables
