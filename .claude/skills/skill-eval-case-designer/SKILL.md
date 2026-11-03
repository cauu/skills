---
name: skill-eval-case-designer
description: Design or revise minimal Promptfoo behavior cases for a skill in this repository. Use when a skill's public behavior, historical defect, boundary, or stop rule must become a reviewable case under evals/<skill>/, without building a runner, an assertion framework, or a release gate.
metadata:
  internal: true
---

# Skill Eval Case Designer

Design the smallest case set that protects the target skill's important public behavior. Cases are repository source pending human approval. They are never proof that the skill is good.

## Layout

```text
evals/
├── run.sh                      fresh Claude agent, disposable workspace, env allowlist
├── lib/claude-provider.yaml    shared agent under test
├── lib/hooks.cjs               rebuilds the workspace from vars.fixture before each test
├── lib/workspace.cjs           read-only helpers for assertions
└── <skill>/
    ├── promptfooconfig.yaml
    ├── case-review.md
    ├── fixtures/<fixture>/     initial files copied into the workspace
    └── assert/<check>.cjs      assertions, never visible to the agent
```

Cases live outside `skills/` so skills.sh never installs them. Run a suite with `evals/run.sh <skill>`.

## Workflow

1. Read the target `SKILL.md`, its existing `evals/<skill>/`, and only what you need to understand observable behavior.
2. Name the behavior or historical defect to protect, its regression risk, and the evidence a program can inspect after the agent finishes: final output, files, or Git state in the workspace.
3. One case per distinct risk. Add positive, non-application, boundary, or stop cases only when the skill needs them. No quotas.
4. Write the fixture as the smallest realistic project state that exercises the behavior. Write the task as a neutral, realistic user request.
5. Write assertions as `.cjs` files under `assert/` and reference them with `file://`. Inline JavaScript assertions cannot `require` modules.
6. Validate the suite source, then write the human-review summary in `case-review.md`. Do not approve the cases yourself.

## Case contract

```yaml
description: <skill> behavior cases
providers: file://../lib/claude-provider.yaml
extensions:
  - file://../lib/hooks.cjs:extensionHook
prompts:
  - "{{task}}"
tests:
  - description: concise human label
    vars:
      fixture: <directory under fixtures/>
      task: <neutral user request>
    options:
      repeat: 1
    metadata:
      caseId: <skill>.<behavior>
      repeat: 1
      minPassRate: 1.0
      behavior: public behavior or historical defect protected
      regressionRisk: consequence if the behavior breaks
      knownOmissions:
        - material behavior deliberately outside this case
    assert:
      - type: javascript
        value: file://assert/<check>.cjs
```

- `caseId` is the stable identity. Descriptions and agent output are not.
- `repeat` is a positive integer and equals `metadata.repeat`. Use more than one only for genuinely variable behavior, and say why in `case-review.md`.
- `minPassRate` is a number from 0 through 1.

## Integrity rules

- Expected values, assertion code, and pass criteria never appear in the task or in fixtures.
- The task names the candidate skill only when the case tests application, not routing. Say which in `case-review.md`.
- Assert observable results. Never assert hidden reasoning, or that the agent merely mentioned the skill.
- Prefer deterministic assertions. Use an LLM judge only when no deterministic signal is adequate, and disclose it.
- Prove each assertion can fail: name a contrasting fixture or agent outcome that the same assertion rejects.
- Preserve historical regression cases. When a case or assertion changes, record the intent change instead of silently weakening the exam.

## Human-review summary

Write `evals/<skill>/case-review.md` with:

- cases added, changed, and deleted, by `caseId`;
- the behavior and regression risk each case protects;
- repetition, threshold, and whether the task names the skill;
- known omissions and remaining semantic judgments;
- validation performed and evidence still pending.

Stop after the cases and the summary. A human owns approval and the interpretation of results.
