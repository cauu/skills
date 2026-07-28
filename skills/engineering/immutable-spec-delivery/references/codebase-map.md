# Codebase Map and Repository Index

Maintain a persistent repository index to improve navigation and reduce repeated
full-repository scanning.

Purpose:
- provide a stable repository tree overview
- describe major modules and their responsibilities
- optionally list key entry points or high-signal functions
- give specs a shared structural reference when defining scope

This index is a navigation artifact, not an execution or acceptance artifact.
The active spec remains the source of truth for delivery scope and acceptance.
Actual code remains the source of truth for implementation behavior.

## Codebase Map Location

Store the repository index at:

```text
docs/codebase-map.md
```

This file is the canonical repository-structure overview for the project.
It is not subject to append-only spec rules and may be maintained in place.

## Codebase Map Format

The file should contain:

1. Repository tree
2. Module descriptions
3. Optional key functions or entry points

Recommended structure:

```markdown
# Codebase Map

Version:
Last Full Scan:
Last Incremental Update:
Last Verified Commit:

## Repository Tree
<tree with short functional notes>

## Module Glossary

### path/to/module
Responsibilities:
- ...

Key Functions:
- ...
```

Descriptions should stay short, functional, and operationally useful.
Do not turn the map into a full architecture narrative or duplicate spec text.

Metadata rules:
- `Version` should be a simple integer or other lightweight project-local
  revision marker; do not over-engineer semantic versioning for the map.
- `Last Verified Commit` should be a short Git SHA or other concrete ref that
  makes staleness easy to judge against `HEAD`.
- In practice, `Last Verified Commit` is more important than `Version` for
  deciding whether the map is trustworthy.

Small example:

```markdown
# Codebase Map

Version: 12
Last Full Scan: 2026-03-10
Last Incremental Update: 2026-03-11 (services/user/internal/server/http.go)
Last Verified Commit: a1b2c3d

## Repository Tree
services/
  admin/
    internal/server/http.go - control-plane HTTP route registration
  core/
    internal/server/http.go - public registry HTTP route registration
  user/
    internal/server/http.go - user-app HTTP route registration

## Module Glossary

### services/user/internal/server/http.go
Responsibilities:
- register user-app REST endpoints
- attach auth-aware HTTP handlers

Key Functions:
- NewHTTPServer(...)
- registerRoutes(...)
```

## Repository Tree Rules

- Prefer a concise tree that highlights major directories and important files.
- Add short functional notes only where they help navigation.
- Do not enumerate every generated file, vendor directory, or low-signal asset.
- Keep the map optimized for discovery, not completeness-for-its-own-sake.

## Module Glossary Rules

- Include important modules, services, packages, route registries, data layers,
  or other high-signal boundaries.
- As a rule of thumb, create one glossary entry per independently meaningful
  module boundary, deployable service, public interface surface, or route/data
  registration layer.
- For each glossary entry, describe responsibilities in a few short bullets.
- Add key functions only when they materially improve navigation or review.
- Do not try to document every function in the repository.

Monorepo scaling rule:
- Default to a single `docs/codebase-map.md`.
- Introduce sub-maps only when the main map becomes unwieldy enough that a
  single file materially harms navigation or maintenance.
- If sub-maps are introduced, keep a short top-level index that points to them
  instead of silently replacing the root map.

## Spec Reference Rules

- Every spec should include a `References` section.
- `docs/codebase-map.md` should appear in `References` by default when the file
  exists.
- Use the codebase map as the repository-structure reference when defining
  scope, impacted modules, and implementation touch points.
- Add other references only when they materially support execution, such as
  design docs, API mappings, ADRs, or external requirement documents.
- `References` support the spec; they do not replace the spec's own
  requirement, design, execution, or acceptance sections.

## Codebase Map Caching Rules

Treat `docs/codebase-map.md` as the primary discovery reference for repository
structure.

Default behavior:
1. Read the codebase map before considering any broad repository scan.
2. Do not rescan the entire repository if the map already exists and appears
   structurally consistent.
3. Read only the modules referenced by the active spec and any directly related
   dependencies, wiring, tests, or configuration files needed to implement or
   validate the current item.
4. Use the map to narrow discovery first, then inspect code selectively.

When the map and code disagree, follow the actual code and update the map.

## Full Map Regeneration Conditions

A full repository scan is allowed only when one of the following is true:

- `docs/codebase-map.md` does not exist
- a large repository restructuring occurred
- modules referenced by the active spec cannot be located
- imports, wiring, or dependencies appear inconsistent
- the user explicitly requests regeneration

Otherwise, prefer incremental updates.

## Incremental Map Updates

When implementing a spec item:

1. Identify the modules touched by the item.
2. Read only those modules plus the minimal surrounding dependencies required
   for implementation or validation.
3. Update only the affected portions of `docs/codebase-map.md`.

Update the map incrementally when any of the following changes:
- repository structure
- module ownership or responsibilities
- major route or entry-point locations
- important public interfaces
- key dependency or wiring relationships

Purely local implementation-detail changes do not require a map update unless
they materially affect navigation.

## Lazy Validation

Trust the codebase map by default as a discovery aid, but not as an infallible
authority.

Validate map entries when:
- files cannot be located
- expected functions or modules are missing
- imports, routes, or dependencies look inconsistent
- tests or runtime behavior contradict the documented structure

If the current item proceeds cleanly and the map remains structurally accurate,
do not reread unrelated parts of the repository.
