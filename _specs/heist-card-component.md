# Spec for Heist Card Component

branch: claude/feature/heist-card-component
figma_component: https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=54-60&m=dev

## Summary

- Create a `HeistCard` component that displays a single heist's summary info (title, status, payout, etc.)
- Create a `HeistCardSkeleton` loading placeholder that matches the card's layout
- Update the `/heists` page to render cards in a responsive 3-column grid, filtered to active and assigned heists only (exclude expired)
- Heist titles must link to `/heists/:id` (the details page — no content required there yet)

## Functional Requirements

- `HeistCard` receives a single heist document and renders its key fields
- Only heists with status `active` or `assigned` are shown; `expired` heists are excluded
- The heist title is a clickable link that navigates to `/heists/[id]`
- `HeistCardSkeleton` mirrors the card's structure and is shown while data is loading (reuse existing `useHeists` hook loading state)
- Cards and skeletons are displayed in a 3-column grid on the `/heists` dashboard page
- The grid collapses gracefully on smaller viewports (2-column → 1-column)
- An empty state message is shown when there are no active or assigned heists

## Figma Design Reference

- File: https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=54-60&m=dev
- Component name: Heist Card (node-id 54-60)
- Key visual constraints:
  - Design reference could not be retrieved automatically (Figma plan access restriction). See Figma manually for exact spacing, typography, and color token usage.
  - Apply project design tokens: `bg-light` / `bg-lighter` for card surfaces, `text-primary` / `text-secondary` for accents, `text-heading` / `text-body` for text hierarchy
  - Use `border-radius` and subtle shadow consistent with existing components
  - Status badge should use `text-success` (active) or `text-secondary` (assigned) token colors
  - Title link should use `text-primary` color with hover underline

## Possible Edge Cases

- No heists returned from Firestore (empty state message)
- All heists are expired — grid is empty, show empty state
- Heist title is very long — should truncate or wrap gracefully without breaking layout
- Loading state when `useHeists` is fetching — show skeleton grid
- Firestore error state — handle gracefully (display error or empty state, do not crash)

## Acceptance Criteria

- [ ] `HeistCard` component exists at `components/HeistCard/` with component, `.module.css`, and `index.ts` barrel
- [ ] `HeistCardSkeleton` component exists at `components/HeistCardSkeleton/` with the same file structure
- [ ] `/heists` page renders a 3-column grid of `HeistCard` components
- [ ] Only `active` and `assigned` heists are displayed; `expired` heists are filtered out
- [ ] Heist title in the card is an anchor/link to `/heists/[id]`
- [ ] `/heists/[id]` route exists as an empty page (no content required)
- [ ] While loading, `HeistCardSkeleton` components are shown in the same 3-column grid
- [ ] An empty state is shown when there are zero active/assigned heists
- [ ] Grid is responsive: 3 columns → 2 columns → 1 column on smaller breakpoints
- [ ] No Tailwind classes applied directly in JSX beyond a single utility; multi-class elements use `.module.css` with `@apply`

## Open Questions

- How many skeleton cards should be shown during loading? (default suggestion: 6) - 6 cards should be responseive mobile (2x3 grid) y desktop (3x2 grid)
- Should the card show crew member count, creator, or other metadata beyond title/status/payout? - yes
- Is there a confirmed payout or reward field on the heist document to display? - yes
- Should the empty state include a CTA to create a new heist? - yes

## Testing Guidelines

Create test files in `tests/components/HeistCard.test.tsx` and `tests/components/HeistCardSkeleton.test.tsx`:

- Renders heist title as a link to `/heists/:id`
- Renders the correct status badge for `active` and `assigned` statuses
- Does not render (or is filtered out) when status is `expired`
- Skeleton renders without crashing and matches expected DOM structure
- `/heists` page renders skeletons while loading and cards once data arrives
- `/heists` page shows empty state when heist list is empty or all heists are expired
