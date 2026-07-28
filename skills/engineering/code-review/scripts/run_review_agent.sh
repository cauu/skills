#!/usr/bin/env bash
# Run an external agent as an isolated, headless code reviewer.
# The wrapper captures the final response under
# code_review/<feature>/<reviewer-id>-<provider>.md.
#
# Usage:
#   run_review_agent.sh <provider> <reviewer_id> <feature> <prompt_file>
#     provider      claude | codex | cursor
#     reviewer_id   stable slot ID, for example review-01
#     feature       folder name under code_review/ and tmp/review/
#     prompt_file   shared, self-contained review prompt
#
# Env overrides (space-separated extra flags, applied verbatim):
#   CLAUDE_EXTRA_ARGS   extra args for `claude -p`
#   CODEX_EXTRA_ARGS    extra args for `codex exec`
#   CURSOR_EXTRA_ARGS   extra args for `cursor-agent -p`
#   REVIEW_TIMEOUT      seconds before killing the run (default: 900)
set -uo pipefail

provider="${1:-}"
reviewer_id="${2:-}"
feature="${3:-}"
prompt_file="${4:-}"

if [[ -z "$provider" || -z "$reviewer_id" || -z "$feature" || -z "$prompt_file" ]]; then
  echo "usage: run_review_agent.sh <claude|codex|cursor> <reviewer_id> <feature> <prompt_file>" >&2
  exit 2
fi

if [[ ! "$reviewer_id" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "invalid reviewer_id: $reviewer_id" >&2
  exit 2
fi
if [[ ! "$feature" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "invalid feature: $feature" >&2
  exit 2
fi
[[ -f "$prompt_file" ]] || {
  echo "prompt file not found: $prompt_file" >&2
  exit 2
}

# Pre-flight: verify the selected provider before creating artifacts.
case "$provider" in
  claude)
    command -v claude >/dev/null 2>&1 || {
      echo "SKIP claude: not in PATH" >&2
      exit 3
    }
    claude auth status >/dev/null 2>&1 || {
      echo "SKIP claude: not authenticated" >&2
      exit 3
    }
    ;;
  codex)
    command -v codex >/dev/null 2>&1 || {
      echo "SKIP codex: not in PATH" >&2
      exit 3
    }
    codex login status >/dev/null 2>&1 || {
      echo "SKIP codex: not authenticated" >&2
      exit 3
    }
    ;;
  cursor)
    command -v cursor-agent >/dev/null 2>&1 || {
      echo "SKIP cursor: cursor-agent not in PATH" >&2
      exit 3
    }
    cursor-agent status >/dev/null 2>&1 || {
      echo "SKIP cursor: not authenticated" >&2
      exit 3
    }
    ;;
  *)
    echo "unknown provider: $provider (expected claude|codex|cursor)" >&2
    exit 2
    ;;
esac

out_dir="code_review/${feature}"
log_dir="tmp/review/${feature}"
out_md="${out_dir}/${reviewer_id}-${provider}.md"
timestamp="$(date +%Y%m%dT%H%M%S)"
log_file="${log_dir}/${reviewer_id}-${provider}.${timestamp}.log"
mkdir -p "$out_dir" "$log_dir"

timeout_seconds="${REVIEW_TIMEOUT:-900}"
run_with_timeout() {
  if command -v timeout >/dev/null 2>&1; then
    timeout "$timeout_seconds" "$@"
  else
    "$@"
  fi
}

prompt="$(cat "$prompt_file")"
prompt+=$'\n\n--- REVIEWER IDENTITY ---\n'
prompt+="Reviewer ID: ${reviewer_id}"
prompt+=$'\nProvider: '"${provider}"
prompt+=$'\nExecution: external-cli\n'
prompt+=$'\nOutput contract:\n'
prompt+=$'1. Return the complete Markdown review as the single final response.\n'
prompt+=$'2. Do not write or modify any file.\n'
prompt+=$'3. Do not modify product code, commit, or revert changes.\n'
prompt+=$'4. Do not include progress updates or internal reasoning.\n'

rc=0
case "$provider" in
  claude)
    cmd=(claude -p --output-format text
      --allowedTools Read Glob Grep
      --disallowedTools Edit Write NotebookEdit Bash)
    # shellcheck disable=SC2206
    [[ -n "${CLAUDE_EXTRA_ARGS:-}" ]] && cmd+=(${CLAUDE_EXTRA_ARGS})
    cmd+=("$prompt")
    run_with_timeout "${cmd[@]}" >"$log_file" 2>&1
    rc=$?
    ;;
  codex)
    cmd=(codex exec --ephemeral --sandbox read-only --cd "$PWD" --output-last-message "$out_md")
    # shellcheck disable=SC2206
    [[ -n "${CODEX_EXTRA_ARGS:-}" ]] && cmd+=(${CODEX_EXTRA_ARGS})
    cmd+=("$prompt")
    run_with_timeout "${cmd[@]}" >"$log_file" 2>&1
    rc=$?
    ;;
  cursor)
    cmd=(cursor-agent -p --output-format text --workspace "$PWD")
    # shellcheck disable=SC2206
    [[ -n "${CURSOR_EXTRA_ARGS:-}" ]] && cmd+=(${CURSOR_EXTRA_ARGS})
    cmd+=("$prompt")
    run_with_timeout "${cmd[@]}" >"$log_file" 2>&1
    rc=$?
    ;;
esac

if (( rc != 0 )); then
  echo "ERROR: ${reviewer_id}/${provider} exited rc=${rc}; see ${log_file}" >&2
  exit 1
fi

# Claude and Cursor return their text through stdout. Codex writes its final
# message directly via --output-last-message.
if [[ "$provider" != "codex" && -s "$log_file" ]]; then
  cp "$log_file" "$out_md"
fi

if [[ ! -s "$out_md" ]]; then
  echo "ERROR: ${reviewer_id}/${provider} produced no review (rc=${rc}); see ${log_file}" >&2
  exit 1
fi

echo "ok: ${reviewer_id}/${provider} -> ${out_md} (rc=${rc}, log: ${log_file})"
