# Plan: Login Form Authentication

## Context

The `LoginForm` component currently collects email and password but only `console.log`s them. This plan wires it up to Firebase `signInWithEmailAndPassword`, adds inline success/error feedback, and updates the existing (incomplete) test file — following the established patterns from `SignupForm`.

---

## Files to Modify

| File                                        | Change                                                        |
| ------------------------------------------- | ------------------------------------------------------------- |
| `components/LoginForm/LoginForm.tsx`        | Add Firebase auth call, state, error mapping, success message |
| `components/LoginForm/LoginForm.module.css` | Add `.errorMessage` and `.successMessage` CSS classes         |
| `tests/components/LoginForm.test.tsx`       | Replace console.log test; add Firebase mocks and auth tests   |

---

## Implementation Steps

### 1. `components/LoginForm/LoginForm.tsx`

**Add imports:**

```
signInWithEmailAndPassword from "firebase/auth"
auth from "@/lib/firebase"
```

**Add state:**

- `isLoading: boolean` — disables button and shows "Logging in…" label during request
- `error: string | null` — shown as inline `role="alert"` message on failure
- `success: boolean` — shows inline `role="status"` success message on login

**Add `mapFirebaseError()` helper** (local to the file, matching SignupForm pattern):

- `auth/user-not-found` → `"Invalid email or password."`
- `auth/wrong-password` → `"Invalid email or password."`
- `auth/invalid-credential` → `"Invalid email or password."` (Firebase v9+ catch-all for bad credentials)
- `auth/invalid-email` → `"Please enter a valid email address."`
- default → `"Something went wrong. Please try again."`

> Note: Intentionally mapping user-not-found and wrong-password to the same message to prevent user enumeration.

**Update `handleSubmit`:**

1. `setError(null)` and `setIsLoading(true)` at the start
2. Call `await signInWithEmailAndPassword(auth, email, password)` in try/catch/finally
3. On success: `setSuccess(true)`
4. On error: `setError(mapFirebaseError(err.code))`
5. In finally: `setIsLoading(false)`

**Update JSX:**

- Add `onChange={() => setError(null)}` to both inputs to clear stale errors on edit
- Add `disabled={isLoading}` on submit button; label toggles: `isLoading ? "Logging in…" : "Login"`
- Add below the password field (before the button):
  - `{error && <p role="alert" className={styles.errorMessage}>{error}</p>}`
  - `{success && <p role="status" className={styles.successMessage}>You're logged in!</p>}`

---

### 2. `components/LoginForm/LoginForm.module.css`

Add two new classes at the bottom of the file:

```css
.errorMessage {
  @apply text-sm text-error text-center;
}

.successMessage {
  @apply text-sm text-success text-center;
}
```

Pattern matches `.errorMessage` from `SignupForm.module.css`.

---

### 3. `tests/components/LoginForm.test.tsx`

**Replace** the existing file (which currently tests `console.log`). Follow `SignupForm.test.tsx` pattern exactly.

**Keep existing tests** (renders fields, Login button, password masking, toggle visibility, signup link).

**Remove** the `console.log` spy test.

**Add new tests:**

1. Does not display an error on clean render
2. Disables the submit button and shows "Logging in…" while the request is in flight (mock returns a never-resolving promise)
3. Shows the success message (`role="status"`) when `signInWithEmailAndPassword` resolves
4. Shows the inline error (`role="alert"`) with `"Invalid email or password."` when Firebase rejects with `auth/invalid-credential`
5. Shows `"Something went wrong. Please try again."` for an unexpected Firebase error (no code)

Use `vi.clearAllMocks()` in `beforeEach`, `waitFor()` for async assertions, `vi.mocked()` for mock setup.

---

## Key Reuse

- `mapFirebaseError()` pattern → copied from `components/SignupForm/SignupForm.tsx`
- `.errorMessage` CSS class → same as `components/SignupForm/SignupForm.module.css`
- Firebase mock pattern → same as `tests/components/SignupForm.test.tsx`
- `auth` import → `@/lib/firebase` (already exported)

---

## Verification

1. Run `npx vitest run tests/components/LoginForm.test.tsx` — all tests pass
2. Run `npm run dev` and visit `/login`
   - Submit with valid credentials → "You're logged in!" appears inline
   - Submit with wrong password → "Invalid email or password." appears inline
   - Button is disabled and shows "Logging in…" during request
3. Run `npm run lint` — no lint errors
