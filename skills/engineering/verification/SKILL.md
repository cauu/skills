---
name: verification
description: Generate and maintain a project-local verification tool, verify-<app>, that launches the real app, checks its health, drives features the way a user does, records evidence, and cleans up. Use for "verification create", "verification maintain --scope <diff>", or "verification maintain".
disable-model-invocation: true
---

# Verification

Build the tool an agent uses to check behavior on the real app. The tool fixes how to launch, drive, and collect evidence once, so later agents reuse it instead of rediscovering it. It does not define what passes: acceptance criteria belong to whoever asks for the check.

Write the tool for an agent that reads it cold, mid-task, and has never seen the app.

## Commands

- `create`: the project has no tool and a check needs the real app.
- `maintain --scope <diff>`: after a change to user-visible behavior, for example as the last item of a spec. `<diff>` is a Git range or a list of changed paths.
- `maintain`: a full pass, run periodically or when a drive fails because the tool is out of date.

## Generated layout

```text
docs/verification/<app>/
├── README.md            Last full run, Launch, Doctor, Drive, Evidence, Cleanup, Helpers, Isolation
├── drive-contract.md    verbatim copy of references/drive-contract.md
├── features/
│   ├── README.md        preconditions, conventions, reporting, index
│   └── <feature-id>.md
└── scripts/             control scripts, when the app needs them
.claude/skills/verify-<app>/SKILL.md    wrapper for Claude Code (Cursor reads it too)
.agents/skills/verify-<app>/SKILL.md    wrapper for Codex and Cursor
.verify-artifacts/                      evidence, listed in .gitignore
```

The body under `docs/verification/<app>/` is the only source of instructions. Each wrapper holds only this, filled in:

```markdown
---
name: verify-<app>
description: Launch <app> and drive its <surfaces> the way a user does, with evidence. Use to check <app> behavior, or for a check written as verify:<feature-id>/<sub-feature>.
---

Read docs/verification/<app>/README.md and follow it. The feature map is docs/verification/<app>/features/README.md.
```

Write both wrappers unless the project clearly uses only one of these harnesses.

The tool's files are the body, the wrappers, and the `.verify-artifacts/` line in `.gitignore`. This skill edits nothing else. Product code is out of scope.

## create

1. **Read the repo before asking.** From code, docs, and scripts, find: the surfaces a user touches (web UI, CLI or TUI, desktop, API, mobile, contract), how the app starts locally (ports, env, seed data, auth), how an agent can drive it (existing Playwright or Cypress specs, PTY or tmux, HTTP, a debug port, a local chain), what evidence it can capture, and whether two instances can run side by side. Ask the user only what the code cannot show.
2. **Get a working base.** If the app does not build or start, fix what is environment (install dependencies, create local config from the documented sample) and retry. A change to tracked product code needs the user's approval. Otherwise report the exact failing step. Instructions written against a broken base teach wrong steps.
3. **Write the body and wrappers.** No placeholders. Copy [references/drive-contract.md](references/drive-contract.md) verbatim into the body directory. Add `.verify-artifacts/` to `.gitignore`. Body sections:
   - `Last full run:` the first line after the title: `<run-id>` once proven, `none (draft: <failed step and reason>)` until then.
   - **Launch:** the exact command and how to tell the app is ready. Ready means usable from an empty data directory, after migrations and seed data, not merely that a process answers. For a short-lived CLI, launch means building once; each drive then runs in its own isolated session.
   - **Doctor:** one read-only check that this instance is worth driving: process up, the checked-out build, the port owned by this run, auth valid. JSON output.
   - **Drive:** the recipe with this repo's real selectors, commands, and routes. Prefer stable handles (roles and accessible names, data attributes, prompt strings, route paths) over coordinates and tab order.
   - **Evidence:** what to capture for each surface and where, per the drive contract.
   - **Cleanup:** stop exactly what this run started and remove scratch state. Never remove evidence.
   - **Helpers:** every script, executable, with its invocation shown.
   - **Isolation:** what is derived from the run-id, or `Single instance only: <reason>`.
