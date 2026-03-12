# Spec for Expired Heist Cards

branch: claude/feature/expired-heist-cards
figma_component: https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=54-60&m=dev

## Summary

- Display heist cards on the `/heists` page filtered to show only expired heists.
- The `HeistCard` component (already exists) should be used to render each heist.
- Cards should be arranged in a single-column grid layout.
- Each heist card title must be a clickable link that navigates to the heist detail page at `/heists/:id`.
- A stub `/heists/:id` route (detail page) must be created but with no real content yet — just a placeholder.
- The design for the heist card follows the Figma reference linked above.

## Functional Requirements

- On the `/heists` page, filter the list of heists to only display those whose status is `expired` (or equivalent field indicating the heist has ended/closed).
- Render each expired heist using the `HeistCard` component.
- The card layout on the page must use a 1-column grid (no multi-column breakpoints required at this stage).
- The heist title rendered inside each card must be wrapped in a `<Link>` pointing to `/heists/:id`, using the heist's unique ID.
- Create the route `app/(dashboard)/heists/[id]/page.tsx` as a stub — it should render a minimal placeholder (e.g. "Heist details coming soon") with no data fetching or real content.
- The detail page stub must use the existing dashboard layout (it lives inside the `(dashboard)` route group so the Navbar is included automatically).

## Figma Design Reference

- File: https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=54-60&m=dev
- Component name: Heist Card
- Key visual constraints: Design reference could not be retrieved automatically (Figma plan limit). Review the Figma node manually for spacing, typography, color tokens, and card structure before implementing visual details. Use existing project design tokens (`bg-light`, `text-heading`, `text-body`, `text-primary`, `text-secondary`, `text-error`) to align with the design system.

## Possible Edge Cases

- No expired heists exist: the `/heists` page should render an empty state message rather than an empty grid.
- The `[id]` route is accessed for a heist ID that does not exist: the stub page just renders the placeholder regardless (no data fetching yet, so no 404 handling needed at this stage).
- The expired filter logic must be clearly encapsulated so it is easy to swap or extend when the filter UI is added later.

## Acceptance Criteria

- [ ] The `/heists` page shows only heists with an expired status, rendered as `HeistCard` components.
- [ ] Cards are displayed in a 1-column grid layout.
- [ ] Each heist card title is a `<Link>` navigating to `/heists/:id`.
- [ ] The route `/heists/[id]` exists and renders a placeholder without errors.
- [ ] An empty state message is shown when there are no expired heists.
- [ ] No visual regressions on the `/heists` page layout.

## Open Questions

- What field and value on the heist object identifies it as expired (e.g. `status === 'expired'`, a date comparison, etc.)? Confirm before implementing the filter. - date comparison
- Should the heist card title link open in the same tab or a new tab? - same tab
- Is the empty state design specified in Figma, or should a sensible default be used? - used and propose design

## Testing Guidelines

Create a test file in `tests/` mirroring the component/page under test. Keep tests focused and lightweight:

- Render the `/heists` page with a mix of expired and non-expired heists; assert only expired ones appear.
- Render the `/heists` page with no expired heists; assert the empty state message is visible.
- Render a `HeistCard` with a title and assert the title renders as a link pointing to `/heists/:id`.
- Render the `/heists/[id]` stub page and assert the placeholder text is present.
