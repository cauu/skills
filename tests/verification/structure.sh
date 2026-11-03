#!/usr/bin/env bash
# Structure check for skills/engineering/verification (S0001 TC-1).
# Usage: tests/verification/structure.sh [contract|feature-map|skill|meta]...  (no argument: all parts)
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
skill="$root/skills/engineering/verification"
failures=0
ok()   { echo "ok   $*"; }
bad()  { echo "FAIL $*"; failures=$((failures + 1)); }
need() { [ -f "$1" ] && ok "exists ${1#$root/}" || bad "missing ${1#$root/}"; }

check_contract() {
  local f="$skill/references/drive-contract.md"
  need "$f"; [ -f "$f" ] || return
  # Result words: the backticked words that open the bullets of the "## Results" section.
  local words
  words="$(awk '/^## /{on=($0=="## Results")} on && /^- `[a-z-]+`/' "$f" | sed -E 's/^- `([a-z-]+)`.*/\1/' | tr '\n' ' ' | sed 's/ $//')"
  [ "$words" = "pass fail inconclusive unreachable" ] && ok "result words: $words" || bad "result words are '$words', want 'pass fail inconclusive unreachable'"
  for phrase in '.verify-artifacts/<run-id>/<feature-id>/' 'gitignore' '--dry-run' 'JSON' '--help' 'run-id'; do
    grep -qF -- "$phrase" "$f" && ok "contract mentions $phrase" || bad "contract does not mention $phrase"
  done
}

check_feature_map() {
  local dir="$skill/references/feature-map-example"
  need "$dir/README.md"
  local want=$'Sub-features\nHow to get to it (user POV)\nDriving it with *\nGotchas\nSource entry points' count=0
  for f in "$dir"/*.md; do
    [ "$(basename "$f")" = README.md ] && continue
    count=$((count + 1))
    local got; got="$(grep '^## ' "$f" | sed 's/^## //')"
    local i=0 line okay=yes
    while IFS= read -r line; do
      i=$((i + 1)); pattern="$(sed -n "${i}p" <<<"$want")"
      # shellcheck disable=SC2053
      [[ "$line" == $pattern ]] || okay=no
    done <<<"$got"
    [ "$i" -eq 5 ] || okay=no
    [ $okay = yes ] && ok "five H2s in order: ${f#$root/}" || bad "H2s in ${f#$root/}: $(tr '\n' '|' <<<"$got")"
    grep -qF "$(basename "$f")" "$dir/README.md" && ok "indexed: $(basename "$f")" || bad "README does not index $(basename "$f")"
  done
  [ $count -ge 2 ] && ok "$count feature files" || bad "only $count feature files"
}

check_skill() {
  local f="$skill/SKILL.md"
  need "$f"; [ -f "$f" ] || return
  [ "$(sed -n 1p "$f")" = "---" ] && ok "frontmatter opens" || bad "no frontmatter"
  local name; name="$(awk 'NR>1 && /^---$/{exit} /^name:/{print $2}' "$f")"
  [ "$name" = "$(basename "$skill")" ] && ok "name: $name" || bad "name '$name' does not match directory"
  awk 'NR>1 && /^---$/{exit} /^description: ./{found=1} END{exit !found}' "$f" && ok "description present" || bad "no description"
  # Every relative link in SKILL.md and references/*.md resolves.
  local doc link target
  for doc in "$f" "$skill"/references/*.md "$skill"/references/*/*.md; do
    [ -f "$doc" ] || continue
    while IFS= read -r link; do
      case "$link" in http*|\#*|mailto:*) continue;; esac
      target="$(dirname "$doc")/${link%%#*}"
      [ -e "$target" ] && ok "link ${doc#$skill/} -> $link" || bad "broken link ${doc#$skill/} -> $link"
    done < <(grep -oE '\]\([^)]+\)' "$doc" | sed -E 's/^\]\((.*)\)$/\1/')
  done
  # Standalone: no instruction to install or require another skill.
  if grep -inE '(require|install|depends? on)[^.]*\b(immutable-spec|spec-design|bug-fix|code-review|aiken-debug|tdd|challenge)\b' "$f"; then
    bad "SKILL.md requires another skill"
  else ok "SKILL.md requires no other skill"; fi
  grep -nE '\b(TODO|TBD|FIXME)\b' "$f" && bad "placeholder in SKILL.md" || ok "no placeholders"
  local heading
  for heading in '## Generated layout' '## create' '## maintain' '### maintain --scope <diff>' '### maintain (full)'; do
    grep -qxF "$heading" "$f" && ok "section: $heading" || bad "missing section: $heading"
  done
  local outcomes
  outcomes="$(awk '/^- \*\*Outcome\*\*/{on=1; next} on && /^  - `[a-z]+`/{print} on && /^- /{on=0}' "$f" | sed -E 's/^  - `([a-z]+)`.*/\1/' | tr '\n' ' ' | sed 's/ $//')"
  [ "$outcomes" = "clean changed blocked" ] && ok "maintain outcomes: $outcomes" || bad "maintain outcomes are '$outcomes', want 'clean changed blocked'"
}

check_meta() {
  local y="$skill/agents/openai.yaml"
  need "$y"
  for key in display_name short_description default_prompt allow_implicit_invocation; do
    grep -q "$key:" "$y" 2>/dev/null && ok "openai.yaml has $key" || bad "openai.yaml lacks $key"
  done
  grep -qF '(./skills/engineering/verification/SKILL.md)' "$root/README.md" && ok "README lists verification" || bad "README does not list verification"
}

parts=("$@"); [ ${#parts[@]} -gt 0 ] || parts=(contract feature-map skill meta)
for part in "${parts[@]}"; do
  case "$part" in
    contract) check_contract;; feature-map) check_feature_map;; skill) check_skill;; meta) check_meta;;
    *) echo "unknown part $part" >&2; exit 2;;
  esac
done
echo "verification structure (${parts[*]}): $failures failure(s)"
exit $((failures > 0))