4. **Seed the feature map.** Pick the 3 to 5 main user-facing features from routes, commands, menus, and docs. Follow [references/feature-map-example/](references/feature-map-example/README.md): an index and one file per feature with the five H2 sections. In `Source entry points`, list every file whose change can alter the feature; `maintain --scope` relies on it.
5. **Prove it before handing it over.** Run the tool's own instructions: Launch, Doctor, drive one mapped feature, capture evidence, Cleanup, then confirm the evidence still exists at its location. When a step fails, fix the tool, run Cleanup, and retry. Then set `Last full run:` to the run-id. A tool that never completed this run is a draft: keep `Last full run: none (draft: ...)`, do not commit it, and report it as a draft with the failed step and what it needs.
6. **Name what a stand-in skipped.** If the run used a stand-in for the real target (a container for a fresh machine, a local chain for a testnet), list every step the stand-in did that the target will not; those stay unverified. Replacing a part the app owns, such as its database, with a fake is not a stand-in.
7. **Hand over.** Commit the tool's files in one commit, without evidence. Report the tool path, the mapped features, the run-id and evidence path, and anything unverified.

## maintain

Both forms share these rules:

- **Find the tool.** Look for `verify-*` wrappers in the agent skill directories at the project root, and the body they point to. None: stop and suggest `create`. Several: ask which one.
- **Edit scope.** Only the tool's files. Never product code.
- **Triage** every mismatch between the tool and the app:
  - doc drift, the app changed on purpose: fix the feature file;
  - harness gap, the app works but the recipe cannot drive it: fix the recipe or script, then drive it again;
  - product regression, the app does not do what the project intends: report it with evidence, and change neither the product nor the tool to match it.

  The change is on purpose when a commit, spec, changelog, or the feature's other entry points agree with the new behavior. It is a regression when the project's stated intent (spec, README, tests, other entry points) still says otherwise. When you cannot tell, report it as a possible regression and ask.
- **Drive** per the tool's Launch model and its drive contract. Whatever fails, keep three invariants: run Doctor before the first drive and after any failed drive; evidence survives every cleanup, checked at its location; nothing a drive started outlives the run. If Doctor fails because the tool is out of date, fix it and retry once before calling the pass `blocked`.
- **Outcome**, exactly one:
  - `clean`: everything driven matched. No edits, no commit.
  - `changed`: proven corrections to the tool. Re-read every changed file and commit once. Only a full pass sets `Last full run:` to this run; a scoped pass leaves it, because the next full pass checks changes since that line.
  - `blocked`: the pass could not finish, or a fix could not be proven. Say what blocked it.

  Report the outcome, each feature driven with its result, and every product regression.

### maintain --scope <diff>

1. List the changed paths (`git diff --name-only <range>`, or the paths given).
2. A feature is affected when a changed path appears in its `Source entry points`. A user-facing entry point added by the diff (route, command, flag, menu item, screen) that no feature covers is a new feature. A changed path that matches nothing and adds no entry point affects nothing; say so.
3. Update the affected features' recipes and `Source entry points`. Add a file and an index entry for each new feature.
4. Drive every affected and new feature once. Do not drive or edit any other feature; an unmapped dependency missed here is caught by the full pass.
5. When the run belongs to a spec, append one evidence line per driven feature to that spec's validation evidence, in the spec's format.

### maintain (full)

1. **Index.** Fix missing, extra, duplicate, or dead entries in `features/README.md`.
2. **Read the source per feature.** Use one read-only subagent per feature file when the harness has subagents; otherwise read them in turn. Each returns a summary, the source entry points, likely drift with file citations, and one recipe to drive the feature. Readers never drive the app or edit files.
3. **Reconcile.** Merge the recipes into as few app states as practical. Spot-check cited drift. Check changes since `Last full run:` for user-facing entry points the map lacks; name a concrete source path before calling one missing.
4. **Drive every feature at least once,** even when the source looks clean. A feature is `unreachable` only with the missing prerequisite and the path tried; if the map omits that prerequisite, that is drift.
5. **Triage and finish** as above.
