# Spec for Create Heist Form

branch: claude/feature/create-heist-form
figma_component (if used): N/A

## Summary

- Build a form in `app/(dashboard)/heists/create/page.tsx` that lets an authenticated user create a new heist document in Firestore.
- The form exposes three user-facing fields: title, description, and assigned-to (a dropdown populated from the `users` Firestore collection).
- On submission the document is written to the `heists` collection using the `CreateHeistInput` shape; `createdAt`, `deadline`, `finalStatus`, `createdBy`, and `createdByCodename` are set programmatically — not by the user.
- After a successful write the user is redirected to `/heists`.

## Functional Requirements

- The page renders a `CreateHeistForm` client component containing:
  - A **Title** text input (maps to `CreateHeistInput.title`)
  - A **Description** textarea (maps to `CreateHeistInput.description`)
  - An **Assign To** dropdown whose options are fetched from the Firestore `users` collection; each option displays the user's codename and carries their `uid` and `codename` as values
- On mount the form fetches all documents from the `users` collection to populate the assignee dropdown
- `createdBy` and `createdByCodename` are derived from the currently logged-in Firebase Auth user and their corresponding Firestore `users` document — not entered by the user
- `assignedToCodename` is resolved automatically from the selected user in the dropdown
- `deadline` is set programmatically to 48 hours from the moment of submission (`new Date(Date.now() + 48 * 60 * 60 * 1000)`)
- `createdAt` is set to `serverTimestamp()` from Firestore
- `finalStatus` is always initialised to `null`
- On submit the form calls `addDoc` (or equivalent) on the `heists` collection with the full `CreateHeistInput` payload and the `heistConverter`
- After a successful write the router redirects the user to `/heists`
- While the form is submitting a loading state is shown and the submit button is disabled
- If the Firestore write fails an inline error message is displayed without navigating away
- The `COLLECTIONS` constant in `types/firestore/index.ts` should be extended with a `USERS` key to avoid magic strings when querying the users collection

## Figma Design Reference (only if referenced)

- File: N/A
- Component name: N/A
- Key visual constraints: N/A

## Possible Edge Cases

- The `users` collection is empty or fails to load — the dropdown should show a disabled placeholder and the submit button should be blocked
- The currently logged-in user has no matching document in the `users` collection — handle gracefully with a visible error
- User submits with an empty title or description — prevent submission with inline validation messages
- The Firestore write fails mid-submit — display the error inline without losing form state
- User navigates away before submitting — no partial document should be written

## Acceptance Criteria

- Visiting `/heists/create` renders a form with Title, Description, and Assign To fields
- The Assign To dropdown is populated with codenames fetched from the `users` collection
- Submitting a valid form creates a new document in the `heists` Firestore collection with all `CreateHeistInput` fields populated correctly
- `createdAt` is a Firestore server timestamp, `deadline` is 48 hours after submit, `finalStatus` is `null`
- `createdBy` and `createdByCodename` reflect the currently authenticated user
- After a successful write the user lands on `/heists`
- The submit button is disabled while the request is in flight
- An inline error is shown if the Firestore write fails
- The form cannot be submitted if Title or Description are empty

## Open Questions

- Should the current user be selectable as the assignee, or excluded from the dropdown? The user should be selectable as the assignee.
- Is there a `users` Firestore type/interface already defined, or does one need to be created alongside the `USERS` collection constant? The user must be verified first, and then created if not already in the collection.
- Should the form live entirely in the page file, or be extracted into a `CreateHeistForm` component under `components/`? extracted into a `CreateHeistForm` component under `components/heists/`.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders Title, Description, and Assign To fields
- Assign To dropdown is populated with codenames after mock `users` fetch resolves
- Submit button is disabled while the form is submitting
- Successful submit calls `addDoc` with the correct payload shape and redirects to `/heists`
- Failed Firestore write displays an inline error message without navigating away
- Submitting with an empty title or description shows a validation error and does not call `addDoc`
