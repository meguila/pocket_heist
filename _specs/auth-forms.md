# Spec for Authentication Forms

branch: claude/feature/auth-forms
figma_component (if used): N/A

## Summary

- Add Login and Signup forms to the `/login` and `/signup` public pages respectively.
- Each form includes email and password fields, a toggle to show/hide the password, and a submit button.
- On submission, form data is logged to the console (no real auth yet).
- Both pages link to each other so users can easily switch between the two forms.

## Functional Requirements

- The `/login` page renders a Login form with:
  - An email input field (type email)
  - A password input field with a show/hide toggle icon
  - A "Login" submit button
  - A link to the `/signup` page ("Don't have an account? Sign up")
- The `/signup` page renders a Signup form with:
  - An email input field (type email)
  - A password input field with a show/hide toggle icon
  - A "Sign Up" submit button
  - A link to the `/login` page ("Already have an account? Log in")
- The password field includes a clickable icon that toggles the input type between `password` and `text`
- On form submission, the email and password values are logged to the browser console
- The form does not navigate or perform any network request on submit
- Both forms are rendered inside the existing `(public)` route group, so no navbar is shown

## Figma Design Reference (only if referenced)

- File: N/A
- Component name: N/A
- Key visual constraints: N/A

## Possible Edge Cases

- User submits the form with empty fields — still logs (or logs empty strings); no validation required at this stage
- User toggles password visibility multiple times — the field value must be preserved across toggles
- User navigates between Login and Signup — each page should render its own independent form state

## Acceptance Criteria

- Visiting `/login` renders a form with email, password (hidden by default), and a "Login" button
- Visiting `/signup` renders a form with email, password (hidden by default), and a "Sign Up" button
- Clicking the password toggle icon switches the field between masked and unmasked
- Submitting either form logs `{ email, password }` (or similar) to the browser console
- Each page contains a navigation link that takes the user to the other auth page
- No navbar is visible on either page

## Open Questions

- Should form fields show any inline validation errors in a future iteration, or remain purely console-only until auth is wired up? light validation
- Is there a preferred icon library for the show/hide password icon, or should a simple SVG be used? No
- Should both forms share a single reusable `AuthForm` component, or remain as separate page-level implementations? No

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders the email and password fields
- Renders the correct submit button label ("Login" vs "Sign Up")
- Password field is masked by default (type="password")
- Clicking the toggle icon switches the password field to type="text" and back
- Submitting the form calls console.log with the entered email and password
- The link to the other auth page is present and points to the correct route
