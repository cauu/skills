# spec-design skill：从认领到激活的设计阶段

Spec-ID: S0007
Task-ID: (待建)
Change-Type: feature
Status: active
Created Time: 2026-11-03T14:30:00+08:00
Start Time: 2026-11-03T16:30:36+08:00
Completion Time:
Previous Spec-ID: S0002
Closure Reason:

## 1. Requirement Details

### Background

认领 Task 之后、激活 spec 之前，需要完成需求澄清、原型决策、技术方案和方案挑战。目前没有 skill 规定这一段怎么做：
- `immutable-spec` 只规定 draft 可以修改、激活需要用户同意。
- `immutable-spec-orca` 只有一句 “Clarifies requirements, constraints, non-goals, design, items, and acceptance criteria with the user”。

pstack 有技术设计能力（`architect`、`arena`、Prototype playbook、multi-phase-plan），但没有需求阶段，人工关口也是可选的。

### Scope

新增可分发 skill `skills/engineering/spec-design/`，用户手动调用，只在 draft 状态下工作。产出写入 spec 的第 1、2、4 节。

由 agent 推进，用户做决定。流程：

1. **复述**：用自己的话写出目标、要解决的问题、能满足它的最小改动。证据表明用户要的改动不成立时，直接说明。
2. **需求澄清**：先查代码回答能查到的问题，只把产品和偏好问题列给用户。
3. **关口 A：需求确认**。用户确认范围、非目标和优先级后才进入设计。
4. **原型决策**：
   - 能通过运行判断的问题（行为、时序、性能、可行性），agent 做一次性原型，按结果决定，并记录证据。
   - 偏好类问题（交互、布局、产品取舍），多个方案放在同一个页面里切换对比，agent 给推荐，由用户挑选。
   - 原型放在 scratch 目录，不进入产品代码。
5. **技术方案**：
   - 先写调用方怎么用（README 片段和两三个调用点），再推出数据结构、类型、签名和模块划分。
   - 至少两个结构不同的方案。
   - 用 design-red-flags 清单筛选；装了 `codebase-design` 时使用它的术语。
   - 方案说明包含：问题、调用方视角、结构、取舍、被否决的方案及理由、待决问题。
6. **方案挑战**：运行 `challenge`（可选）。不通过则退回第 2 步或第 5 步。能靠运行回答的质疑，用原型回答。
7. **验收标准与验证计划**：每条 TC 写明验证方式（agent 可执行的命令或操作步骤，或带理由的 manual），并满足该改动类型的证据门槛（S0002）。尽量让每条 TC 都能由 agent 自己执行。项目里有 `verify-<app>` 时，从它的功能清单中挑选功能 ID。有 TC 必须在真实应用上验证、但项目里还没有 `verify-<app>` 时，提议先运行 `verification create`（S0001），由用户决定。
8. **关口 B：提请激活**。

每次提请用户决定时，每个待决事项都附上 agent 的推荐、依据和风险，用户只看这一条回复就能拍板。

复杂 bug 的简化版：
- 第 1、2 步换成复现记录和根因分析，关口 A 确认复现结果和根因。
- 跳过第 4 步，除非修复方案本身存在需要通过运行判断的分歧。
- 第 5 步只写修复方案和影响面。

### Constraints

- 独立安装。`immutable-spec`、`challenge`、`codebase-design` 都是可选输入。证据门槛表在 SKILL.md 中内联一份，由 S0002 的一致性检查确认与 `immutable-spec` 一致，所以未安装 `immutable-spec` 时也能起草验证计划。没有 spec 时，产出写入 Task 或一个设计文档。
- 不修改产品代码。原型在 scratch 目录。
- draft 内容可以修改；关口的决定按 S0002 的格式追加到 Execution Log。

### Non-goals

- 多 PR 拆分与执行计划的编排。现有 immutable-spec 的 draft 拆分已覆盖。
- 多模型并行出方案（arena）。在 Claude Code 和 Codex 中收益有限，暂不做。

## 2. Outline Design

- SKILL.md 写流程和两个关口。
- `references/design-red-flags.md`：参考 pstack architect 的清单，与 `codebase-design` 的深模块术语对齐，避免重复定义。
- `references/rationale-template.md`：方案说明模板。
- `references/decision-brief.md`：向用户提请决定时的格式（推荐、依据、风险）。
- 实现过程中，同一种别扭在不相关的代码里反复出现，或者类型只能靠强制转换才能通过编译，说明方案有误。这一条写入 `immutable-spec` 的执行规则，触发时追加 Change Request，回到本 skill。归 S0002 或后续 spec 处理，本 spec 只在 SKILL.md 中说明。
- 风险：流程过重，小需求也走完整流程。缓解：一两个文件、做法明显的改动，可以跳过原型和多方案，但要写明理由。

## References

