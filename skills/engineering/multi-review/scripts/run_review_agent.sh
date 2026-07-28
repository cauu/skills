#!/usr/bin/env bash
# Run one external agent (codex|cursor) as a headless reviewer.
# It is told to WRITE its review to code_review/<feature>/<model>.md.
# Raw run output is always captured under tmp/review/<feature>/ as a fallback.
#
# Usage:
#   run_review_agent.sh <model> <feature> <prompt_file>
#     model        codex | cursor
#     feature      feature folder name under code_review/ and tmp/review/
#     prompt_file  file containing the shared review prompt
#
# Env overrides (space-separated extra flags, applied verbatim):
#   CODEX_EXTRA_ARGS    extra args for `codex exec`
#   CURSOR_EXTRA_ARGS   extra args for `cursor-agent`
#   REVIEW_TIMEOUT      seconds before killing the run   (default: 900)
set -uo pipefail

model="${1:-}"; feature="${2:-}"; prompt_file="${3:-}"
if [[ -z "$model" || -z "$feature" || -z "$prompt_file" ]]; then
  echo "usage: run_review_agent.sh <codex|cursor> <feature> <prompt_file>" >&2; exit 2
fi
[[ -f "$prompt_file" ]] || { echo "prompt file not found: $prompt_file" >&2; exit 2; }

# Pre-flight: verify the agent is usable BEFORE creating any artifact dirs.
case "$model" in
  codex)
    command -v codex >/dev/null 2>&1 || { echo "SKIP codex: not in PATH" >&2; exit 3; } ;;
  cursor)
    command -v cursor-agent >/dev/null 2>&1 || { echo "SKIP cursor: cursor-agent not in PATH" >&2; exit 3; }
    cursor-agent status >/dev/null 2>&1 || { echo "SKIP cursor: not authenticated (run: NO_OPEN_BROWSER=1 cursor-agent login)" >&2; exit 3; } ;;
  *)
    echo "unknown model: $model (expected codex|cursor)" >&2; exit 2 ;;
esac

out_md="code_review/${feature}/${model}.md"
log_dir="tmp/review/${feature}"
ts="$(date +%Y%m%dT%H%M%S)"
log_file="${log_dir}/${model}.${ts}.log"
mkdir -p "code_review/${feature}" "$log_dir"

timeout_s="${REVIEW_TIMEOUT:-900}"
run() { if command -v timeout >/dev/null 2>&1; then timeout "$timeout_s" "$@"; else "$@"; fi; }

# Compose the full prompt: shared body + explicit output target + token contract.
prompt="$(cat "$prompt_file")"
prompt+=$'\n\n--- OUTPUT TARGET ---\n'
prompt+="Write your complete review as Markdown to the file: ${out_md}"
prompt+=$'\nAlso print the same Markdown as your single final reply.\n'
prompt+=$'\nOutput contract:\n1. Reply only once, after the review is complete.\n2. No progress updates, no internal reasoning.\n3. Review only — do not modify any product code.\n'

rc=0
case "$model" in
  codex)
    cmd=(codex exec --cd "$PWD")
    # shellcheck disable=SC2206
    [[ -n "${CODEX_EXTRA_ARGS:-}" ]] && cmd+=(${CODEX_EXTRA_ARGS})
    cmd+=("$prompt")
    run "${cmd[@]}" >"$log_file" 2>&1; rc=$?
    ;;
  cursor)
    # Cursor uses its AUTO model selection: do NOT pass --model. Override only
    # via CURSOR_EXTRA_ARGS if the user explicitly wants a fixed model.
    cmd=(cursor-agent -p --output-format text --workspace "$PWD")
    # shellcheck disable=SC2206
    [[ -n "${CURSOR_EXTRA_ARGS:-}" ]] && cmd+=(${CURSOR_EXTRA_ARGS})
    cmd+=("$prompt")
    run "${cmd[@]}" >"$log_file" 2>&1; rc=$?
    ;;
  *)
    echo "unknown model: $model (expected codex|cursor)" >&2; exit 2 ;;
esac

# Fallback: if the agent did not create a non-empty md, salvage the captured log.
if [[ ! -s "$out_md" ]]; then
  if [[ -s "$log_file" ]]; then
    { echo "# ${model} review (recovered from run log)"; echo; cat "$log_file"; } > "$out_md"
    echo "WARN: ${model} did not write ${out_md}; recovered from ${log_file}" >&2
  else
    echo "ERROR: ${model} produced no output (rc=${rc}). See ${log_file}" >&2
    exit 1
  fi
fi

echo "ok: ${model} -> ${out_md} (rc=${rc}, log: ${log_file})"
