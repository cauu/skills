#!/usr/bin/env bash
# Check that spec-lint sees the verification skill's generated layout (decision D1)
# as "the project has a verify-<app> skill": the body lives in docs/verification/<app>/,
# thin verify-<app> wrappers live in the agent skill directories at the project root.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
lint="$root/skills/engineering/immutable-spec/scripts/spec-lint"
spec="$root/tests/spec-lint/cases/close-needs-verify-update/spec.md"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
failures=0

make_repo() { # name, then wrapper dirs to create
  local repo="$tmp/$1"; shift
  mkdir -p "$repo/docs/verification/notes/features"
  echo "# Verify notes" > "$repo/docs/verification/notes/README.md"
  for dir in "$@"; do
    mkdir -p "$repo/$dir/verify-notes"
    printf -- '---\nname: verify-notes\ndescription: wrapper\n---\nRead docs/verification/notes/README.md.\n' > "$repo/$dir/verify-notes/SKILL.md"
  done
  echo "$repo"
}

check() { # name, want ("update required" or "ok"), wrapper dirs...
  local name="$1" want="$2"; shift 2
  local repo; repo="$(make_repo "$name" "$@")"
  local output status
  output="$("$lint" --stage close --repo "$repo" "$spec" 2>&1)"; status=$?
  if [ "$want" = "update required" ]; then
    [ $status -eq 1 ] && grep -qF "verification tool update" <<<"$output" && ok=yes || ok=no
  else
    [ $status -eq 0 ] && ok=yes || ok=no
  fi
  if [ "$ok" = yes ]; then echo "ok   $name: $want (exit $status)"; else
    echo "FAIL $name: want $want, got exit $status"; echo "$output" | sed 's/^/     /'; failures=$((failures + 1)); fi
}

check claude-wrapper-only  "update required" .claude/skills
check agents-wrapper-only  "update required" .agents/skills
check both-wrappers        "update required" .claude/skills .agents/skills
check body-without-wrapper "ok"
echo "verification layout: $failures failure(s)"
exit $((failures > 0))
