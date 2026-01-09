# Types Directory

This directory contains centralized TypeScript type definitions shared across the application.

## Purpose

- **Single source of truth** for domain types
- **Reduce duplication** across components and hooks
- **Improve maintainability** by centralizing type changes

## Files

### `dashboard.ts`
Dashboard-related types and configuration:
- `DashboardSection` - Section identifiers ('personal' | 'team' | 'admin')
- `DataScope` - Data visibility scope ('self' | 'team' | 'organization')
- `DashboardCardConfig` - Card configuration with visibility and ordering
- `SectionedDashboardConfig` - Full dashboard layout configuration
- `dashboardCardRegistry` - Registry of all available dashboard cards
- `defaultDashboardConfig` - Default card visibility and ordering

### `calendar.ts`
Calendar and event types:
- `CalendarEvent` - Full event with organizer and participants
- `CreateEventInput` / `UpdateEventInput` - Event mutation inputs
- `TodayMeeting` - Simplified meeting type for dashboard
- Event enums re-exported from Supabase types

### `employee.ts`
Employee-related types (if exists):
- Employee profile types
- Employment status types
- Employee search/filter types

## Conventions

### Naming
- Use PascalCase for type/interface names
- Suffix input types with `Input` (e.g., `CreateEventInput`)
- Suffix result types with `Result` when needed

### Organization
- Group related types in the same file
- Re-export database enums from Supabase types when needed
- Add JSDoc comments for complex types

### Example Usage

```typescript
import { CalendarEvent, CreateEventInput } from '@/types/calendar';
import { DashboardCardConfig, DashboardSection } from '@/types/dashboard';

// Use in components
const event: CalendarEvent = { ... };

// Use in hooks
function useCreateEvent(input: CreateEventInput) { ... }
```

## Adding New Types

1. Create a new file if the types represent a distinct domain
2. Add JSDoc documentation for complex types
3. Export from the file (no barrel exports needed)
4. Import directly from the specific type file
