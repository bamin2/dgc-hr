# Mobile Requests — make cards open detail views

## Problem
On `/requests` (mobile), `MobileRequestCard` accepts `onClick` but `MobileRequestsHub` never passes one. Every card is a dead button — the most common interaction (tap a request to see status / approval timeline / cancel) does nothing.

## Goal
Tapping any request card opens a focused mobile detail view appropriate to its type (leave, business trip, HR document, loan), reusing existing detail components instead of rebuilding them.

## Approach
Introduce a single `MobileRequestDetailSheet` that the hub controls via a `selectedRequest` state. The sheet renders a type-specific body using already-built components, wrapped in the standard mobile `Sheet` (bottom, ~92vh, `SheetBody` for scroll). This keeps mobile flows in-page (no route push), preserves the list scroll position, and matches the existing `MobileNewRequestSheet` pattern.

### Per-type bodies (reuse, do not rebuild)
- **leave** → `LeaveRequestDetailDialog` content (extract its inner body into a presentational `LeaveRequestDetailView` so it can render inside either a Dialog or a Sheet)
- **business_trip** → `TripDetailView` (already a standalone view component)
- **loan** → `LoanDetailSheet` body (similarly extract inner view if it's currently bound to its own Sheet wrapper)
- **hr_document** → small inline view: template name, status, requested date, generated document download link if present, cancel button if pending. No existing detail component, so build a minimal `HRDocumentRequestDetail` here.

Each body receives the full `metadata` object already attached to `UnifiedRequest`, so no extra fetching is needed for the initial render. Mutations (cancel, etc.) continue to use the existing hooks from each domain.

### Hub wiring
```tsx
const [selected, setSelected] = useState<UnifiedRequest | null>(null);
...
<MobileRequestCard
  key={`${request.type}-${request.id}`}
  request={request}
  onClick={() => setSelected(request)}
/>
...
<MobileRequestDetailSheet
  request={selected}
  open={!!selected}
  onOpenChange={(o) => !o && setSelected(null)}
/>
```

### Sheet shell
- `Sheet` `side="bottom"`, `h-[92vh]`, rounded-top, `flex flex-col p-0`
- `SheetHeader` with title (type label + short identifier) + status badge
- `SheetBody` for scrollable content
- Sticky footer for primary action when applicable (Cancel request, Download document, View attachment)
- Close via swipe-down / back gesture / explicit close button — uses standard project Sheet behaviour

## Files
- **edit** `src/components/requests/MobileRequestsHub.tsx` — add `selected` state, pass `onClick`, render detail sheet
- **new** `src/components/requests/MobileRequestDetailSheet.tsx` — shell + type switch
- **new** `src/components/requests/detail/LeaveRequestDetailView.tsx` — extracted from `LeaveRequestDetailDialog`
- **new** `src/components/requests/detail/HRDocumentRequestDetail.tsx`
- **edit** `src/components/timeoff/LeaveRequestDetailDialog.tsx` — render the new extracted view inside its dialog (no behaviour change on desktop)
- **edit** `src/components/loans/LoanDetailSheet.tsx` — export the inner view (or import the existing one) for reuse on mobile
- **edit** `src/components/requests/index.ts` — export new components

## Out of scope
- No new routes (mobile detail stays in-sheet, consistent with `MobileApprovalCard` pattern)
- No changes to desktop request pages
- No schema or query changes — `UnifiedRequest.metadata` already carries everything needed
