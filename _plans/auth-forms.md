# Plan: Authentication Forms (Login & Signup)

## Context

The `/login` and `/signup` public pages currently exist as stubs with only a heading. This plan adds fully functional authentication forms to both pages — with email/password fields, a password visibility toggle (inline SVG, no library), light native validation, console logging on submit, and a link to switch between the two forms.

No shared `AuthForm` component is used — `LoginForm` and `SignupForm` are separate components following the established 3-file pattern.

---

## Files to Create

### `components/LoginForm/LoginForm.tsx`
- `'use client'` directive (uses `useState` + event handlers)
- State: `showPassword` (boolean, default `false`)
- Reads form values via `form.elements.namedItem()` — no controlled inputs needed
- `handleSubmit`: calls `e.preventDefault()` then `console.log({ email, password })`
- Password input `type`: `showPassword ? "text" : "password"`
- Toggle button: `type="button"` (critical — prevents form submission), `aria-label` switches between `"Show password"` / `"Hide password"`
- Inline SVG eye/eye-off icons using `stroke="currentColor"`
- Submit button: `className="btn"` (global utility), label `"Login"`
- Footer link: `<Link href="/signup">Sign up</Link>` via `next/link`
- IDs: `"login-email"`, `"login-password"` (prevent collisions if both pages are ever SSR'd together)

### `components/LoginForm/LoginForm.module.css`
- `@reference "../../app/globals.css";`
- `.form` — `flex flex-col gap-4 mt-6`
- `.field` — `flex flex-col gap-1` with nested `label` and `input` styles
- `.passwordWrapper` — `relative flex items-center`; input gets `w-full pr-10`
- `.toggleBtn` — `absolute right-3`, no background/border, `text-body hover:text-heading`
- `.switchLink` — `text-sm text-body text-center`; nested `a` gets `text-primary hover:underline`

### `components/LoginForm/index.ts`
```ts
export { default } from "./LoginForm"
```

### `components/SignupForm/SignupForm.tsx`
Identical to `LoginForm.tsx` with these differences:
- Submit button label: `"Sign Up"`
- Link: `<Link href="/login">Log in</Link>`
- Link text: `"Already have an account? Log in"`
- `autoComplete` on password: `"new-password"` (vs `"current-password"`)
- IDs: `"signup-email"`, `"signup-password"`

### `components/SignupForm/SignupForm.module.css`
Identical content to `LoginForm.module.css` (kept separate per no-shared-component rule).

### `components/SignupForm/index.ts`
```ts
export { default } from "./SignupForm"
```

### `tests/components/LoginForm.test.tsx`
Tests (using React Testing Library + `userEvent`):
- Renders email and password fields (via `getByLabelText`)
- Renders a "Login" submit button
- Password field is `type="password"` by default
- Toggle click switches to `type="text"`, second click returns to `type="password"`
- Submit logs `{ email, password }` — use `vi.spyOn(console, "log")`, fill both fields first, then submit
- Link to `/signup` is present with correct `href`

### `tests/components/SignupForm.test.tsx`
Same structure; button is `/sign up/i`, link is `/log in/i` pointing to `"/login"`.

---

## Files to Modify

### `app/(public)/login/page.tsx`
Replace stub. Page stays a Server Component — no `'use client'` needed here.
```tsx
import LoginForm from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1 className="form-title">Log in to Your Account</h1>
        <LoginForm />
      </div>
    </div>
  )
}
```
(Also fixes the copy-paste bug where the function was named `SignupPage`.)

### `app/(public)/signup/page.tsx`
```tsx
import SignupForm from "@/components/SignupForm"

export default function SignupPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h2 className="form-title">Sign Up for an Account</h2>
        <SignupForm />
      </div>
    </div>
  )
}
```

---

## Key Implementation Notes

- **Native validation only** — no `noValidate` on `<form>`, so `required` and `type="email"` block invalid submissions via the browser. No JS validation code needed.
- **Toggle must be `type="button"`** — without this, clicking it inside a `<form>` triggers form submission.
- **jsdom ignores `required`** — tests must fill both fields before submitting or `console.log` won't be called. The plan above already does this.
- **SVG `stroke="currentColor"`** — icon color inherits from `.toggleBtn`'s CSS `color`, which uses `text-body` and transitions to `text-heading` on hover.

---

## Verification

1. `npx vitest run tests/components/LoginForm.test.tsx` — all tests pass
2. `npx vitest run tests/components/SignupForm.test.tsx` — all tests pass
3. `npm run dev` → visit `/login`: form renders, password toggle works, submitting logs to console, "Sign up" link navigates to `/signup`
4. Visit `/signup`: same checks, "Log in" link navigates to `/login`
5. No navbar appears on either page
