# React Router v7 Policy (Full Stack)

## 1. Scope

- This document defines implementation rules for React Router v7 (Full Stack) projects.
- Full Stack configuration means loader and action functions run on the server.
- It derives from the architectural principles defined in AGENTS.md.
- It does not redefine abstract architectural theory.
- Client-only (SPA) configuration is out of scope.

---

## 2. Architectural Layer Mapping

The application is organized into logical layers:

- Presentation: React components and route UI
- Application: hooks and use cases (state orchestration and procedural flow)
- Domain: normalized types and pure business logic
- Infrastructure: external I/O (API, DB, storage, providers)

Dependency direction must always move inward.

- Presentation → Application / Domain
- Application → Domain / Infrastructure
- Infrastructure → Domain
- Domain → must not depend on outer layers

Route modules act as HTTP boundary adapters and must not contain business logic.

Domain defines business invariants and pure rules.
Use cases orchestrate domain rules and infrastructure interactions.

---

## 3. Directory Structure & File Layout

### Suggested Directory Layout

This is a suggestion, not a hard requirement. The rules matter more than names.

```
app/
  routes/           # route modules (HTTP boundary)
  components/       # shared presentational components
    shared/         # cross-feature reusable UI
    <area>/         # feature-scoped reusable UI
      pages/        # route-level page components (composed by route, not reused)
      parts/        # page-local presentational components
  hooks/            # client-side application logic
  usecases/         # server-side application logic (optional, promoted when needed)
  domain/           # domain types and pure business logic
  service/          # external I/O abstraction and normalization
  lib/              # technical utilities only (no business logic)
  context/          # cross-cutting UI/session state
server/
  db/               # server-only DB clients
  repositories/     # server-only persistence logic
```

### File Responsibility Principle

Each file must represent a single cohesive responsibility.

- One route file must correspond to one route responsibility.
- One hook file must correspond to one use case or state concern.
- One service file must correspond to one external resource or action.
- Helper functions are allowed if they support the same responsibility.
- Avoid grouping multiple unrelated actions into a single file.
- Increasing file count is acceptable if it preserves structural clarity.
- If a file name requires "and" to describe its purpose, split it.

### Server-Only Rule

Code under `server/` must never be imported into client-side code.

Secrets, environment variables, DB clients, and Node-only APIs must exist under `server/`.

Route modules and services may import from `server/`.

Components and hooks must not import from `server/`.

---

## 4. Route Responsibilities (loader / action)

Routes are HTTP boundary adapters.

Each route file corresponds to one route responsibility.

### Route File Structure

Route files may export:

- `loader`
- `action`
- `ErrorBoundary`
- default component

Route files must:

- Parse and validate route params and form data
- Perform authentication and authorization checks
- Call service or use case functions
- Return normalized Domain types
- Redirect when necessary

Route files must not:

- Contain business logic
- Access DB directly
- Return raw infrastructure types
- Contain UI implementation details beyond simple composition

Data normalization and parameter validation are allowed in route files.
Domain rule evaluation is not allowed.

Routes must remain thin.

---

## 5. UI Placement Rules

UI components must be placed according to reuse scope.

### Placement Rules

Page-specific UI components
→ `components/<area>/parts/`

Route-level page components (composed by route, returned as default export)
→ `components/<area>/pages/`

Feature-scoped reusable components
→ `components/<area>/`

Cross-feature reusable components
→ `components/shared/`

UI configuration data (e.g., navigation structures, UI-only constants) must be placed near the route or feature that owns them.

Global dumping of UI constants is prohibited.

---

## 6. Application Logic Placement Rules

Application logic is divided into client-side and server-side.

### Client-Side Logic

Placed under `hooks/`.

Hooks may:

- Manage UI state
- Orchestrate user interaction
- Call service functions
- Consume loader data

Hooks must not:

- Import raw DTO or infrastructure types
- Access DB or server-only modules
- Contain domain rules

### Server-Side Logic (Use Cases)

Placed under `usecases/` when procedural complexity exists.

Use cases may:

- Coordinate multiple service calls
- Enforce authorization
- Apply domain rules
- Convert infrastructure errors into AppError

Use cases must not:

- Access UI concerns
- Return raw infrastructure types

Creation of a use case is required when any of the following applies:

- More than one service call is involved
- Authorization logic exists
- Domain rule evaluation is required

---

## 7. Service Layer Rules

The `service/` directory represents infrastructure abstraction.

Services are responsible for:

- Communicating with external systems
- Fetching or mutating data
- Normalizing Raw/DTO into Domain types
- Handling retry or rate limiting
- Throwing AppError on failure

Services must not:

- Contain UI logic
- Contain domain rule definitions
- Expose raw external response shapes
- Coordinate multiple domain concepts

Raw types must not escape the service boundary.

---

## 8. Domain Rules

The `domain/` directory contains:

- Entities
- Value Objects
- Domain types
- Pure validation rules
- Business invariants
- Domain-level error definitions

Domain must:

- Remain framework-independent
- Avoid infrastructure dependencies
- Avoid UI dependencies

`snake_case` is forbidden inside Domain types.

---

## 9. lib Directory Rules

`lib/` is reserved for technical utilities only.

Allowed:

- Assertion helpers
- Class name utilities
- Generic formatting helpers
- Generic functional utilities
- Environment access helpers (client-safe env only; server-only env must live under `server/`)

Forbidden:

- Business logic
- Domain rules
- External I/O
- UI configuration
- Feature-specific logic

`lib/` must not become a miscellaneous dumping directory.

---

## 10. State Ownership

State must have a clear owner.

- URL state: owned by route (search params, path params)
- UI state: owned by component or hook
- Server state: loaded in loader and consumed via `useLoaderData`
- Application flow state: managed in hooks

Global state must not be used for unrelated concerns.

---

## 11. Error Handling Policy

All infrastructure errors must be converted into `AppError`.

`AppError` must:

- Represent application-level meaning
- Include a machine-readable `code` field
- Not expose transport or provider details
- Not expose stack traces or raw infrastructure error messages

UI must derive user-facing messages through a single transformation layer.

Route-level `ErrorBoundary` handles route-scoped failures.
Root-level `ErrorBoundary` handles global failures.

---

## 12. Route Granularity Rules

Routes represent screens.

Mutation operations must default to using `action` within the same route.

Separate routes for mutation are allowed only when a distinct screen exists.

CRUD endpoints must not be mechanically mapped to separate routes.

---

## 13. Testing Policy

- Domain: pure unit tests (no network, no browser)
- Service: tests with external system mocks/fakes
- Use cases: tests with service mocks
- Hooks: tests with service mocks (no render)
- Routes: verify loader/action return shape and redirect behavior
- Components: interaction-based tests (render + user event)
- Implementation details must not be tested
