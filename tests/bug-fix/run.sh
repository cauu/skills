#!/usr/bin/env bash
# Structure checks for skills/engineering/bug-fix (repository-only, not installed).
# Usage: tests/bug-fix/run.sh <structure|gates|install>...
set -uo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
skill="$root/skills/engineering/bug-fix"
[ $# -ge 1 ] || { echo "usage: $0 <structure|gates|install>..." >&2; exit 2; }

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
        if "disable-model-invocation" in fields:
            problems.append("skill must be model-invoked (remove disable-model-invocation)")
    links = re.findall(r"\]\(([^)#\s]+)(?:#[^)]*)?\)", text)
    for link in (l for l in links if not re.match(r"^[a-z]+:", l)):
        if not os.path.exists(os.path.join(skill, link)):
            problems.append(f"SKILL.md links missing file {link}")
elif check == "gates":
    text = read(os.path.join(skill, "SKILL.md"))
    found = re.findall(r"<!-- gate:([a-z]+) -->\n.*?\n<!-- /gate -->", text, re.S)
    if found != ["bugfix"]:
        problems.append(f"expected exactly the bugfix gate block, found {found}")
elif check == "install":
    yaml = read(os.path.join(skill, "agents/openai.yaml"))
    if "display_name:" not in yaml:
        problems.append("openai.yaml has no display_name")
    if re.search(r"allow_implicit_invocation:\s*false", yaml):
        problems.append("openai.yaml forbids implicit invocation; the skill is model-invoked")
    readme = read(os.path.join(root, "README.md"))
    skills_section = section(readme, "Engineering Skills") or ""
    model_invoked = skills_section.split("### Model-invoked", 1)[1] if "### Model-invoked" in skills_section else ""
    if "(./skills/engineering/bug-fix/SKILL.md)" not in model_invoked:
        problems.append("README has no model-invoked entry for bug-fix")
    if not re.search(r"^\s+[├└]── bug-fix/", readme, re.M):
        problems.append("README repository structure does not list bug-fix/")
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
echo "bug-fix checks: $failures failure(s)"
exit $((failures > 0))
