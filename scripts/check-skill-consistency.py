#!/usr/bin/env python3
"""Repository check: shared rules copied between skills must stay identical.

1. skills/*/immutable-spec/SKILL.md defines every evidence gate block.
2. Any other SKILL.md that inlines a gate block (<!-- gate:NAME --> ... <!-- /gate -->)
   uses exactly the same text as immutable-spec.
3. Any SKILL.md that declares <!-- requires: immutable-spec --> lists only
   immutable-spec sections that exist.

Usage: check-skill-consistency.py [REPO_ROOT]   (exit 0 ok, 1 inconsistent)
"""
import glob
import os
import re
import sys

GATES = ("feature", "optimization", "bugfix", "refactor")
GATE_BLOCK = re.compile(r"<!-- gate:([a-z]+) -->\n(.*?)\n<!-- /gate -->", re.S)
REQUIRES = "<!-- requires: immutable-spec -->"


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), ".."))
    skills = sorted(glob.glob(os.path.join(root, "skills", "*", "*", "SKILL.md")))
    base_paths = [p for p in skills if os.path.basename(os.path.dirname(p)) == "immutable-spec"]
    if len(base_paths) != 1:
        print(f"error: expected one immutable-spec skill, found {len(base_paths)}")
        return 1
    base_path = base_paths[0]
    base = open(base_path, encoding="utf-8").read()
    base_gates = dict(GATE_BLOCK.findall(base))
    base_sections = set(re.findall(r"^## (.+)$", base, re.M))
    errors = []

    for gate in GATES:
        if gate not in base_gates:
            errors.append(f"{rel(root, base_path)}: missing gate block '{gate}'")

    for path in skills:
        if path == base_path:
            continue
        text = open(path, encoding="utf-8").read()
        for gate, body in GATE_BLOCK.findall(text):
            if gate not in base_gates:
                errors.append(f"{rel(root, path)}: gate '{gate}' does not exist in immutable-spec")
            elif body != base_gates[gate]:
                errors.append(f"{rel(root, path)}: gate '{gate}' differs from immutable-spec")
        if REQUIRES in text:
            after = text.split(REQUIRES, 1)[1]
            listed = re.findall(r"^- ([A-Z][^:\n`]*?)\s*$", after.split("\n\n", 2)[1] if after.count("\n\n") >= 2 else "", re.M)
            if not listed:
                errors.append(f"{rel(root, path)}: requires immutable-spec but lists no sections")
            for section in listed:
                if section not in base_sections:
                    errors.append(f"{rel(root, path)}: references immutable-spec section '{section}', which does not exist")

    for error in errors:
        print(f"error: {error}")
    if not errors:
        print(f"ok: {len(base_gates)} gates in immutable-spec, {len(skills)} skills checked")
    return 1 if errors else 0


def rel(root, path):
    return os.path.relpath(path, root)


if __name__ == "__main__":
    sys.exit(main())
