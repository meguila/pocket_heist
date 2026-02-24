# Spec for signup-firebase-auth

branch: claude/feature/signup-firebase-auth
figma_component (if used): N/A

## Summary

- Wire the existing `SignupForm` component to Firebase Authentication using `createUserWithEmailAndPassword` from the Firebase Web SDK.
- After successful account creation, generate a random codename by combining one word from each of three curated word lists (adjective, noun, role or similar thematic sets) joined in PascalCase (e.g. `SilentFoxRogue`).
- Set the new user's Firebase Auth `displayName` to the generated codename via `updateProfile`.
- Create a document in the Firestore `users` collection keyed by the user's `uid`, storing only `id` and `codename` — never their email.
- Use only the Firebase Web SDK (`firebase/auth`, `firebase/firestore`). No server-side code or Admin SDK.
- Import `auth` and `db` exclusively from `@/lib/firebase` (the existing config export).

## Functional Requirements

- The `SignupForm` `handleSubmit` function must call `createUserWithEmailAndPassword(auth, email, password)`.
- A `generateCodename()` utility function must pick one word at random from each of three distinct word arrays and join them in PascalCase.
  - Each word array must contain at least 20 unique, thematic words (e.g. adjectives, nouns, and heist-role words that fit the game's theme).
  - Each array must be entirely unique — no word should appear in more than one array.
- After the user credential is returned, call `updateProfile(user, { displayName: codename })` to persist the codename as the Auth display name.
- After `updateProfile` resolves, call `setDoc` (or `doc` + `setDoc`) on `db` to write `{ id: user.uid, codename }` to `users/{uid}`. Do not include the email field.
- On success, redirect the user to the dashboard (`/heists`) using the Next.js router (`useRouter` from `next/navigation`).
- On failure, display a user-visible error message inside the form (not just a console log). The error should be accessible (associated with the form region).
- While the async operation is in progress, the submit button must be disabled and show a loading state (e.g. text changes to "Creating account…").
- The word lists and `generateCodename` function should live in a dedicated utility file (e.g. `lib/codename.ts`) so they can be imported and tested independently.

## Possible Edge Cases

- Firebase `auth/email-already-in-use` — show a clear inline error ("An account with this email already exists.").
- Firebase `auth/weak-password` — show an inline error ("Password must be at least 6 characters.").
- Firebase `auth/invalid-email` — show an inline error ("Please enter a valid email address.").
- Network failure between `createUserWithEmailAndPassword` and `setDoc` — the auth account will exist but the Firestore document will not. The feature should attempt `setDoc` and surface an error if it fails, but not leave the user stuck on the page without feedback.
- Double-submit prevention — the submit button must remain disabled until the entire async flow completes or errors.
- Codename collision in Firestore is acceptable at this stage (no uniqueness enforcement required in this spec).

## Acceptance Criteria

- Submitting the signup form with valid credentials creates a Firebase Auth user.
- The created user's `displayName` in Firebase Auth equals the generated codename.
- A document exists at `users/{uid}` containing exactly `{ id, codename }` with no email field.
- The generated codename is in PascalCase and composed of exactly three words, one from each word array.
- On success the user is redirected to `/heists`.
- On a Firebase error, an inline error message is shown in the form.
- The submit button is disabled and shows loading text while the request is in flight.
- The `generateCodename` utility is covered by unit tests (correct format, correct word-set membership, randomness distribution).

## Open Questions

- Should the codename be re-generated and re-checked for Firestore uniqueness, or is a collision acceptable for the MVP? (Spec assumes collision is acceptable for now.) a collision is acceptable.
- Are there specific thematic word categories preferred for the three lists (e.g. adjectives / heist-roles / locations), or is the developer free to choose? The developer is free to choose.
- Should the error message auto-clear when the user edits the form, or persist until the next submit attempt? The error message should auto-clear when the user edits the form.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `generateCodename` returns a string in PascalCase composed of exactly three capitalised words.
- `generateCodename` always picks from the correct word set for each position (no cross-contamination between arrays).
- `generateCodename` produces different results across multiple calls (basic randomness check).
- `SignupForm` disables the submit button and shows loading text when submission is in progress.
- `SignupForm` displays an error message when Firebase returns an auth error.
- `SignupForm` does NOT display an error message on a clean render.
