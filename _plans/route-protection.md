# Plan: Route Protection

## Context

Firebase auth state is resolved client-side via `onAuthStateChanged`. Currently, both group layouts are Server Components with no auth awareness — an unauthenticated user can reach dashboard pages and an authenticated user can reach public pages. The fix is to convert both group layouts to Client Components, wire them to `useUser`, and redirect accordingly. A `PageLoader` component is needed to cover the brief window while Firebase resolves auth state, preventing a flash of wrong content.

---

## Critical Files

| File | Action |
|------|--------|
| `app/(public)/layout.tsx` | Modify — convert to Client Component, add redirect to `/heists` |
| `app/(dashboard)/layout.tsx` | Modify — convert to Client Component, add redirect to `/login` |
| `components/PageLoader/PageLoader.tsx` | Create — new spinner component |
| `components/PageLoader/PageLoader.module.css` | Create |
| `components/PageLoader/index.ts` | Create — barrel export |
| `tests/layouts/PageLoader.test.tsx` | Create |
| `tests/layouts/PublicLayout.test.tsx` | Create |
| `tests/layouts/DashboardLayout.test.tsx` | Create |

**Reference patterns:**
- Hook return shape: `hooks/useUser.ts` → `{ user: User | null, isLoading: boolean }`
- Spinner accessibility: `LoginForm` uses `role="status"` — use same pattern on `PageLoader` wrapper
- CSS module pattern: `components/Navbar/Navbar.module.css` (starts with `@reference "../../app/globals.css"`)
- Test mock pattern: `tests/components/Navbar.test.tsx` (mocking `useUser` + `next/navigation`)

---

## Implementation Steps

### 1. Create `components/PageLoader/`

**`PageLoader.tsx`**
- No `'use client'` needed (purely visual, no hooks)
- Render outer `div` with `role="status"` and `aria-label="Loading"` — applies `styles.loader` (full-viewport centering via `@apply center-content`)
- Render inner `div` with `styles.spinner` (the animated ring)

**`PageLoader.module.css`**
- First line: `@reference "../../app/globals.css"`
- `.loader` → `@apply center-content` + `align-items: center`
- `@keyframes spin` → rotates 0deg → 360deg
- `.spinner` → `2.5rem` circle, `3px solid transparent`, `border-top-color: var(--color-primary)`, `border-radius: 50%`, `animation: spin 0.8s linear infinite`

**`index.ts`** → `export { default } from "./PageLoader"`

---

### 2. Update `app/(public)/layout.tsx`

```
'use client'

useUser() → { user, isLoading }
useRouter() → router

useEffect([isLoading, user]):
  if (isLoading) return
  if (user) router.push('/heists')

return:
  if (isLoading || user) → <PageLoader />
  else → <main className="public">{children}</main>
```

The `isLoading || user` guard on the render prevents any flash: loader shows while Firebase is checking AND while the redirect is in-flight.

---

### 3. Update `app/(dashboard)/layout.tsx`

```
'use client'

useUser() → { user, isLoading }
useRouter() → router

useEffect([isLoading, user]):
  if (isLoading) return
  if (!user) router.push('/login')

return:
  if (isLoading || !user) → <PageLoader />
  else → <><Navbar /><main>{children}</main></>
```

---

### 4. Tests — `tests/layouts/`

**`PageLoader.test.tsx`**
- No mocks needed
- Assert `getByRole('status', { name: /loading/i })` renders
- Smoke test: no throw on render

**`PublicLayout.test.tsx`**

Mocks: `@/hooks/useUser`, `next/navigation` (mockPush), `@/components/PageLoader` (sentinel div)

| Scenario | `isLoading` | `user` | Expected |
|----------|-------------|--------|----------|
| Loading | true | null | Loader shown, children hidden, no redirect |
| Unauthenticated | false | null | Children shown, no loader, no redirect |
| Authenticated | false | mockUser | `mockPush('/heists')` called |
| Loading + user | true | mockUser | Loader shown, no redirect yet |

**`DashboardLayout.test.tsx`**

Mocks: `@/hooks/useUser`, `next/navigation` (mockPush), `@/components/PageLoader` (sentinel), `@/components/Navbar` (sentinel `<nav data-testid="navbar">`)

| Scenario | `isLoading` | `user` | Expected |
|----------|-------------|--------|----------|
| Loading | true | null | Loader shown, children hidden, no redirect |
| Authenticated | false | mockUser | Navbar + children shown, no redirect |
| Unauthenticated | false | null | `mockPush('/login')` called |
| Loading + no user | true | null | Loader shown, no redirect yet |

> Note: Mock `Navbar` to avoid cascading Firebase/useUser mock setup in the layout test.

---

## Verification

```bash
npx vitest run tests/layouts/PageLoader.test.tsx
npx vitest run tests/layouts/PublicLayout.test.tsx
npx vitest run tests/layouts/DashboardLayout.test.tsx
npx vitest run   # full suite — confirm no regressions
npm run build    # confirm no TypeScript errors
```

Manual checks:
- Visit `/login` while logged in → redirects to `/heists`
- Visit `/heists` while logged out → redirects to `/login`
- Brief spinner visible on first load before Firebase resolves
