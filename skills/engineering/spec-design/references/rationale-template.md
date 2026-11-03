# Rationale template

The technical design, written into section 2 of the spec (as `###` headings under `## 2. Outline Design`), or into the task or design document when there is no spec. One page. Replace the italic notes; delete none of the headings. Write "none" under a heading that has nothing to say, with one line on why.

## Problem

*One paragraph: what must change, and what in the existing system or constraints makes the shape non-obvious. Name the constraints you found in the code (types to interoperate with, callers that cannot break, invariants), with `file:line`.*

## Caller's view

*Write this first. The README or usage snippet a caller reads, plus two or three realistic call sites in their code: what they import, call, and get back. Everything below is derived from it. When the shape and this section disagree, change the shape.*

## Shape

*The recommended design. Data structures first, then signatures and how data flows through them, then module layout. Name the load-bearing decisions, where validation lives, which invariants the types encode, and what the design deliberately does not do. State what the interface hides and why it is no larger than needed.*

## Decisions settled

*One line per open question settled during design: the question, how it was settled (prototype or user choice), and the result. For a prototype, quote the command and the output excerpt that decided it, so the line stands on its own after the scratch directory is gone. For a user choice, name the option chosen and the date.*

## Tradeoffs

*One bullet per tradeoff: "we accept X in exchange for Y". Include anything a later reader could mistake for an oversight.*

## Rejected designs

*Required. Each structurally different design that lost: its shape in two or three lines, the red flags it hit (see `design-red-flags.md`), what it exposes to callers or hides, and the reason it lost. Flavors of the chosen shape do not count. When a change was small enough to skip the second design, say so and give the reason.*

## Open questions

*What the user must weigh in on before activation, phrased as questions, each with your recommendation. Use `decision-brief.md`. Write "none" when nothing is open.*
