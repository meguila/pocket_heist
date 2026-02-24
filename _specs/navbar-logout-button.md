# Spec for Navbar Logout Button

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

## Figma Design Reference (only if referenced)

N/A — no Figma link provided.

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

## Open Questions

- Should the button have a confirmation dialog before signing out, or is a direct logout acceptable? No
- Should a loading indicator (spinner/text change) replace the button label while signing out? No

## Testing Guideliness

Create a test file at `tests/components/Navbar.test.tsx` (or extend the existing one) covering:

- Renders the logout button when `useUser` returns a mocked authenticated user.
- Does NOT render the logout button when `useUser` returns `null`.
- Calls `signOut` when the logout button is clicked.
- Disables the logout button while the sign-out promise is pending.
