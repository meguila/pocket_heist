# Plan: Footer Component

## Context
The project needs a global site footer to appear at the bottom of all dashboard pages. Based on the spec's open question answers, the footer is hidden on onboarding (login/signup) pages — which map to the `(public)` route group — so it will only be added to the `(dashboard)` layout. It should display the app name, internal navigation links, and a dynamic copyright year.

## Files to Create

### 1. `components/Footer/Footer.tsx`
- Simple functional component (no `'use client'` needed — no hooks or browser APIs)
- App name with the same clock icon logo used in Navbar (`Clock8` from `lucide-react`)
- Internal nav links using Next.js `<Link>`:
  - `/heists` → "Heists"
  - `/heists/create` → "Create Heist"
- Copyright line: `© {new Date().getFullYear()} Pocket Heist. All rights reserved.`
- Uses `styles` from `Footer.module.css`

### 2. `components/Footer/Footer.module.css`
- Starts with `@reference "../../app/globals.css"`
- All layout and color via `@apply` using design tokens (`bg-light`, `text-body`, `text-primary`, etc.)
- Responsive: flex column on mobile, flex row on larger screens
- Matches the visual language of `Navbar.module.css` (same `bg-light` background, same `max-w-6xl` container)

### 3. `components/Footer/index.ts`
- Barrel export: `export { default } from "./Footer"`

### 4. `tests/components/Footer.test.tsx`
- Renders without crashing
- Displays the app name ("Pocket Heist")
- Renders `/heists` link with correct href
- Renders `/heists/create` link with correct href
- Displays copyright notice containing the current year

## Files to Modify

### 5. `app/(dashboard)/layout.tsx`
- Import `Footer` from `@/components/Footer`
- Add `<Footer />` after `</main>` in the return JSX
- Wrap the fragment in a `<div className="site-layout">` to enable sticky footer (see globals.css change below)

### 6. `app/globals.css`
- Add `.site-layout` utility class:
  ```css
  .site-layout {
    @apply flex flex-col min-h-screen;
  }
  ```
- Add `flex-grow` to `main` within `.site-layout` so content fills available space and footer stays at the bottom:
  ```css
  .site-layout main {
    flex-grow: 1;
  }
  ```

## Key Patterns to Follow (from codebase)
- CSS module reference: `@reference "../../app/globals.css"` — see `Navbar.module.css`
- Component import style: `import styles from "./Footer.module.css"` — see `Navbar.tsx`
- Barrel export pattern: `export { default } from "./Footer"` — see `Navbar/index.ts`
- Test mock setup: `vi.mock()` + `vi.mocked()` + React Testing Library — see `tests/components/Navbar.test.tsx`
- No semicolons in JS/TS files

## Verification
1. `npx vitest run tests/components/Footer.test.tsx` — all 4 tests pass
2. `npm run build` — no TypeScript or lint errors
3. Manually visit `/heists` in the browser — footer appears below page content
4. Verify footer is NOT present on `/login` or `/signup`
5. Resize to mobile width — footer content stacks gracefully
