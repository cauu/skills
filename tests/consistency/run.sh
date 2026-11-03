#!/usr/bin/env bash
# Mutation test for scripts/check-skill-consistency.py.
# Each mutation runs on a disposable copy of skills/ and must make the check fail.
set -uo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
check="$root/scripts/check-skill-consistency.py"
failures=0

fresh() {
  work="$(mktemp -d)"
  cp -R "$root/skills" "$work/skills"
  # A stand-in for an independently installable skill that inlines the bugfix gate.
  mkdir -p "$work/skills/engineering/gate-consumer"
  {
    printf -- '---\nname: gate-consumer\ndescription: fixture\n---\n\n'
    python3 - "$root/skills/engineering/immutable-spec/SKILL.md" <<'PY'
import re, sys
text = open(sys.argv[1]).read()
print(re.search(r"<!-- gate:bugfix -->\n.*?\n<!-- /gate -->", text, re.S).group(0))
PY
  } > "$work/skills/engineering/gate-consumer/SKILL.md"
  echo "$work"
}

expect() { # expect <ok|fail> <label> <dir>
  output="$("$check" "$3" 2>&1)"; status=$?
  if { [ "$1" = ok ] && [ $status -eq 0 ]; } || { [ "$1" = fail ] && [ $status -eq 1 ]; }; then
    echo "ok   $2 (exit $status)"
  else
    echo "FAIL $2 (exit $status, want $1)"; echo "$output" | sed 's/^/     /'; failures=$((failures + 1))
  fi
}

w="$(fresh)"; expect ok "unchanged copy with an inlined gate" "$w"
w="$(fresh)"; sed -i.bak 's/Reproduce before fixing\./Reproduce if convenient./' "$w/skills/engineering/gate-consumer/SKILL.md"; expect fail "inlined gate drifts from immutable-spec" "$w"
w="$(fresh)"; sed -i.bak 's/Reproduce before fixing\./Reproduce first./' "$w/skills/engineering/immutable-spec/SKILL.md"; expect fail "immutable-spec gate changes without updating the copy" "$w"
w="$(fresh)"; python3 - "$w/skills/engineering/immutable-spec/SKILL.md" <<'PY'
import re, sys
p = sys.argv[1]; t = open(p).read()
open(p, "w").write(re.sub(r"<!-- gate:refactor -->\n.*?\n<!-- /gate -->\n", "", t, flags=re.S))
PY
expect fail "immutable-spec loses a gate" "$w"
w="$(fresh)"; sed -i.bak 's/^## Decision Gates and Autonomy$/## Gates/' "$w/skills/engineering/immutable-spec/SKILL.md"; expect fail "orca references a renamed section" "$w"
echo "consistency mutations: $failures failure(s)"
exit $((failures > 0))
