# Plan: Expired Heist Cards

## Context

The `/heists` page currently shows two sections (active and assigned heists). We need to add a third section for **expired heists** — heists whose deadline has passed — rendered using the existing `HeistCard` component in a 1-column grid. We also need a stub detail page at `/heists/[id]` so that card title links resolve without a 404.

## What already exists (reuse, don't rebuild)

- `HeistCard` (`components/HeistCard/HeistCard.tsx`) — already renders, already links the title to `/heists/${heist.id}`. No changes needed.
- `useHeists('expired')` (`hooks/useHeists/useHeists.ts`) — already implemented. Queries Firestore for heists where `deadline <= now` AND `finalStatus != null`. Ready to use.
- `HeistCardSkeleton` — already used in the active/assigned sections. Reuse for the expired section.
- `heists.module.css` — already has `.grid`, `.section`, `.sectionTitle`, `.empty`, `.emptyState`. Needs one new class for the 1-column variant.

---

## Implementation Steps

### 1. Add a 1-column grid variant — `heists.module.css`

Add a `.gridSingle` class (1-column only, no responsive breakpoints):

```css
.gridSingle {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
```

File: `app/(dashboard)/heists/heists.module.css`

### 2. Add "Expired Heists" section — `heists/page.tsx`

- Add a third `useHeists('expired')` call alongside the existing two.
- Render a new `<section>` below the existing two sections with:
  - Section title: `"Expired Heists"`
  - Loading state: skeleton grid using `gridSingle`
  - Data state: `HeistCard` components in `gridSingle` grid
  - Empty state: a short message, e.g. `"No expired heists yet."`

File: `app/(dashboard)/heists/page.tsx`

### 3. Create the stub detail page

Create `app/(dashboard)/heists/[id]/page.tsx`:
- No data fetching
- Renders a simple placeholder string, e.g. `"Heist details coming soon."`
- Lives inside the `(dashboard)` group so `<Navbar />` is included automatically via the group layout

### 4. Tests

Create `tests/heists/HeistsPage.test.tsx`:
- Mock `useHeists` to return controlled data
- Test: page with mix of active/assigned/expired — only expired section shows expired heists
- Test: page with no expired heists — empty state message is visible
- Render the `[id]` stub page and assert placeholder text is present

---

## Critical Files

| File | Action |
|---|---|
| `app/(dashboard)/heists/page.tsx` | Add `useHeists('expired')` + expired section |
| `app/(dashboard)/heists/heists.module.css` | Add `.gridSingle` class |
| `app/(dashboard)/heists/[id]/page.tsx` | Create stub (new file) |
| `tests/heists/HeistsPage.test.tsx` | Create tests (new file) |

Files to **not** modify: `HeistCard`, `useHeists`, `Heist` type — all are already correct.

---

## Verification

1. Run `npm run dev` — navigate to `/heists`, confirm a third "Expired Heists" section appears in a single column.
2. Click a heist card title — confirm it navigates to `/heists/:id` and shows the placeholder without error.
3. Run `npx vitest run` — all tests pass.