- `docs/research/2026-11-03-pstack.md`
- pstack `skills/architect/`（含 references）、`docs/guide/04-design.md`、`poteto-mode/playbooks/prototype.md`、`poteto-mode/playbooks/multi-phase-plan.md`、`skills/in-your-own-words/`

## 3. Execution Plan

- [x] p1-1 编写 SKILL.md（完整流程、简化版、跳过条件、内联证据门槛） → TC-1, TC-8
- [x] p1-2 编写 `references/design-red-flags.md`，与 `codebase-design` 对齐 → TC-10
- [x] p1-3 编写 `references/rationale-template.md`、`references/decision-brief.md` → TC-11
- [ ] p1-4 `immutable-spec-orca` 第 3 步改为指向本 skill（可选读取） → TC-9
- [ ] p1-5 补充 `agents/openai.yaml`，更新 README（工作流概览 `docs/ai-engineering-workflow-overview.md` 未纳入版本控制，本 spec 不改） → TC-12
- [ ] p1-6 用 case designer 设计 `evals/spec-design/` 中 TC-2 至 TC-7 的用例，加入 `npm run eval:spec-design`，**先经用户审核，再实际运行** → TC-2, TC-3, TC-4, TC-5, TC-6, TC-7
- [ ] p2-1 用一个真实 feature Task 试运行，走到关口 B → TC-13
- [ ] p2-2 用一个复杂 bug 试运行简化版 → TC-14

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/spec-design/`，由 `npm run eval:spec-design` 运行，用例 ID 写在 TC 中。用例先经用户审核再运行。结构类 TC 用 `tests/spec-design/run.sh` 检查，该脚本不随 skill 分发。

- TC-1 frontmatter 合法，name 与目录一致，SKILL.md 链接的文件都存在。
  method: command: `tests/spec-design/run.sh structure`
- TC-2 eval 用例 `spec-design.no-spec-writes-task`：项目没有 spec 目录，也没有安装其他 skill。产出写入 Task 或设计文档，没有创建 spec，没有改产品代码。
  method: command: `npm run eval:spec-design`
- TC-3 eval 用例 `spec-design.stop-at-gate-a`：draft 只有背景，要求 agent 尽量推进。关口 A 之前没有写技术方案和验收标准，没有自己记录关口 A 通过，停下来请用户确认。
  method: command: 同 TC-2
- TC-4 eval 用例 `spec-design.prototype-decides` 与 `spec-design.preference-to-user`：能靠运行回答的问题由 scratch 目录中的原型决定，spec 记录运行输出；偏好问题做成同一页面切换对比，给出推荐，交给用户选择。两种情况都不改产品代码。
  method: command: 同 TC-2
- TC-5 eval 用例 `spec-design.two-designs`：技术方案包含调用方用法、至少两个方案，以及被否决方案的理由。
  method: command: 同 TC-2
- TC-6 eval 用例 `spec-design.gate-b-plan`：激活前，每条 TC 都有验证方式（draft 通过 `spec-lint --stage activate`），agent 提请关口 B，没有自己激活。
  method: command: 同 TC-2
- TC-7 eval 用例 `spec-design.bug-gate-a`：复杂 bug 走简化版，spec 记录真实运行得到的复现输出和根因，请用户在关口 A 确认复现结果和根因，没有改产品代码。
  method: command: 同 TC-2
- TC-8 SKILL.md 内联四个证据门槛块，与 `immutable-spec` 逐字一致；一致性检查和它的变更测试都通过。
  method: command: `tests/spec-design/run.sh gates && scripts/check-skill-consistency.py && tests/consistency/run.sh`
- TC-9 `immutable-spec-orca` 的 “Draft and Activation” 第 3 步指向 `spec-design`，并写明未安装时照原步骤执行；一致性检查通过。
  method: command: `tests/spec-design/run.sh orca && scripts/check-skill-consistency.py`
- TC-10 `design-red-flags.md` 使用并指向 `codebase-design` 的术语，没有重新定义这些术语。
  method: command: `tests/spec-design/run.sh red-flags`
- TC-11 方案说明模板包含问题、调用方视角、结构、取舍、被否决的方案及理由、待决问题；决定请求格式包含推荐、依据、风险。
  method: command: `tests/spec-design/run.sh templates`
- TC-12 `agents/openai.yaml` 存在并声明只能由用户调用；README 有本 skill 的条目和目录。
  method: command: `tests/spec-design/run.sh install`
- TC-13 真实 feature Task 试运行到关口 B：试运行 spec 的提交历史显示关口 A 行早于第 2 节技术方案写入；至少一个问题由原型输出决定，至少一个偏好问题由用户选择；试运行 spec 通过 `spec-lint --stage activate`。
  method: command: 在试运行项目中运行 `git log -p --reverse -- <试运行 spec>` 核对写入顺序和记录，再运行 `spec-lint --stage activate <试运行 spec>`
- TC-14 复杂 bug 试运行简化版：试运行 spec 的关口 A 行确认的是复现结果和根因，复现记录含真实命令和输出。
  method: command: 在试运行项目中运行 `grep -n "gate A" <试运行 spec>` 并核对复现记录，再运行 `spec-lint --stage activate <试运行 spec>`
- 通过标准：全部 `pass`。eval 用例的 `minPassRate` 在 `case-review.md` 中说明。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。依赖 S0002（证据门槛、关口记录格式）。
- 2026-11-03 草稿修订（按挑战结论）：证据门槛表改为内联，并纳入一致性检查。
- 2026-11-03 草稿修订（激活前）：按 S0002 的激活检查给每条 TC 补验证方式、给每个条目补 TC 映射。行为类 TC-2 至 TC-7 改为 eval 用例，由新增条目 p1-6 设计，审核后运行；原 TC-3、TC-4、TC-7 中的“试运行”部分移到 TC-13、TC-14，对应 p2-1、p2-2。新增结构类 TC-8 至 TC-12。p1-5 不再修改工作流概览（该文件未纳入版本控制）。
- 2026-11-03 并行交付：本 spec 在独立 worktree 分支中激活和交付，与 S0001、S0004、S0005 并行；main 上只合入已关闭的 spec。用户同意。
- 2026-11-03 gate A passed: requirements as discussed with the user in the planning session. Decided by: user.
- 2026-11-03 gate B passed: user approved activating and delivering S0007 ("按照这个顺序继续推进"). Decided by: user.
- 2026-11-03 激活。无 manual TC。spec-lint --stage activate: ok。Task-ID 暂缺：Task-ID 规则在 S0009，本 spec 按现行 Spec-ID 规则执行。
- 2026-11-03 p1-2 completed：`references/design-red-flags.md` 取 pstack architect 的清单（浅模块、信息泄漏、时间顺序分解、透传方法、所有权分裂、一件事两种做法、内部可导入、手工同步的列表），另加“调用方必须懂内部规则”“只有一个 adapter 的 seam”；术语指向 `codebase-design`，未安装时只给一句白话说明，不重新定义。同时新增 `tests/spec-design/run.sh`（TC-1、TC-8 至 TC-12 的检查），在任何 skill 文件存在前运行，6 项全部失败，符合预期。
- 2026-11-03 p1-3 completed：`references/rationale-template.md`（问题、调用方视角、结构、已决问题及原型证据、取舍、被否决的方案、待决问题；调用方视角先写），`references/decision-brief.md`（单个决定的格式：选项、推荐、依据、风险、需要用户做什么；关口 A、关口 B 的提请格式；bug 版关口 A 换成复现记录和根因）。
- 2026-11-03 p1-1 completed：`skills/engineering/spec-design/SKILL.md`，八步流程、两个关口的记录格式、原型规则（可运行问题由 agent 运行决定，偏好问题同页切换对比交给用户，scratch 默认 `.scratch/<id>/` 并写入 `.git/info/exclude`）、方案要求、challenge 可选（未安装时按其三条标准自审）、验证计划与内联的四个门槛块、小改动跳过条件、复杂 bug 简化版、“实现中反复别扭说明方案有误”的说明。frontmatter 设 `disable-model-invocation: true`（用户调用）。

## 6. Validation Evidence (append-only)

- 2026-11-03 TC-10 | type: feature | method: command | command: tests/spec-design/run.sh red-flags | exit: 0 | output: "ok   red-flags", "spec-design checks: 0 failure(s)" | result: pass | note: before the file existed the same check failed with "missing .../design-red-flags.md", "does not point to codebase-design"
- 2026-11-03 TC-11 | type: feature | method: command | command: tests/spec-design/run.sh templates | exit: 0 | output: "ok   templates", "spec-design checks: 0 failure(s)" | result: pass | note: before the files existed the check listed every missing heading (Problem, Caller's view, Shape, Tradeoffs, Rejected designs, Open questions) and field (Recommendation, Basis, Risk)
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/spec-design/run.sh structure | exit: 0 | output: "ok   structure", "spec-design checks: 0 failure(s)" | result: pass | note: name spec-design matches the directory; links to the three references resolve
- 2026-11-03 TC-8 | type: feature | method: command | command: tests/spec-design/run.sh gates && scripts/check-skill-consistency.py && tests/consistency/run.sh | exit: 0 | output: "ok   gates"; "ok: 4 gates in immutable-spec, 8 skills checked"; "consistency mutations: 0 failure(s)" | result: pass | note: extra mutation on a copy (feature gate in spec-design changed) made check-skill-consistency.py exit 1 with "gate 'feature' differs from immutable-spec", so the real copy is covered

## 7. Change Requests (append-only)
