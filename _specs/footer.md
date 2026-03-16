# Spec for Footer

branch: claude/feature/footer
figma_component (if used): N/A

## Summary

- A global site footer displayed across all pages in the dashboard and public areas of the Pocket Heist app.
- Contains branding, links, and a copyright notice.
- Follows the existing dark design language using the project's custom design tokens.
- Rendered via the route group layouts so it is automatically included without touching individual pages.
- Responsive: stacks vertically on mobile, horizontal layout on larger screens.

## Functional Requirements

- The footer must appear at the bottom of every page in both the `(dashboard)` and `(public)` route groups.
- Display the app name/logo mark on the left side.
- Display a short set of navigation links (e.g. Home, Heists, About / Privacy Policy).
- Display a copyright line: `© <current year> Pocket Heist. All rights reserved.`
- The current year must be rendered dynamically (not hardcoded).
- Links must be standard Next.js `<Link>` components.
- The footer must sit below all page content and not overlap it (sticky-bottom or flexbox column layout on the body/layout).
- The footer must use the project's design tokens (`bg-dark`, `text-body`, `text-primary`, etc.) via `@apply` in a `.module.css` file.
- Component lives at `components/Footer/` with `Footer.tsx`, `Footer.module.css`, and `index.ts` barrel export.

## Figma Design Reference (only if referenced)

N/A — no Figma link provided. Implement following the existing dark-theme design language of the project.

## Possible Edge Cases

- Very long navigation link lists should wrap gracefully on small screens.
- The footer should not push content off-screen on pages with minimal content (use a flex column layout on the root layout with `flex-grow` on the main content area).
- Dynamic year should use `new Date().getFullYear()` to avoid stale values at build time (or use a client component for SSR hydration safety).

## Acceptance Criteria

- [ ] Footer renders on all dashboard pages.
- [ ] Footer renders on all public pages (login, signup, landing).
- [ ] App name is visible in the footer.
- [ ] At least two navigation links are present and functional.
- [ ] Copyright line shows the correct current year.
- [ ] Footer is visually consistent with the dark theme (no unstyled elements).
- [ ] No inline Tailwind classes — all styles via `Footer.module.css` using `@apply`.
- [ ] Component is exported via `index.ts` barrel file.

## Open Questions

- Should the footer include social media links or external URLs? No
- Which navigation links should be included — just internal routes or also external (e.g. GitHub)? - just intenral
- Should the footer be hidden on certain pages (e.g. a full-screen modal or onboarding flow)? only on onbiarding pages

## Testing Guidelines

Create a test file at `tests/components/Footer.test.tsx`. Cover the following without going too heavy:

- Renders without crashing.
- Displays the app name.
- Renders navigation links with correct `href` attributes.
- Displays a copyright notice containing the current year.
