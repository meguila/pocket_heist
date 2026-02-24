# Plan: signup-firebase-auth

## Context

Wire the existing `SignupForm` component to Firebase Authentication. On successful signup, generate a random PascalCase codename from three themed word arrays, set it as the user's `displayName`, and write a `users/{uid}` document to Firestore containing only `id` and `codename`. Redirect to `/heists` on success. Show inline errors and a loading state throughout.

Spec: `_specs/signup-firebase-auth.md`
Branch: `claude/feature/signup-firebase-auth`

---

## Tasks

### Task 1 — `lib/codename.ts` (new file)

Three exported word arrays — `ADJECTIVES`, `NOUNS`, `ROLES` — each with 20+ unique thematic words, already capitalised (e.g. `"Silent"`, `"Fox"`, `"Rogue"`). No word appears in more than one array.

Export a `generateCodename()` function that picks one word at random from each array and concatenates them directly, producing a PascalCase string like `"SilentFoxRogue"`.

No external dependencies.

---

### Task 2 — `SignupForm.module.css` (modify)

Add a `.errorMessage` class at the bottom of the file:

```css
.errorMessage {
  @apply text-sm text-error text-center;
}
```

`text-error` resolves via the `--color-error` token already defined in `globals.css`. The existing `@reference` directive at the top of the file covers this — no preamble change needed.

Independent of Task 1.

---

### Task 3 — `SignupForm.tsx` (rewrite) — *depends on Tasks 1 & 2*

New imports: `useRouter` from `next/navigation`, `createUserWithEmailAndPassword` + `updateProfile` from `firebase/auth`, `doc` + `setDoc` from `firebase/firestore`, `auth` + `db` from `@/lib/firebase`, `generateCodename` from `@/lib/codename`.

New state: `isLoading` (boolean), `error` (string | null). Add `useRouter`.

Rewrite `handleSubmit` as async:
1. `setError(null)`, `setIsLoading(true)`
2. Read `email` and `password` from form elements (same pattern as today)
3. `try`:
   - `createUserWithEmailAndPassword(auth, email, password)` → `user`
   - `generateCodename()` → `codename`
   - `updateProfile(user, { displayName: codename })`
   - `setDoc(doc(db, "users", user.uid), { id: user.uid, codename })`
   - `router.push("/heists")`
4. `catch`: map Firebase error codes to user-friendly messages, call `setError(message)`
   - `auth/email-already-in-use` → `"An account with this email already exists."`
   - `auth/weak-password` → `"Password must be at least 6 characters."`
   - `auth/invalid-email` → `"Please enter a valid email address."`
   - fallback → `"Something went wrong. Please try again."`
5. `finally`: `setIsLoading(false)`

Add `onChange={() => setError(null)}` to both inputs (auto-clear error on edit).

Update submit button: `disabled={isLoading}`, text `"Creating account…"` when loading.

Add error display above the submit button:
```tsx
{error && <p role="alert" className={styles.errorMessage}>{error}</p>}
```

No changes needed to `index.ts` or the route page file.

---

### Task 4 — `tests/lib/codename.test.ts` (new file) — *depends on Task 1*

Pure unit tests, no React or Firebase mocking needed.

Import: `generateCodename`, `ADJECTIVES`, `NOUNS`, `ROLES` from `@/lib/codename`.

Test cases:
- Returns a PascalCase string composed of exactly 3 capitalised word segments (split on uppercase boundaries).
- Each segment belongs to the correct array: first → `ADJECTIVES`, second → `NOUNS`, third → `ROLES`.
- All three arrays share zero common words (`new Set([...ADJECTIVES, ...NOUNS, ...ROLES]).size === total length`).
- 20 calls produce more than 1 unique result (basic randomness check).

---

### Task 5 — `tests/components/SignupForm.test.tsx` (modify) — *depends on Task 3*

Add module-level mocks (Vitest hoists these above imports):
- `firebase/auth` → mock `createUserWithEmailAndPassword` and `updateProfile`
- `firebase/firestore` → mock `doc` and `setDoc`
- `@/lib/firebase` → mock `auth: {}` and `db: {}`
- `@/lib/codename` → mock `generateCodename` returning `"SilentFoxRogue"`
- `next/navigation` → mock `useRouter` returning `{ push: vi.fn() }`

Remove the old `"calls console.log with email and password on submit"` test.

Add three new tests:
1. **No error on clean render** — `queryByRole("alert")` returns null.
2. **Loading state during in-flight request** — arrange `createUserWithEmailAndPassword` to return a never-resolving Promise; submit the form; assert button is `disabled` and text is `"Creating account…"`.
3. **Error displayed on Firebase rejection** — arrange `createUserWithEmailAndPassword` to reject with `{ code: "auth/email-already-in-use" }`; submit; `waitFor` the error; assert `getByRole("alert")` contains `"An account with this email already exists."`.

The four existing tests (render fields, submit button present, password masking, login link) remain unchanged.

---

## Parallelism

```
Task 1 ─┬─→ Task 3 ─→ Task 5
Task 2 ─┘
Task 1 ──→ Task 4   (parallel with Tasks 2 & 3)
```

- Tasks 1 and 2 are independent — start simultaneously.
- Task 4 can be authored in parallel with Tasks 2–3 once Task 1 is done.
- Task 3 requires both Tasks 1 and 2.
- Task 5 must follow Task 3.
