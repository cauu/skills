# immutable-spec：“暂不批准”没有被记为关口退回

Spec-ID: S0011
Status: active
Change-Type: bugfix
Created Time: 2026-11-03T23:04:57+08:00
Start Time: 2026-11-03T23:04:57+08:00
Completion Time:
Previous Spec-ID: S0007
Closure Reason:

## 1. Requirement Details
- Background: 回归检查中，eval 用例 `immutable-spec.gate-log` 时而失败。用户说“需求没问题，关口 A 通过；先不批准激活，因为 TC-2 应该自动验证”时，agent 有时只记关口 A，对关口 B 不留任何记录，或写成 “Gate B pending”。
- Scope: 让 `immutable-spec` 明确要求把“暂不批准、推迟、退回”都记为关口的 `returned`，并写明理由。
- Constraints: 只改关口记录这一段的措辞；不改其他规则；章节标题不变（`immutable-spec-orca` 按标题引用）。
- Non-goals: 其他用例的不稳定性。

### Reproduction record
- Entry point: `evals/run.sh immutable-spec --filter-pattern "gate decisions"`（用例 `immutable-spec.gate-log`，fixture `gate-decisions`）
- Command: 在 main（d1a5418 之后）上逐次运行上面的命令。
- Observed: 本次 5 次运行中 1 次失败：checks `{"gateAPassedLogged":true,"gateBReturnedLogged":false,"stillDraft":true,"noActiveSpec":true}`；Execution Log 只有 “gate A passed: requirements confirmed as written. Decided by: user.”，回复写 “I haven't recorded gate B or activated it.”。此前 S0003 的回归中连续 2 次以同样方式失败（写成 “Gate B pending”）。合计 8 次中 3 次失败。
- Expected: 每次都追加 `- <date> gate B returned: <理由>. Decided by: user.`

### Root cause
- `skills/engineering/immutable-spec/SKILL.md:192` 把关口 B 写成 “Gate B, activation approved”，第 191 行把关口 A 写成 “Gate A, requirements confirmed”。标签只描述了“通过”的情形，没有说明拒绝或推迟也是一次关口决定，agent 于是把“暂不批准”当成“关口 B 还没发生”，不作记录。证据：失败运行的回复 “I haven't recorded gate B”；通过运行的回复 “gate B as returned”。

## 2. Outline Design
- Fix: 把两行标签改为“Gate A, requirements decision”“Gate B, activation decision”，并加一句：通过记为 `passed`；拒绝、推迟、“暂不批准”都记为 `returned` 并写明理由；用户做出的关口决定都要记录。
- Blast radius: 只影响关口记录的文字。`immutable-spec-orca` 按章节标题引用 “Decision Gates and Autonomy”，标题不变；`spec-design` 内联的是门槛块，不受影响；一致性检查覆盖这两处。
- Risk and rollback: revert 修复提交。

## References
- `evals/immutable-spec/case-review.md`（`immutable-spec.gate-log` 的已批准意图）
- `docs/specs/completed/20261103T1525-S0002-immutable-spec-upgrade.md`（规则来源）

## 3. Execution Plan
- [ ] p1-1 修正关口记录的措辞 → TC-1, TC-2, TC-3

## 4. Test and Acceptance Criteria
- TC-1 `immutable-spec.gate-log` 修复前可复现失败；修复后连续 5 次运行全部通过
  method: command: `evals/run.sh immutable-spec --filter-pattern "gate decisions"`，修复后循环运行 5 次
- TC-2 `immutable-spec` 整套 7 个用例在修复后通过
  method: command: `npm run eval:immutable-spec`
- TC-3 仓库检查不受影响
  method: command: `tests/spec-lint/run.sh && tests/consistency/run.sh && scripts/check-skill-consistency.py && tests/spec-design/run.sh structure gates orca red-flags templates install`
- Pass/fail criteria: TC-1、TC-2、TC-3 全部 pass；TC-1 修复前有 fail 记录。

## 5. Execution Log (append-only)
- 2026-11-03 gate A passed: 复现结果与根因按 S0003 回归报告确认，用户同意新开 bugfix spec 修复（“按照建议执行吧”）。Decided by: user.
- 2026-11-03 gate B passed: 用户同意修复方案与验证方式（同上）。Decided by: user.
- 2026-11-03 激活。按 bugfix 门槛，修复前先复现：本次 5 次运行中第 4 次失败，记录见 Validation Evidence。

## 6. Validation Evidence (append-only)
- 2026-11-03 TC-1 | type: bugfix | method: command | command: evals/run.sh immutable-spec --filter-pattern "gate decisions"（修复前，5 次） | exit: 0,0,0,100,0 | output: runs 1-3,5 pass; run 4 checks {"gateAPassedLogged":true,"gateBReturnedLogged":false,...}, Execution Log has only the gate A line, reply "I haven't recorded gate B or activated it." | result: fail | note: reproduced before the fix on the same entry point; S0003's regression saw 2 of 2 failures ("Gate B pending")

## 7. Change Requests (append-only)
