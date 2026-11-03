# Drive contract

Rules for driving the real app to prove behavior. Every generated verification tool carries a copy of this file, so the agent driving the app needs nothing else installed. If the tool's own instructions conflict with this file, this file wins and the conflict is drift to report.

## Proof

1. Use the real user path: the UI, the CLI, or the public API a user or client calls. Never use internal setters, test-only endpoints, or direct data writes to produce the state you are about to check. Preconditions may be seeded with the tool's documented seed step.
2. Capture the action and the state after it. Confirm every side effect (file written, row inserted, message sent, transaction submitted) through a second, read-only view.
3. A dry-run or test mode proves only what it does. Observe what it actually skips (files, network, git refs, processes) before relying on it; never infer it from the name.
4. Mock only at a boundary production already isolates, such as a third-party API. Never replace a part the app owns (its database, its own services); a run against such a fake proves nothing about the app.
5. A feature with several entry points is verified only on the entry points actually driven. Never report one entry point as verified through another.
6. If a journey needs a precondition the environment lacks, report it; never weaken the journey until it passes.

## Evidence

- Store artifacts in `.verify-artifacts/<run-id>/<feature-id>/` at the project root. The directory is listed in `.gitignore`. Cleanup never deletes it.
- `run-id` is `<UTC timestamp YYYYMMDDTHHMMSSZ>-<worktree directory name>`, so runs from parallel worktrees never collide.
- Save per drive: the command or action, stdout, stderr, exit code, and the read-back of each side effect. For UI, also an accessibility snapshot and a screenshot that shows the app's identity.
- A spec evidence line quotes the key output in `output:`. Artifacts go in `files:` as a supplement only, because they are not committed and may be removed later.

## Results

Each drive ends with exactly one result:

- `pass`: the output meets the check.
- `fail`: the check ran and the behavior is not met.
- `inconclusive`: the check ran but the output does not decide it. It is not a pass. Hand it to the user.
- `unreachable`: the check could not run. Name the missing precondition and the paths tried.

## Isolation

- Derive everything an instance owns from the `run-id`: port, data directory, browser profile, config directory, container and network names. Two worktrees must be able to run at the same time.
- If that is impossible, the tool says so once near the top (`Single instance only: <reason>`), and Doctor fails when another instance is running.
- Drive only instances this run started. Record their process IDs and container names, and stop exactly those. Never kill by process name.

## Control scripts

- Few commands that compose, for example `launch`, `doctor`, `drive <feature-id>`, `cleanup`.
- Destructive operations support `--dry-run`.
- Results go to stdout as JSON; human-readable logs go to stderr.
- Every error says what to do next.
- `--help` documents every command and flag. Scripts are executable, and the tool's instructions show how to call each one.
