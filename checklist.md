# Cambridge Study Manager – Project Checklist

## 0) Repo & project setup
- [x] Create new Next.js (App Router) project with TypeScript
- [x] Set up ESLint + Prettier
- [ ] Add `.env.example`
- [ ] Create base layout and navigation (Dashboard / Modules / Tasks / Settings) #DASHBOARD AND MODULES DONE
- [x] Choose and apply a minimal UI styling approach

---

## 1) Data model
- [x] Define `Module` type
- [x] Define `Lecture` type
- [ ] Define `Task` type
- [ ] Define enums for task `type` and `priority`
- [ ] Add optional placeholder type for recurring tasks
- [ ] Document “minimal data” policy (`/docs/data-policy.md`)

---

## 2) Local-first persistence (Phase 1)
- [ ] Choose storage solution (IndexedDB or localStorage)
- [ ] Implement persistence layer:
  - [ ] Load all data
  - [ ] Upsert / delete modules
  - [ ] Upsert / delete lectures
  - [ ] Upsert / delete tasks
- [ ] Add storage versioning / migrations
- [ ] Implement export to JSON
- [ ] Implement import from JSON
- [ ] Add “Delete all data” action in Settings

---

## 3) State & derived logic
- [ ] Create central app state layer
- [ ] Implement derived calculations:
  - [x] Lecture progress per module
  - [ ] Lecture backlog count
  - [ ] Lecture backlog minutes
  - [ ] Tasks due this week
- [ ] Add unit tests for derived logic

---

## 4) Modules & lecture tracking
- [x] Build Modules list page
- [ ] Add create / edit / delete module functionality 
- [ ] Display module progress and backlog minutes
- [ ] Build Module detail page #BASIC FOR TESTING
- [x] Implement per-lecture checklist
- [x] Add per-lecture time estimates
- [ ] Add difficulty rating
- [ ] Add comfortability rating
- [ ] Ensure deleting a module deletes its lectures 

---

## 5) Task tracking
- [ ] Build Tasks page
- [ ] Create tasks with required due date
- [ ] Toggle task completion
- [ ] Edit task fields
- [ ] Delete tasks
- [ ] Add filters (type, priority)
- [ ] Add sorting (due date, priority)
- [ ] Add quick-add task input

---

## 6) Planner & term calendar
- [ ] Build Dashboard page
- [ ] Show tasks due this week
- [ ] Show overdue tasks
- [ ] Show lecture backlog summary
- [ ] Add term start date setting
- [ ] Compute Week 1–8 labels
- [ ] Display current term week on Dashboard
- [ ] iCal integration

---

## 7) UX & quality
- [ ] Add empty states (no modules / no tasks)
- [ ] Add confirmation dialogs for destructive actions
- [ ] Ensure consistent date formatting
- [ ] Keyboard accessibility for checklists and buttons
- [ ] Basic client-side validation

---

## 8) Deployment (Phase 1)
- [ ] Deploy app to Vercel
- [ ] Test on desktop and mobile
- [ ] Verify import/export works in production

---

## 9) Raven auth & sync (Phase 2)
- [ ] Decide sync strategy (snapshot vs incremental)
- [ ] Add backend database (Postgres)
- [ ] Design database schema
- [ ] Implement Raven authentication
- [ ] Map Raven user to stored data
- [ ] Implement sync endpoints
- [ ] Add conflict resolution strategy
- [ ] Add sync controls in Settings
- [ ] Secure endpoints (auth + access control)
- [ ] Deploy Phase 2
- [ ] Run full regression tests

---
