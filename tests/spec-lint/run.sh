#!/usr/bin/env bash
# Run spec-lint over every fixture and compare with the expected outcome.
# expect: empty = must pass with exit 0; otherwise a substring the output must contain.
# Error cases must exit 1; "legacy spec" must exit 0.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
lint="$root/skills/engineering/immutable-spec/scripts/spec-lint"
failures=0
for dir in "$here"/cases/*/; do
  name="$(basename "$dir")"
  args="$(cat "$dir/args")"
  args="${args//REPO_WITH_VERIFY/$here/repo-with-verify}"
  args="${args//REPO_WITHOUT_VERIFY/$here/repo-without-verify}"
  expect="$(cat "$dir/expect")"
  # shellcheck disable=SC2086
  output="$("$lint" $args "$dir/spec.md" 2>&1)"; status=$?
  if [ -z "$expect" ]; then
    want=0; ok=$([ $status -eq 0 ] && echo yes || echo no)
  elif [ "$expect" = "legacy spec" ]; then
    want=0; ok=$([ $status -eq 0 ] && grep -q "legacy spec" <<<"$output" && echo yes || echo no)
  else
    want=1; ok=$([ $status -eq 1 ] && grep -qF "$expect" <<<"$output" && echo yes || echo no)
  fi
  if [ "$ok" = yes ]; then
    echo "ok   $name (exit $status)"
  else
    echo "FAIL $name (exit $status, want $want, expect '${expect}')"; echo "$output" | sed 's/^/     /'
    failures=$((failures + 1))
  fi
done
echo "spec-lint fixtures: $failures failure(s)"
exit $((failures > 0))
