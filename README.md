# ThesisFlow FE

Enhanced React + TypeScript + Vite project.

## Features
- React 19 + TypeScript + Vite
- React Router for clean navigation (projects, professors, students, people)
- Global state & caching with TanStack Query
- Reusable generic `DataTable` component with:
  - Sorting / filtering (text + select)
  - Debounced filter inputs
  - Active filter chips & clear-all
  - Pagination & page size control
  - Loading skeleton rows + incremental update status
  - Keyboard shortcut `/` to focus first filter
- Modular Project Creation Wizard (steps: Basic Info, People, Students, Summary)
- Inline creation & manual entry parsing for people/students
- Toast notifications (success / error) on project creation
- Reusable table state hook: `useTableState` (alias `usePaginatedTableState`)
- Alias path imports via `@`
- Unit tests (Vitest + Testing Library) for critical pure logic utilities
  - `parsePersonInput`
  - `buildParticipants`
- Strict TypeScript config & ESLint rules

## Scripts
```bash
npm run dev       # start dev server
npm run build     # type-check + production build
npm run preview   # preview production build
npm run lint      # lint sources
npm run test      # run unit tests (vitest)
```

## Project Structure (Relevant)
```
src/
  api/                  # API layer
  components/
    projectWizard/      # Wizard steps, types, actions
    ui/                 # UI primitives (button, card, toast, skeleton, etc.)
    DataTable.tsx       # Generic data table
  hooks/
    useTableState.ts    # Table pagination/sort/filter state
    usePaginatedTableState.ts # semantic alias
  pages/                # Routed pages
  router.tsx            # React Router definitions
  test/                 # Vitest unit tests
```

## Adding New Entity Tables
1. Define API list function with pagination/sort.
2. Create hook using `useQuery`.
3. Define `Column<T>[]` for the entity.
4. Use `useTableState` for local control state.
5. Render `<DataTable />` with proper handlers.

## Toast Usage
```tsx
import { useToast } from '@/components/ui/toast';
const { push } = useToast();
push({ variant: 'success', title: 'Saved', message: 'Item stored.' });
```

## Testing
Vitest configured with jsdom + Testing Library.
```bash
npm run test
```
Coverage reports (lcov + text) are generated.

## Creating Projects
Use the "Nuevo Proyecto" button on the Projects page. Steps enforce minimal validation:
- Step 1: Title & Type required
- Step 2: At least one Director
- Step 3: At least one Student

## Keyboard Shortcuts
- `/` focuses first filter input when a table is visible.

## Future Improvements (Suggested)
- Add edit flows for entities
- Server-side error mapping to user-friendly messages
- Accessibility audits (ARIA roles on table controls)
- More granular unit tests for wizard actions/persistence

---
Original Vite README content removed in favor of project-specific documentation.
