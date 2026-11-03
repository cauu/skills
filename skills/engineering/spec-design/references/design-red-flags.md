# Design red flags

Screen every candidate design before comparing them. A red flag is a reason to revise or reject the shape, and the screening result goes into the rationale.

Terms follow `codebase-design` (module, interface, implementation, depth, seam, adapter, leverage, locality). Use its glossary when it is installed. Without it, read them plainly: an interface is everything a caller must know; a module is deep when a small interface hides a lot of behavior; a seam is where an interface lives.

Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repository.

## Shallow module

The interface is nearly as large as the implementation. Signs: callers coordinate several calls to finish one operation; options expose internal stages; learning the interface does not spare the caller from learning the implementation. A deep call chain is not a deep module: it spreads understanding across layers.

## Information leakage

Several modules depend on the same internal decision (a representation, policy, storage schema, or wire format), so changing it needs coordinated edits. Parse external data into domain types behind the interface and keep wire and framework types private.

## Temporal decomposition

Modules follow execution order (load, validate, transform, save) instead of the knowledge they own, so one representation and its invariants repeat across several seams. Group code around the decisions it protects.

## Pass-through method

A method forwards the same arguments to another method of the same shape. It adds a layer and hides nothing. Remove it, or keep it only when it adds policy or adaptation.

## Split ownership

More than one module writes the same state or keeps its own copy. An agent editing one writer cannot see the others. Give each piece of state one owner.

## Two ways to do one task

The design offers two paths to the same result. Agents copy whichever they find first, so both keep gaining callers. Keep one and delete the other in the same change.

## Importable internals

Callers can import a module's internals, so the shortest path that compiles makes them part of the interface. Make internals unreachable from outside the module.

## Hand-synced lists

Two places list the same items and both must be edited to add one. Keep one list and derive the others, or make the build fail when they disagree.

## Callers must know the rules

Using the interface correctly needs knowledge of the implementation: call order, hidden invariants, flags that must be set together. Move the rule behind the interface or encode it in types.

## Seam without variation

A seam with one adapter is hypothetical. Add a seam only when two adapters exist or a test needs one.
