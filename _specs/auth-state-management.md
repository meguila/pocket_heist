# Spec for Auth State Management with useUser Hook

branch: claude/feature/auth-state-management

## Summary

- Introduce a global auth state provider that listens to Firebase auth state changes in real time using `onAuthStateChanged`
- Expose the current user through a `useUser` hook that any page or component can call
- The hook returns `null` when logged out, or a Firebase `User` object when logged in
- The provider wraps the app at a high enough level (root or dashboard layout) to ensure all routes can access the user
- No login, signup, or logout logic is part of this spec — only the listener and the hook

## Functional Requirements

- A React context (`AuthContext`) must be created to hold the current user state
- An `AuthProvider` component must wrap the app so that all pages and components can access user state
- The provider must call `onAuthStateChanged` on mount to listen for Firebase auth state updates
- The listener must clean up on unmount (unsubscribe)
- A `useUser` hook must be exported that reads from `AuthContext` and returns the current `User | null`
- The `useUser` hook must throw or warn clearly if used outside of `AuthProvider`
- Once set up, any component or page in `app/(public)/` or `app/(dashboard)/` must be able to call `useUser()` and get the current auth state
- The `AuthProvider` must be a client component since Firebase auth is browser-side
- The current auth state must be available synchronously after the first Firebase response — a loading state (`isLoading: boolean`) should also be exposed so consumers can wait before rendering auth-dependent UI
- After the listener fires for the first time, `isLoading` becomes `false`

## Figma Design Reference

N/A — this is a non-visual, state management feature.

## Possible Edge Cases

- Firebase may take a moment to resolve the auth state on page load — components must handle `isLoading: true` gracefully
- If `useUser` is called outside of `AuthProvider`, the error must be clear and developer-friendly
- If the Firebase `auth` instance is not initialized, the provider must fail loudly in development
- The listener must not fire stale state after unmounting (memory leak guard via unsubscribe)
- Multiple components calling `useUser` at the same time must all receive the same consistent state, not independent listeners

## Acceptance Criteria

- `useUser()` returns `null` when no user is logged in
- `useUser()` returns the Firebase `User` object when a user is authenticated
- `isLoading` is `true` before Firebase first resolves the auth state, then `false`
- `AuthProvider` successfully mounts with `onAuthStateChanged` and cleans up on unmount
- Calling `useUser()` outside of `AuthProvider` throws a descriptive error
- All existing pages and components that need user state can use `useUser()` without prop drilling
- The root splash page (`app/(public)/page.tsx`) can call `useUser()` and use the result to redirect authenticated vs unauthenticated users

## Open Questions

- Should the `AuthProvider` live in the root `app/layout.tsx` (covering all routes) or only in `app/(dashboard)/layout.tsx`? Root placement is preferred so the public splash page can also redirect based on auth state - the root placement is the correct choice
- Should the hook expose the raw Firebase `User` object, or a mapped app-specific user shape? For now, raw Firebase `User` is fine - the raw Firebase `User` object is the correct choice
- Is a loading spinner or skeleton needed at the app level while `isLoading` is true, or does each page handle its own loading state? - each page handles its own loading state

## Testing Guidelines

Create a test file at `tests/hooks/useUser.test.tsx` and cover the following cases without going too heavy:

- `useUser` returns `null` when `AuthContext` provides `null` as the user
- `useUser` returns a mock `User` object when `AuthContext` provides one
- `useUser` throws an error when used outside of `AuthProvider`
- `isLoading` is `true` initially and transitions to `false` after the auth listener resolves
