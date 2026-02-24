# Spec for Login Form Authentication

branch: claude/feature/login-form-auth

## Summary

- Wire the existing `LoginForm` component to Firebase Authentication so users can sign in with email and password.
- On successful login, display an inline success message within the form (no redirect for now).
- On failure, display a clear inline error message describing what went wrong.
- Show a loading/disabled state on the submit button while the auth request is in flight.

## Functional Requirements

- When the form is submitted with valid credentials, call Firebase's `signInWithEmailAndPassword`.
- If login succeeds, show a success message (e.g. "You're logged in!") inline below the form fields.
- If login fails, show a user-friendly error message inline (e.g. "Invalid email or password."). Do not expose raw Firebase error codes to the user.
- While the auth request is pending, the submit button should be disabled and show a loading label (e.g. "Logging in…").
- Existing UI elements (email field, password field, show/hide password toggle, sign-up link) must remain unchanged.
- The success and error messages should be accessible (use `role="status"` or `role="alert"` as appropriate).

## Figma Design Reference

None provided.

## Possible Edge Cases

- User submits with an email that does not exist in Firebase — show the generic error message.
- User submits with the correct email but wrong password — show the generic error message.
- Firebase is unreachable or returns an unexpected error — show a fallback error message (e.g. "Something went wrong. Please try again.").
- User clicks submit multiple times quickly — subsequent clicks should be ignored while a request is in flight (button disabled).
- User sees the success message, then navigates away and back — the form should reset to its default state (success message cleared).

## Acceptance Criteria

- Submitting valid credentials calls `signInWithEmailAndPassword` and shows the success message.
- Submitting invalid credentials shows the inline error message without crashing.
- The submit button is disabled and shows a loading label while the request is pending.
- The success message has `role="status"` so screen readers announce it.
- The error message has `role="alert"` so screen readers announce it immediately.
- No redirect occurs after a successful login.
- All existing form fields and the show/hide toggle continue to work as before.

## Open Questions

- Should the success message include the user's codename or display name, or just a generic confirmation? generic confirmation
- Should the form fields be cleared or remain filled after a successful login? remain filled
- Will a redirect be added in a follow-up spec, and if so, what is the target route? yes, to /heists

## Testing Guidelines

Create a test file at `tests/components/LoginForm.test.tsx` and cover the following cases without going too heavy:

- Renders the form with email, password fields and the submit button.
- Shows a loading state on the submit button when the form is submitted.
- Shows the success message when `signInWithEmailAndPassword` resolves successfully.
- Shows the inline error message when `signInWithEmailAndPassword` rejects.
- Shows a fallback error message for unexpected Firebase errors.
- Disables the submit button while the request is in flight to prevent double submission.
