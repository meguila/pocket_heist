# Spec for Route Protection

branch: claude/feature/route-protection

## Summary

- Pages in the `(public)` route group (login, signup, landing, preview) should only be accessible to unauthenticated users. Authenticated users visiting these pages should be redirected to `/heists`.
- Pages in the `(dashboard)` route group should only be accessible to authenticated users. Unauthenticated users visiting these pages should be redirected to `/login`.
- The `useUser` hook (which reads Firebase auth state) is the source of truth for auth status and drives all redirect logic.
- While Firebase is resolving the auth state (i.e. the user's status is not yet known), each group layout should render a simple, minimal loading indicator instead of the page content or performing any redirect.
- Once auth status is known, the appropriate redirect or page render happens immediately.

## Functional Requirements

- The `(public)` group layout must:
  - Render a loader while auth status is loading.
  - Redirect authenticated users to `/heists` once auth is resolved.
  - Render child page content only when the user is confirmed unauthenticated.

- The `(dashboard)` group layout must:
  - Render a loader while auth status is loading.
  - Redirect unauthenticated users to `/login` once auth is resolved.
  - Render child page content (including the Navbar) only when the user is confirmed authenticated.

- The loader should be visually simple — a centered spinner or pulsing indicator is sufficient. No branding or complex UI required.

- Redirects must use Next.js's `useRouter` (client-side navigation), not `redirect()` from `next/navigation` (which is server-side only), since auth state is client-side.

- Both group layouts are Client Components (`"use client"`), as they depend on the `useUser` hook.

- The `useUser` hook already tracks a `loading` boolean alongside `user`. Both values must be consumed by the layouts.

## Possible Edge Cases

- Firebase may take a brief moment on first page load to resolve auth state — the loader prevents a flash of wrong content or premature redirect.
- A user whose session expires mid-visit to the dashboard should eventually be redirected to `/login` when they navigate or the auth state updates.
- If `useUser` returns `loading: false` and `user: null`, the user is definitively unauthenticated.
- If `useUser` returns `loading: false` and `user` is defined, the user is definitively authenticated.

## Acceptance Criteria

- Visiting `/login` or `/signup` while authenticated immediately redirects to `/heists` (after the loader disappears).
- Visiting `/heists` or any dashboard page while unauthenticated immediately redirects to `/login` (after the loader disappears).
- The loader is displayed on both group layouts while `loading` is `true` from `useUser`.
- No dashboard page content is ever rendered for unauthenticated users, and no public page content is ever rendered for authenticated users.
- The loader is visually minimal and centered on the page.

## Open Questions

- Should the loader match any specific brand style (e.g., use a purple spinner to match `text-primary`)? For now, assume a simple neutral or themed spinner is acceptable. Spinner usinf a clock icon.
- Should the public group also protect the `/` root splash page, or does that page handle its own routing logic? For now, The root splash page (/) should handle its own routing logic independently. It should not be part of the (public) group protection to ensure that marketing content remains accessible and to allow for a custom redirect experience based on the useUser hook state.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `(public)` layout renders loader while `useUser` returns `loading: true`.
- `(public)` layout redirects to `/heists` when `useUser` returns an authenticated user.
- `(public)` layout renders children when `useUser` returns no user and `loading: false`.
- `(dashboard)` layout renders loader while `useUser` returns `loading: true`.
- `(dashboard)` layout redirects to `/login` when `useUser` returns no user.
- `(dashboard)` layout renders children (and Navbar) when `useUser` returns an authenticated user and `loading: false`.
