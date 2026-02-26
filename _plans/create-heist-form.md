# Plan: Create Heist Form

## Context

The `/heists/create` page currently renders a static heading with no functionality. This plan wires it up with a full form that creates a Firestore document in the `heists` collection and redirects the user to `/heists` on success. The form follows the `CreateHeistInput` interface, letting the user fill in title, description, and assignee — all other fields are resolved programmatically.

---

## Files to Modify

| File | Change |
|------|--------|
| `types/firestore/index.ts` | Add `USERS: 'users'` to `COLLECTIONS`; re-export `FirestoreUser` |
| `app/(dashboard)/heists/create/page.tsx` | Import and render `<CreateHeistForm />` |

## Files to Create

| File | Purpose |
|------|---------|
| `types/firestore/user.ts` | `FirestoreUser` interface (`id`, `codename`) |
| `components/heists/CreateHeistForm/CreateHeistForm.tsx` | Client form component |
| `components/heists/CreateHeistForm/CreateHeistForm.module.css` | Component styles |
| `components/heists/CreateHeistForm/index.ts` | Barrel export |
| `tests/components/heists/CreateHeistForm.test.tsx` | Vitest + RTL tests |

---

## Step-by-Step Implementation

### 1. Add `FirestoreUser` type

**`types/firestore/user.ts`** — new file:
```
export interface FirestoreUser {
  id: string
  codename: string
}
```

**`types/firestore/index.ts`** — extend:
- Add `USERS: 'users'` to the `COLLECTIONS` object
- Add `export * from './user'`

---

### 2. Create `CreateHeistForm` component

**`components/heists/CreateHeistForm/CreateHeistForm.tsx`**

Key design decisions:
- `'use client'` — needs state and Firestore calls
- `useUser()` from `@/hooks/useUser` — provides current Firebase Auth `User` (`.uid` and `.displayName` which equals the codename set during signup)
- On mount: `getDocs(collection(db, COLLECTIONS.USERS))` → populate `users: FirestoreUser[]` state for the Assign To dropdown
- Three user-facing inputs:
  - `title` — text input, required
  - `description` — textarea, required
  - `assignedTo` — `<select>` populated from fetched users; each `<option>` stores `uid` as value and codename as label
- On submit — build and write `CreateHeistInput`:
  - `createdBy`: `user.uid`
  - `createdByCodename`: `user.displayName` (set to codename during signup)
  - `assignedTo`: selected option value (uid)
  - `assignedToCodename`: looked up from the local `users` array by matching uid
  - `deadline`: `new Date(Date.now() + 48 * 60 * 60 * 1000)`
  - `createdAt`: `serverTimestamp()` from `firebase/firestore`
  - `finalStatus`: `null`
- Call `addDoc(collection(db, COLLECTIONS.HEISTS), payload)` — no converter needed for writes (toFirestore is a pass-through)
- On success: `router.push('/heists')`
- Loading state: disable submit button, show loading text
- Error state: `<p role="alert">` with inline message
- Validation: HTML `required` on inputs prevents empty submission

State variables:
- `isLoading: boolean`
- `error: string | null`
- `users: FirestoreUser[]`
- `usersLoading: boolean`

**`components/heists/CreateHeistForm/index.ts`**
```
export { default } from './CreateHeistForm'
```

---

### 3. Style the form

**`components/heists/CreateHeistForm/CreateHeistForm.module.css`**

- First line: `@reference "../../../app/globals.css"` (one level deeper than top-level components)
- Reuse same field/form/errorMessage class pattern as `LoginForm.module.css`
- Add `.textarea` rule with `resize: vertical` and `min-height`
- Add `.select` rule matching input styling (bg-lighter, border, rounded, text-heading)
- Add `.disabledSelect` for when users are still loading

---

### 4. Update the page

**`app/(dashboard)/heists/create/page.tsx`**

Replace the static placeholder with:
```tsx
import CreateHeistForm from "@/components/heists/CreateHeistForm"

export default function CreateHeistPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h2 className="form-title">Create a New Heist</h2>
        <CreateHeistForm />
      </div>
    </div>
  )
}
```

---

### 5. Tests

**`tests/components/heists/CreateHeistForm.test.tsx`**

Mock targets (before imports):
- `firebase/firestore` — mock `addDoc`, `getDocs`, `collection`, `serverTimestamp`
- `@/lib/firebase` — mock `db: {}`
- `@/hooks/useUser` — mock `useUser` returning `{ user: { uid: 'u1', displayName: 'SilentFox' }, isLoading: false }`
- `next/navigation` — mock `useRouter` with a `push` spy

Test cases:
1. Renders Title, Description, and Assign To fields
2. Dropdown is populated with codenames after `getDocs` mock resolves
3. Submit button is disabled while loading
4. Valid submit calls `addDoc` with correct payload shape and redirects to `/heists`
5. Firestore write failure shows inline `role="alert"` error
6. Submitting with empty title or description does not call `addDoc` (HTML required validation)

---

## Reuse References

| Utility / Pattern | Source |
|---|---|
| `useUser()` hook | `hooks/useUser.ts` |
| `db` Firestore instance | `lib/firebase.ts` |
| `COLLECTIONS` constant | `types/firestore/index.ts` |
| `CreateHeistInput`, `heistConverter` | `types/firestore/heist.ts` |
| Form state pattern (loading/error/submit) | `components/LoginForm/LoginForm.tsx` |
| CSS module `@reference` + `@apply` pattern | `components/LoginForm/LoginForm.module.css` |
| Test mock pattern for Firebase | `tests/components/SignupForm.test.tsx` |

---

## Verification

1. Run `npm run dev` → navigate to `/heists/create` → form renders with all three fields
2. Fill in title + description, select an assignee, submit → document appears in Firestore `heists` collection with all fields populated; browser redirects to `/heists`
3. Submit with empty fields → browser native validation blocks submission
4. Simulate Firestore error (disconnect or mock) → inline error message appears
5. Run `npx vitest run tests/components/heists/CreateHeistForm.test.tsx` → all tests pass
6. Run `npm run lint` → no lint errors
