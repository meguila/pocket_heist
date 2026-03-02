# Plan: Heist Card Component

## Context

The `/heists` dashboard currently renders plain `<ul>/<li>` lists of heists with no visual design. This plan replaces that with a styled `HeistCard` component shown in a responsive 3-column grid, a `HeistCardSkeleton` loading placeholder, and a cleaned-up `/heists` page that shows only active and assigned heists (not expired). Titles link to the existing `/heists/[id]` stub. Payout is deferred to a future task.

---

## Existing Patterns to Reuse

| What | File |
|---|---|
| Heist type + converter | `types/firestore/heist.ts` |
| `useHeists(mode)` hook | `hooks/useHeists/useHeists.ts` — returns `{ data, loading, error }` |
| Shimmer animation pattern | `components/Skeleton/Skeleton.module.css` |
| `.btn` / `.page-content` global classes | `app/globals.css` |
| Component file structure (3-file: tsx + module.css + index.ts) | `components/Navbar/`, `components/Skeleton/` |
| `@reference "../../app/globals.css"` in module.css | All existing component CSS modules |
| `next/link` usage | `components/Navbar/Navbar.tsx` |

The `/heists/[id]` stub already exists at `app/(dashboard)/heists/[id]/page.tsx` — no changes needed.

---

## Implementation Steps

### 1. Create `HeistCard` component

**New files:**
- `components/HeistCard/HeistCard.tsx`
- `components/HeistCard/HeistCard.module.css`
- `components/HeistCard/index.ts`

**Props:**
```typescript
interface HeistCardProps {
  heist: Heist
  mode: 'active' | 'assigned'
}
```

**Card layout (top to bottom):**
1. Status badge pill — `"Active"` (green / `text-success`) for `active` mode, `"Assigned"` (pink / `text-secondary`) for `assigned` mode
2. Title — `<h3>` wrapped in `<Link href={/heists/${heist.id}}>`, `text-heading`, hover `text-primary`
3. Description — clamped to 2 lines, `text-body`
4. Footer row with lucide-react icons:
   - Creator (`UserCircle` icon + `createdByCodename`) — `text-body`
   - Assignee (`Target` icon + `assignedToCodename`) — `text-body`
   - Deadline (`Clock` icon + formatted date) — `text-body`

**Card surface:** `bg-lighter`, rounded corners, border `1px solid` using a semi-transparent white (or a subtle token), `p-5` gap between sections.

---

### 2. Create `HeistCardSkeleton` component

**New files:**
- `components/HeistCardSkeleton/HeistCardSkeleton.tsx`
- `components/HeistCardSkeleton/HeistCardSkeleton.module.css`
- `components/HeistCardSkeleton/index.ts`

**Skeleton structure mirrors HeistCard:**
1. Badge placeholder — small pill shimmer line (~60px wide)
2. Title placeholder — full-width shimmer line, taller than body lines
3. Description placeholder — two shimmer lines (100% + 70% width)
4. Footer row — three small shimmer pills side by side

**Shimmer:** Same keyframe and gradient pattern as `Skeleton.module.css` — redefine locally in `HeistCardSkeleton.module.css` (component-scoped, consistent with project pattern).

**Accessibility:** `role="status"` and `aria-label="Loading heist"` on the root element.

---

### 3. Update `/heists` page

**File to modify:** `app/(dashboard)/heists/page.tsx`

**New layout:**
```
<div class="page-content">
  <section> <!-- Active Heists: assigned TO you -->
    <h2>Active Heists</h2>
    <div class="grid">
      [loading] → 3× <HeistCardSkeleton />
      [loaded, data] → heist.map → <HeistCard mode="active" />
      [loaded, empty] → empty state message (no CTA)
    </div>
  </section>

  <section> <!-- Assigned Heists: created BY you -->
    <h2>Assigned Heists</h2>
    <div class="grid">
      [loading] → 3× <HeistCardSkeleton />
      [loaded, data] → heist.map → <HeistCard mode="assigned" />
      [loaded, empty] → empty state + "Create Heist" <Link> with .btn class
    </div>
  </section>
</div>
```

- Remove the `expired` section and its `useHeists('expired')` call entirely
- The grid is defined in the page's own CSS module: `app/(dashboard)/heists/heists.module.css` (new file)
- Grid: 3 cols on `≥ md`, 2 cols on `sm`, 1 col on mobile (CSS media queries in the module)

---

### 4. Write tests

**New files:**
- `tests/components/HeistCard.test.tsx`
- `tests/components/HeistCardSkeleton.test.tsx`

**HeistCard tests:**
- Renders heist title as a link to `/heists/:id`
- Renders `"Active"` badge when `mode="active"`
- Renders `"Assigned"` badge when `mode="assigned"`
- Displays `createdByCodename` and `assignedToCodename`
- Displays formatted deadline

**HeistCardSkeleton tests:**
- Renders without crashing
- Has `role="status"` and `aria-label="Loading heist"`

**Page-level tests** (optional, in `tests/components/HeistCard.test.tsx` or a separate `tests/pages/heists.test.tsx`):
- Mock `useHeists` with `loading: true` → skeletons appear
- Mock `useHeists` with data → HeistCards appear
- Mock `useHeists` with empty array → empty state and CTA appear

---

## Files Summary

| Action | File |
|---|---|
| Create | `components/HeistCard/HeistCard.tsx` |
| Create | `components/HeistCard/HeistCard.module.css` |
| Create | `components/HeistCard/index.ts` |
| Create | `components/HeistCardSkeleton/HeistCardSkeleton.tsx` |
| Create | `components/HeistCardSkeleton/HeistCardSkeleton.module.css` |
| Create | `components/HeistCardSkeleton/index.ts` |
| Create | `app/(dashboard)/heists/heists.module.css` |
| Modify | `app/(dashboard)/heists/page.tsx` |
| Create | `tests/components/HeistCard.test.tsx` |
| Create | `tests/components/HeistCardSkeleton.test.tsx` |
| No change | `app/(dashboard)/heists/[id]/page.tsx` (stub already exists) |
| No change | `types/firestore/heist.ts` (payout deferred) |

---

## Verification

1. `npm run dev` — visit `/heists`: see two sections with 3 skeleton cards each while loading, then real cards in a 3-column grid
2. Click a heist title → navigates to `/heists/:id` stub (no content, no crash)
3. Resize the browser → grid collapses to 2-col → 1-col
4. Empty state: remove all heists from Firestore → sections show empty message + CTA
5. `npx vitest run tests/components/HeistCard.test.tsx` — all tests pass
6. `npx vitest run tests/components/HeistCardSkeleton.test.tsx` — all tests pass
7. `npm run lint` — no ESLint errors
