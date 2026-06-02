# AGENTS

## 1. Purpose

This repository defines architectural principles.

It does not define framework rules, language rules, or directory structures.  
It defines how systems should be designed to remain evolvable, clear, and replaceable.

---

## 2. Core Principles

### 2.1 Separation of Responsibilities

Each layer has a single purpose.
Mixing concerns increases long-term cost.

---

### 2.2 File Responsibility Principle

Each file must represent a single cohesive responsibility.

- A file must express one clear purpose.
- If a file requires “and” to describe its role, it likely violates this rule.
- Multiple helper functions are allowed if they support the same responsibility.
- A file must not contain multiple unrelated use cases.
- Increasing file count is acceptable if it preserves structural clarity.

This rule enforces responsibility separation at a physical (file) level.
It does not define directory structure or naming conventions.

---

### 2.3 Layered Architecture

Systems are organized into logical layers:

- Presentation
- Application
- Domain
- Infrastructure

Dependencies must move inward.
Inner layers must not depend on outer layers.

---

### 2.4 Boundary Normalization

All external data must be normalized at system boundaries.
Internal domain models must not depend on external data shapes.

---

### 2.5 Domain Isolation

The domain model is the source of truth.
It must not depend on frameworks, transport formats, or infrastructure details.

---

### 2.6 Explicit Mapping

All transformations between layers must be explicit.
Structural similarity is not a reason to bypass mapping.

---

### 2.7 Replaceable Contracts

External systems must be accessed through explicit contracts.
Implementations must be replaceable without affecting the domain.

---

### 2.8 No Leakage

External conventions must not leak into internal models.
Transport formats must not define domain logic.

---

### 2.9 Evolvability First

Prefer structures that tolerate change.  
Short-term convenience must not compromise long-term flexibility.

---

## 3. Design Philosophy

Constraints are intentional.  
Constraints reduce ambiguity.  
Simplicity is preferred over cleverness.  
Clarity is preferred over compactness.

---

## 4. Trade-offs

This architecture increases:

- File count
- Explicit transformations
- Initial implementation cost

It reduces:

- Long-term coupling
- Hidden dependencies
- Refactoring risk

---

## 5. Non-Goals

This repository does not define:

- Framework-specific rules
- Language-specific rules
- Naming conventions
- Directory structures
- Formatting rules
