# Code Review Scope Resolution

Deterministic git commands for selecting review input. Run them from the
repository root.

## Explicit scope

Explicit user input always wins. Preserve the exact requested semantics:

```bash
# Commit or branch range supplied by the user.
git diff --stat "<base>...<head>"
git diff "<base>...<head>" > "tmp/review/<feature>/changes.diff"

# Exact two-endpoint diff supplied by the user.
git diff --stat "<base>" "<head>"
git diff "<base>" "<head>" > "tmp/review/<feature>/changes.diff"
```

For a PR, use the provider's read-only PR diff command when available. For an
explicit file list, add `-- <paths...>` to the selected git diff command.

## Uncommitted working tree

When the user does not provide a scope, prefer staged and unstaged changes:

```bash
git diff --stat HEAD
git diff HEAD > "tmp/review/<feature>/changes.diff"
```

Do not widen the scope when this diff is non-empty.

## Clean working tree fallback

When the working tree is clean:

```bash
if git rev-parse --verify main >/dev/null 2>&1; then
  BASE=main
elif git rev-parse --verify master >/dev/null 2>&1; then
  BASE=master
else
  echo "No uncommitted changes and no main/master base; ask the user for a scope."
fi

git diff --stat "${BASE}...HEAD"
git diff "${BASE}...HEAD" > "tmp/review/<feature>/changes.diff"
```

## Optional review standard

Use a requirement, design, acceptance, or policy document only when the user
supplies it or explicitly identifies its path. Record the path and relevant
content in `code_review/<feature>/scope.md`.

Do not scan conventional directories, infer document state, parse project-local
IDs, or derive commit ranges from document names. The standard constrains the
review criteria; it does not change the review scope unless the user explicitly
says so.

## Feature slug

Use a user-provided feature name when available. Otherwise derive a filesystem-
safe name from the explicit branch/range or current branch:

```bash
FEATURE="$(git rev-parse --abbrev-ref HEAD | tr '/ ' '--')"
mkdir -p "tmp/review/$FEATURE" "code_review/$FEATURE"
```
