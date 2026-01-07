## Data split
### 1) Catalog (static, shipped to all users)
**Source**:** code in `src/lib/catalog/**`  
**Properties:**
- Same for every user
- Versioned by the app (changes only when you deploy new code)
- Never written to localStorage
**Contains:**
- `CourseDefinition`
- `ModuleDefinition`
- `LectureDefinition`

**Key rule:** Catalog objects are immutable at runtime. 

---

### 2) User State (local, user-specific)
**Source:** localStorage (Phase 1), synced (Phase 2)  
**Properties:**
- Only personal progress, preferences, and tasks
- Must reference catalog items by ID (never embed full definitions)

**Contains:**
- selected course (by `CourseId`)
- lecture completion flags (by `LectureId`)
- module comfort/difficulty ratings (by `ModuleId`)
- tasks (user-created)

**Key rule:** User state must remain valid even if catalog expands.
If a catalog item disappears/renames, the app should degrade gracefully.

---

## Identity model

### IDs are stable keys
- `CourseId`, `ModuleId`, `LectureId` are stable strings.
- They are the ONLY link between catalog and user data.

### Where IDs live
- Catalog: owns the “truth” of what IDs exist and their structure.
- User state: stores only ID references + user-specific fields.

