# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js)
npm run build     # Production build
npm run lint      # ESLint
npm run test      # Run all tests (Vitest, watch mode)
npx vitest run    # Run tests once (CI mode)
npx vitest run tests/components/Navbar.test.tsx  # Run a single test file
```

## Architecture

**Next.js App Router** with two route groups that enforce separate layouts:

- `app/(public)/` — unauthenticated pages (landing, login, signup, preview). No navbar.
- `app/(dashboard)/` — authenticated area. Layout wraps all pages in `<Navbar />`.

The root `app/layout.tsx` only provides global metadata and imports `globals.css`. All structural layout lives in the group layouts.

The root `/` page (`app/(public)/page.tsx`) is a splash/routing page — its intent is to redirect authenticated users to `/heists` and unauthenticated users to `/login`.

**Path alias:** `@/*` maps to the project root. Always use `@/` for imports (e.g. `@/components/Navbar`).

**Components** live in `components/<ComponentName>/` with three files: the component, a `.module.css`, and an `index.ts` barrel export.

**Icons:** Use `lucide-react` (already a dependency) for any icons needed.

## Styling

Tailwind CSS v4 via PostCSS — configuration is in `globals.css` using the `@theme` block (not `tailwind.config.js`).

Custom design tokens (use these Tailwind utility names):

- `bg-dark` / `bg-light` / `bg-lighter` — dark backgrounds (#030712, #0A101D, #101828)
- `text-primary` / `text-secondary` — purple (#C27AFF), pink (#FB64B6)
- `text-heading` / `text-body` — white / #99A1AF
- `text-success` / `text-error` — green / red

Global utility classes defined in `globals.css`:

- `.page-content` — centered container with max-width
- `.center-content` — full-height vertical centering
- `.form-title` — centered bold form heading
- `.btn` — primary action button (purple bg, dark text, hover opacity)

Component-specific styles go in `.module.css` files, not inline Tailwind classes. Each `.module.css` must start with `@reference "../../app/globals.css"` so that `@apply` can resolve custom design tokens.

## Testing Setup

- Tests in `tests/` directory mirror `components/` structure
- Vitest configured with jsdom environment and React Testing Library
- Globals enabled (no need to import `describe`, `it`, `expect`)
- Setup file: `vitest.setup.ts` imports `@testing-library/jest-dom`

## Additional Coding Preferences

- Do NOT use semicolons for JavaScript or TypeScript code.
- Do NOT apply tailwind classes directly in component templates unless essential or just 1 at most. If an element needs more than a single tailwind class, combine them into a custom class using the `@apply` directive.
- Use minimal project dependencies where possible.
- Use the `git switch -c` command to switch to new branches, not `git checkout`.

## Checking Documentation

- **important:** When implementing any lib/framework-specific features, ALWAYS check the appropiate lib/framework documentation using the Context7 MCP server before writing any code.
