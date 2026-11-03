#!/usr/bin/env bash
# Run one skill's Promptfoo suite against a fresh Claude agent in a disposable workspace.
# Usage: [EVAL_SUITE=<name>] evals/run.sh <skill> [extra promptfoo eval args...]
# EVAL_SUITE selects evals/<skill>/<name>.yaml (default: promptfooconfig).
set -euo pipefail

fail() { echo "evals/run.sh: $*" >&2; exit 2; }

[ $# -ge 1 ] || fail "usage: evals/run.sh <skill> [promptfoo args...]"
skill="$1"; shift

root="$(cd "$(dirname "$0")/.." && pwd)"
config="$root/evals/$skill/${EVAL_SUITE:-promptfooconfig}.yaml"
[ -f "$config" ] || fail "no suite at ${config#$root/}"

skill_dir="$(find "$root/skills" -mindepth 2 -maxdepth 2 -type d -name "$skill" | head -n 1)"
[ -n "$skill_dir" ] && [ -f "$skill_dir/SKILL.md" ] || fail "no skill named $skill under skills/*/"

command -v node >/dev/null || fail "node not found"
node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=22)?0:1)' \
  || fail "Node $(node --version) is too old; Promptfoo 0.122.0 needs >=22.22.0 (try: nvm use 24)"

promptfoo="$root/node_modules/.bin/promptfoo"
[ -x "$promptfoo" ] || fail "promptfoo not installed; run: npm ci"

claude_link="$(command -v claude)" || fail "claude not found; the agent under test is the local Claude Code"
claude_bin="$(node -e 'console.log(require("fs").realpathSync(process.argv[1]))' "$claude_link")"

eval_root="$(mktemp -d "${TMPDIR:-/tmp}/cauu-skill-eval.XXXXXX")"
mkdir -p "$eval_root/promptfoo"

# The provider forwards its whole parent environment to the agent, so start
# Promptfoo from an allowlist. HOME and USER are required for the local login.
set +e
env -i \
  PATH="$(dirname "$(command -v node)"):/usr/bin:/bin:/usr/sbin:/sbin" \
  HOME="$HOME" USER="$USER" TMPDIR="${TMPDIR:-/tmp}" LANG="${LANG:-en_US.UTF-8}" \
  EVAL_SKILL="$skill" EVAL_SKILL_DIR="$skill_dir" EVAL_SUITE_DIR="$root/evals/$skill" \
  EVAL_WORKSPACE="$eval_root/workspace" EVAL_CLAUDE_BIN="$claude_bin" \
  PROMPTFOO_CONFIG_DIR="$eval_root/promptfoo" PROMPTFOO_DISABLE_TELEMETRY=1 \
  PROMPTFOO_DISABLE_UPDATE=1 PROMPTFOO_DISABLE_SHARING=1 PROMPTFOO_REQUEST_TIMEOUT_MS=600000 \
  "$promptfoo" eval -c "$config" --no-cache --no-share --max-concurrency 1 \
    -o "$eval_root/result.json" "$@"
status=$?
set -e

echo "evals/run.sh: raw result $eval_root/result.json (exit $status)"
exit "$status"
