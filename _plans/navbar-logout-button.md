# Plan: Navbar Logout Button

branch: claude/feature/navbar-logout-button

## Summary

- Add a logout button to the `Navbar` component that signs the current user out of the application.
- The button is only visible when a user is authenticated (i.e. `useUser` returns a non-null user).
- Clicking the button invokes Firebase Auth's `signOut` method.
- No redirect logic is required at this stage — session state changes are handled by the existing global auth listener.

## Functional Requirements

- The `Navbar` component must import and call `useUser` to determine authentication state.
- A "Logout" button renders only when `user` is not null.
- Clicking the button calls Firebase Auth `signOut`.
- While the sign-out is in progress the button should be disabled to prevent double-clicks.
- Any error returned by `signOut` should be caught and logged to the console (no user-facing error UI required at this stage).
- The button must use the project's existing `.btn` global utility class for consistent styling.

## Possible Edge Cases

- `signOut` rejects (network error, Firebase outage) — error is caught and logged; UI remains interactive.
- User clicks the button multiple times rapidly — button is disabled during the async call so only one sign-out request is sent.
- `useUser` returns `null` (unauthenticated) — button is not rendered at all, so no logout action can be triggered.

## Acceptance Criteria

- The logout button appears in the Navbar when the user is authenticated.
- The logout button is absent from the Navbar when no user is authenticated.
- Clicking the button calls `signOut` from Firebase Auth exactly once.
- The button is disabled while `signOut` is pending.
- After a successful `signOut` the button disappears (auth state updates globally via the existing listener).

---

## Files to Modify

| File                               | Change                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `components/Navbar/Navbar.tsx`     | Make client component; add `useUser`, `signOut`, `isLoggingOut` state, conditional button |
| `tests/components/Navbar.test.tsx` | Add mocks and auth-aware tests                                                            |

## Implementation Steps

### 1. `components/Navbar/Navbar.tsx`

- Add `'use client'` directive at the top (required for hooks and state).
- Import `useState` from `react`.
- Import `useUser` from `@/hooks/useUser`.
- Import `signOut` from `firebase/auth`.
- Import `auth` from `@/lib/firebase`.
- Add local state: `const [isLoggingOut, setIsLoggingOut] = useState(false)`.
- Destructure `user` from `useUser()`: `const { user } = useUser()`.
- Add `handleLogout` async function that sets `isLoggingOut(true)`, calls `await signOut(auth)` in a try/catch (logging errors), and sets `isLoggingOut(false)` in finally.
- In JSX inside the `<ul>`, after the "Create Heist" `<li>`, render a second `<li>` conditionally on `user`:
  - A `<button>` with `className="btn"`, `onClick={handleLogout}`, and `disabled={isLoggingOut}`, labelled "Logout".

No CSS changes needed — `.btn` from `globals.css` handles styling.

### 2. `tests/components/Navbar.test.tsx`

Navbar now uses `useUser` (which requires `AuthProvider`). Mock the hook at the module level to keep tests isolated:

Add a `beforeEach` that sets a default `useUser` mock return of `{ user: null, isLoading: false }` so existing tests continue to pass.

New tests:

1. **Shows logout button when authenticated** — mock `useUser` to return a fake user; assert button with text "Logout" is in the document.
2. **Hides logout button when unauthenticated** — mock `useUser` with `user: null`; assert no "Logout" button.
3. **Calls `signOut` on click** — mock `useUser` with a user; click button; assert mocked `signOut` was called once.
4. **Disables button while signing out** — mock `signOut` to return a never-resolving promise; click button; assert button has `disabled` attribute.

## Verification

```bash
npx vitest run tests/components/Navbar.test.tsx   # all new + existing tests pass
npm run build                                      # no TypeScript errors
npm run dev                                        # manual: logout button visible when logged in, hidden when not
```
