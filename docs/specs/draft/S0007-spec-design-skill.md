# spec-design skill：从认领到激活的设计阶段

Spec-ID: S0007
Task-ID: (待建)
Change-Type: feature
Status: draft
Created Time: 2026-11-03T14:30:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
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

- [ ] p1-1 编写 SKILL.md（完整流程、简化版、跳过条件）
- [ ] p1-2 编写 `references/design-red-flags.md`，与 `codebase-design` 对齐
- [ ] p1-3 编写 `references/rationale-template.md`、`references/decision-brief.md`
- [ ] p1-4 `immutable-spec-orca` 第 3 步改为指向本 skill（可选读取）
- [ ] p1-5 补充 `agents/openai.yaml`，更新 README 与工作流概览
- [ ] p2-1 用一个真实 feature Task 试运行，走到关口 B
- [ ] p2-2 用一个复杂 bug 试运行简化版

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/<skill>/`，写法为 `method: command: npm run eval:<skill>` 加用例 ID。下面写成自然语言的行为类 TC，在执行前用 case designer 转成用例，并由人审核。

- TC-1 frontmatter 合法，name 与目录一致，引用文件存在。
- TC-2 没有其他 skill 时，流程仍能完成，产出写入 spec 或 Task。
- TC-3 试运行中，关口 A 之前没有产出技术方案；关口 A 和 B 都有记录。
- TC-4 试运行中至少有一个问题由原型运行结果决定，并附有证据；至少一个偏好问题交给用户选择。
- TC-5 技术方案包含至少两个结构不同的方案，以及被否决方案的理由。
- TC-6 激活前，每条 TC 都有验证方式，并满足对应改动类型的证据门槛。
- TC-7 简化版试运行中，关口 A 确认的是复现结果和根因。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。依赖 S0002（证据门槛、关口记录格式）。
- 2026-11-03 草稿修订（按挑战结论）：证据门槛表改为内联，并纳入一致性检查。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
