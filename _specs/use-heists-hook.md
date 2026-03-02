# Spec for use-heists-hook

branch: claude/feature/use-heists-hook
figma_component (if used): N/A

## Summary

- Create a `useHeists` React hook that subscribes to real-time Firestore data from the `heists` collection.
- The hook accepts a single `mode` argument: `'active'`, `'assigned'`, or `'expired'`, and returns the appropriate filtered list of `Heist` objects.
- Wire up the hook in the `/heists` dashboard page to render the title of each heist across all three sections.

## Functional Requirements

- The hook must be named `useHeists` and live at `hooks/useHeists/` (with an `index.ts` barrel export), following the project's component folder convention.
- The hook accepts one argument, a `HeistMode` type (union of `'active' | 'assigned' | 'expired'`).
- The hook returns `Heist[]` (the existing `Heist` type from `@/types/firestore/heist`).
- The hook uses a Firestore `onSnapshot` listener so data updates in real-time without requiring a manual refresh.
- The listener must be properly cleaned up (unsubscribed) when the component unmounts.
- **`'active'` mode**: queries heists where `assignedTo` equals the current user's UID and `deadline` is greater than now.
- **`'assigned'` mode**: queries heists where `createdBy` equals the current user's UID and `deadline` is greater than now.
- **`'expired'` mode**: queries heists where `deadline` is less than or equal to now AND `finalStatus` is not null. This query is not user-scoped.
- The hook must retrieve the current user from the existing Firebase Auth context (however auth is currently surfaced in the app).
- The hook uses the existing `heistConverter` from `@/types/firestore/heist` so that Firestore Timestamps are correctly converted to JS `Date` objects.
- Update `app/(dashboard)/heists/page.tsx` to call `useHeists` three times (once per mode) and render the `title` of each heist as a list item under the relevant section heading.

## Possible Edge Cases

- The current user may be `null` (not yet resolved by auth) — the hook should return an empty array and not attempt a Firestore query until a user is available.
- A mode's query may return zero results — the UI must handle an empty array gracefully (e.g. render nothing or a placeholder message).
- Firestore composite index may be required for compound queries (e.g. filtering on `assignedTo` + `deadline`) — note this as a deployment consideration.
- The `'expired'` mode query filters on `finalStatus !== null`; Firestore does not support `!= null` natively in all SDK versions — confirm the correct operator (`!=` or a workaround) against the current Firebase JS SDK docs.

## Acceptance Criteria

- `useHeists('active')` returns only heists where `assignedTo` matches the logged-in user UID and `deadline > now`.
- `useHeists('assigned')` returns only heists where `createdBy` matches the logged-in user UID and `deadline > now`.
- `useHeists('expired')` returns only heists where `deadline <= now` and `finalStatus` is not null, regardless of user.
- The heists page renders three sections, each showing a list of heist titles from the corresponding mode.
- When a heist document changes in Firestore, the UI updates automatically without a page reload.
- When the user is not authenticated, the hook returns `[]` and no Firestore query is initiated.
- The Firestore listener is unsubscribed when the component using the hook unmounts.

## Open Questions

- How is the current Firebase Auth user currently accessed in the app — via a context provider, a custom hook, or direct `auth.currentUser`? The implementation should follow the existing pattern. Use the existing pattern.
- Are Firestore composite indexes already set up for the compound queries needed, or do they need to be created? Crear composite indexes para queries con múltiples where/orderBy. Documentar queries específicas
- Should an error state be exposed (e.g. `{ data: Heist[], error: Error | null }`) or is a simple `Heist[]` return sufficient for now? Retornar `{ data: Heist[], error: Error | null, loading: boolean }`

## Testing Guidelines

Create a test file at `tests/hooks/useHeists.test.ts` and cover the following cases, without going too heavy:

- Returns an empty array when no user is authenticated.
- Calls the correct Firestore query for each mode (`'active'`, `'assigned'`, `'expired'`).
- Returns mapped `Heist` objects when the snapshot contains documents.
- Unsubscribes from the Firestore listener on unmount.
