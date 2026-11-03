#!/usr/bin/env bash
# Structure checks for skills/engineering/spec-design (repository-only, not installed).
# Usage: tests/spec-design/run.sh <structure|gates|orca|red-flags|templates|install>...
set -uo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
skill="$root/skills/engineering/spec-design"
[ $# -ge 1 ] || { echo "usage: $0 <structure|gates|orca|red-flags|templates|install>..." >&2; exit 2; }

failures=0
for check in "$@"; do
  output="$(python3 - "$check" "$root" "$skill" <<'PY'
import os, re, sys
check, root, skill = sys.argv[1:4]
problems = []

def read(path):
    try:
        return open(path, encoding="utf-8").read()
    except OSError:
        problems.append(f"missing {os.path.relpath(path, root)}")
        return ""

def section(text, heading):
    match = re.search(rf"^## {re.escape(heading)}\s*$(.*?)(?=^## |\Z)", text, re.M | re.S)
    return match.group(1) if match else None

if check == "structure":
    text = read(os.path.join(skill, "SKILL.md"))
    front = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not front:
        problems.append("SKILL.md has no frontmatter")
    else:
        fields = dict(re.findall(r"^([a-z_-]+):\s*(.*)$", front.group(1), re.M))
        if fields.get("name") != os.path.basename(skill):
            problems.append(f"name {fields.get('name')!r} does not match directory {os.path.basename(skill)!r}")
        if not fields.get("description"):
            problems.append("description is empty")
    links = re.findall(r"\]\(([^)#\s]+)(?:#[^)]*)?\)", text)
    local = [l for l in links if not re.match(r"^[a-z]+:", l)]
    if not local:
        problems.append("SKILL.md links no local files")
    for link in local:
        if not os.path.exists(os.path.join(skill, link)):
            problems.append(f"SKILL.md links missing file {link}")
elif check == "gates":
    text = read(os.path.join(skill, "SKILL.md"))
    found = re.findall(r"<!-- gate:([a-z]+) -->\n.*?\n<!-- /gate -->", text, re.S)
    if sorted(found) != ["bugfix", "feature", "optimization", "refactor"]:
        problems.append(f"expected the four gate blocks once each, found {found}")
elif check == "orca":
    text = read(os.path.join(root, "skills/engineering/immutable-spec-orca/SKILL.md"))
    body = section(text, "Draft and Activation") or ""
    step = re.search(r"^3\. .*(?:\n {3}.*)*", body, re.M)
    step = step.group(0) if step else ""
    if "spec-design" not in step:
        problems.append("Draft and Activation step 3 does not point to spec-design")
    if not re.search(r"not installed|otherwise|without it", step):
        problems.append("step 3 does not say what to do when spec-design is not installed")
elif check == "red-flags":
    text = read(os.path.join(skill, "references/design-red-flags.md"))
    if "codebase-design" not in text:
        problems.append("design-red-flags.md does not point to codebase-design")
    terms = "Module|Interface|Implementation|Depth|Seam|Adapter|Leverage|Locality"
    redefined = re.findall(rf"^\*\*({terms})\*\*\s*[—:-]", text, re.M)
    if redefined:
        problems.append(f"redefines codebase-design terms: {redefined}")
    for term in ("interface", "seam", "depth"):
        if not re.search(rf"\b{term}\b", text, re.I):
            problems.append(f"does not use the term {term!r}")
elif check == "templates":
    rationale = read(os.path.join(skill, "references/rationale-template.md"))
    for heading in ("Problem", "Caller's view", "Shape", "Tradeoffs", "Rejected designs", "Open questions"):
        if section(rationale, heading) is None:
            problems.append(f"rationale-template.md has no '## {heading}'")
    brief = read(os.path.join(skill, "references/decision-brief.md"))
    for field in ("Recommendation", "Basis", "Risk"):
        if not re.search(rf"^\s*-?\s*{field}:", brief, re.M):
            problems.append(f"decision-brief.md has no '{field}:' field")
elif check == "install":
    yaml = read(os.path.join(skill, "agents/openai.yaml"))
    if "display_name:" not in yaml:
        problems.append("openai.yaml has no display_name")
    if not re.search(r"allow_implicit_invocation:\s*false", yaml):
        problems.append("openai.yaml does not declare user-only invocation")
    readme = read(os.path.join(root, "README.md"))
    user_invoked = section(readme, "Engineering Skills") or ""
    user_invoked = user_invoked.split("### Model-invoked")[0]
    if "(./skills/engineering/spec-design/SKILL.md)" not in user_invoked:
        problems.append("README has no user-invoked entry for spec-design")
    if not re.search(r"^\s+├── spec-design/|^\s+└── spec-design/", readme, re.M):
        problems.append("README repository structure does not list spec-design/")
else:
    print(f"unknown check {check}")
    sys.exit(2)

for problem in problems:
    print(problem)
sys.exit(1 if problems else 0)
PY
)"
  status=$?
  if [ $status -eq 0 ]; then
    echo "ok   $check"
  else
    echo "FAIL $check"; echo "$output" | sed 's/^/     /'; failures=$((failures + 1))
  fi
done
echo "spec-design checks: $failures failure(s)"
exit $((failures > 0))
