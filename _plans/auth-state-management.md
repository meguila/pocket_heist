# Plan: Auth State Management with useUser Hook

## Context

The app has Firebase initialized (`lib/firebase.ts` exports `auth` and `db`) but no React context or hook for consuming auth state. Components and pages have no way to know if a user is logged in. The splash page (`app/(public)/page.tsx`) has a comment saying it should redirect based on auth status but doesn't yet. This plan adds the minimal wiring: a global `onAuthStateChanged` listener, a context provider, and a `useUser` hook any component can call.

No login/logout/signup flow is part of this change.

---

## Files to Create

### 1. `context/AuthContext.tsx` (new file)

- `'use client'` directive
- `AuthContextValue` type: `{ user: User | null, isLoading: boolean }`
- `AuthContext = createContext<AuthContextValue | null>(null)` — `null` default enables the "outside provider" error in the hook
- `AuthProvider` component:
  - State: `user: User | null = null`, `isLoading: boolean = true`
  - `useEffect` calls `onAuthStateChanged(auth, (firebaseUser) => { setUser(firebaseUser); setIsLoading(false) })`
  - Returns the unsubscribe function directly as the effect cleanup
  - Provides `{ user, isLoading }` via `AuthContext.Provider`
- Export both `AuthContext` (named) and `AuthProvider` (named)

### 2. `hooks/useUser.ts` (new file)

- No `'use client'` needed — client boundary is in `AuthContext.tsx`
- `useContext(AuthContext)` — if result is `null`, throw: `"useUser must be used within an AuthProvider. Wrap your component tree with <AuthProvider> in app/layout.tsx."`
- Returns the context value: `{ user: User | null, isLoading: boolean }`

---

## Files to Modify

### 3. `app/layout.tsx`

- Import `AuthProvider` from `@/context/AuthContext`
- Wrap `{children}` inside `<body>` with `<AuthProvider>`
- Keep the file as a server component (no `'use client'`)

### 4. `app/(public)/page.tsx`

- Add `'use client'` as the first line
- Import `useUser` from `@/hooks/useUser` and `useRouter` from `next/navigation`
- Add `useEffect` that:
  - Returns early if `isLoading` is true (wait for Firebase to confirm state)
  - Calls `router.replace("/heists")` if `user` is truthy
  - Calls `router.replace("/login")` if `user` is null
  - Dependency array: `[user, isLoading, router]`
- Keep existing JSX as-is (renders briefly during load window)

---

## File to Create (Tests)

### 5. `tests/hooks/useUser.test.tsx` (new file)

Use `renderHook` from `@testing-library/react` with a custom `wrapper` that provides `AuthContext.Provider` directly (no real Firebase calls):

- Returns `{ user: null, isLoading: false }` when context provides no user
- Returns the mock user object when context provides one
- Throws "useUser must be used within an AuthProvider" when used with no wrapper (context defaults to `null`)
- `isLoading` is `true` when context provides `isLoading: true`
- `isLoading` is `false` when context provides `isLoading: false`

---

## Key Edge Cases

- **`isLoading` guard is mandatory** in the splash page effect — Firebase fires `onAuthStateChanged` async even for unauthenticated users, so without the guard every visitor would briefly see a redirect to `/login` before Firebase confirms their session
- **Do not add `'use client'` to `app/layout.tsx`** — importing a client component (`AuthProvider`) into a server layout is valid and the correct Next.js pattern
- **Use `router.replace()` not `router.push()`** — prevents splash page from appearing in browser history
- **Tests bypass real Firebase** — inject context values via `AuthContext.Provider` wrapper directly; no Firebase SDK mocking needed

---

## File Creation Order

1. `context/AuthContext.tsx`
2. `hooks/useUser.ts`
3. Modify `app/layout.tsx`
4. Modify `app/(public)/page.tsx`
5. `tests/hooks/useUser.test.tsx`

---

## Verification

```bash
npx vitest run tests/hooks/useUser.test.tsx   # all 5 tests pass
npm run lint                                   # no lint errors
npm run dev                                    # app loads; splash page redirects to /login when logged out
```

- DO not use the hook anywhere in the app yet.
