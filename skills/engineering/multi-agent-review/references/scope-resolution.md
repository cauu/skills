# Scope Resolution

Deterministic git commands behind the three review cases in SKILL.md. Run from the
repo root. `SPEC_GLOB="docs/specs/*.md"`.

## Detect the active spec

```bash
# Exactly one file directly under docs/specs/ (excludes draft/ and completed/).
mapfile -t active < <(ls -1 docs/specs/*.md 2>/dev/null)
if   [ "${#active[@]}" -eq 1 ]; then SPEC="${active[0]}"          # active spec
elif [ "${#active[@]}" -eq 0 ]; then SPEC=""                       # no active spec
else echo "WARN: >1 file in docs/specs/ root; ask the user which is active"; fi

SPEC_FILE="$(basename "${SPEC:-}")"           # e.g. 20260605T1655-S0044-...md
SPEC_ID="$(sed -nE 's/.*-(S[0-9.]+)-.*/\1/p' <<<"$SPEC_FILE")"   # e.g. S0044
```

## Case 1 — review the spec's changes (committed + uncommitted)

The immutable-spec-delivery convention commits each item as
`spec(<spec-filename>): <item-id> ...`, so every commit for the spec is grep-able.

```bash
# First commit that referenced this spec file, in chronological order.
FIRST="$(git log --reverse --grep="$SPEC_FILE" --format=%H | head -1)"

if [ -n "$FIRST" ]; then
  BASE="${FIRST}^"                     # parent of the first spec commit
else
  # Spec active but nothing committed yet -> base is current HEAD; scope is
  # whatever is in the working tree.
  BASE="HEAD"
fi

# Full scope: every change since BASE, INCLUDING uncommitted working tree.
git diff --stat "$BASE"
git diff "$BASE"            > tmp/review/<feature>/changes.diff   # the review diff
```

Notes:
- `git diff $BASE` (no second ref) compares BASE against the working tree, so it
  captures committed spec work *and* current uncommitted edits in one diff.
- If the spec touched files later reverted, the net diff still reflects final state.
- Always include the spec file itself; quote its `Requirement Details`,
  `Execution Plan`, and `Test and Acceptance Criteria` into `scope.md` as the
  acceptance standard.

## Case 2 — review the uncommitted code (spec as standard)

```bash
git diff --stat HEAD                       # unstaged + staged vs HEAD
git diff HEAD > tmp/review/<feature>/changes.diff
```

- Do not widen to committed history. The diff target is only the working tree.
- If an active spec exists, still quote its requirement/acceptance sections into
  `scope.md` as the **standard** the uncommitted code is judged against.
- If `git diff HEAD` is empty, tell the user there is nothing uncommitted to review.

## Case 3 — no active spec

```bash
if ! git diff --quiet HEAD; then
  git diff HEAD > tmp/review/<feature>/changes.diff               # uncommitted
else
  BASE=main; git rev-parse --verify main >/dev/null 2>&1 || BASE=master
  git rev-parse --verify "$BASE" >/dev/null 2>&1 \
    && git diff "${BASE}...HEAD" > tmp/review/<feature>/changes.diff \
    || echo "No uncommitted changes and no main/master base — ask the user for a base ref."
fi
```

## Feature slug

```bash
if [ -n "$SPEC_ID" ]; then
  SLUG="$(sed -nE 's/.*-S[0-9.]+-(.*)\.md/\1/p' <<<"$SPEC_FILE")"
  FEATURE="${SPEC_ID}-${SLUG}"                 # e.g. S0044-update-compatibility-foundation
else
  FEATURE="$(git rev-parse --abbrev-ref HEAD | tr '/' '-')"   # branch name
fi
mkdir -p "tmp/review/$FEATURE" "code_review/$FEATURE"
```
