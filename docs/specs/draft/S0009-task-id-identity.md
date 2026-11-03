# immutable-spec：以 Task-ID 为标识

Spec-ID: S0009
Task-ID: (待建)
Change-Type: feature
Status: draft
Created Time: 2026-11-03T15:20:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details

### Background

工作流约定所有工作先建 Task 并认领。`immutable-spec` 目前自己分配 `S000x` 编号，只有 `immutable-spec-orca` 绑定 Task-ID。两者不一致，spec 也无法和 Task 一一对应。

本 spec 从 S0002 中拆出，单独处理标识和命名，把兼容旧 spec 的风险隔离开。

### Scope

1. spec 以 Task-ID 为标识。认领检查（Task Claim Gate）移入 `immutable-spec`：只处理用户指定、已认领的 Task；不伪造、不扫描、不自行分配 Task-ID。
2. 文件命名：`docs/specs/{draft,active,completed}/<task-id>-<slug>.md`。GitHub Issue 沿用 orca 版规则，`owner/repo#123` 写成 `issue#123`。
3. 决定 active spec 继续放在 `docs/specs/` 根目录（只放一个），还是改用 orca 版的 `active/` 子目录（决策 D2）。
4. 兼容旧 spec：已有的 `S000x` spec 仍可按原规则读取、执行和关闭；新建的 spec 使用 Task-ID。
5. 迁移本仓库自己的 spec：本仓库的 S0001–S0009 是否改为 Task-ID，由用户在关口 B 决定。

### Constraints

- 依赖 S0002（orca 版已改为引用主版本，命名规则只需改主版本一处）。
- 不对接具体 task 系统的 API。认领操作仍由用户或现有工具完成。

### Non-goals

- 通过标准与自主验收（S0002）。

## 2. Outline Design

- 头部字段：`Task-ID` 为必填；`Spec-ID` 只保留给旧 spec。
- D2 在 p1-1 中决定：对比两种布局对 `spec-lint`、orca 交接、现有项目的影响。

## References

- `docs/specs/draft/S0002-immutable-spec-upgrade.md`
- `skills/engineering/immutable-spec-orca/SKILL.md`（现有的 Task Claim Gate 与命名规则）

## 3. Execution Plan

- [ ] p1-1 决定 active spec 的目录布局（D2），追加到 Execution Log
- [ ] p1-2 `immutable-spec`：Task-ID 标识、认领检查、命名规则
- [ ] p1-3 兼容旧 `S000x` spec
- [ ] p1-4 `spec-lint` 支持两种标识
- [ ] p1-5 用 case designer 设计 eval 用例，先经用户审核，再实际运行
- [ ] p1-6 更新 README 与工作流概览

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/immutable-spec/`。

- TC-1 eval 用例 `immutable-spec.task-id-naming`：给定一个已认领的 GitHub Issue，新建的 draft 文件名为 `issue#<n>-<slug>.md`，头部 Task-ID 为原始的 `owner/repo#<n>`。
  method: command: `npm run eval:immutable-spec`
- TC-2 eval 用例 `immutable-spec.no-fabricated-task-id`：没有给出 Task 时，agent 不自行编造 Task-ID，而是请用户指定。
  method: command: 同 TC-1
- TC-3 eval 用例 `immutable-spec.legacy-spec-close`：一份旧 `S000x` 格式的 spec，可以按原规则关闭。
  method: command: 同 TC-1
- TC-4 `spec-lint` 对 Task-ID 格式和旧 `S000x` 格式的 spec 都不误报。
  method: command: `spec-lint <两种格式的 fixture>`
- TC-5 S0002、S0008 的已有用例仍然通过。
  method: command: 同 TC-1
- 通过标准：全部 `pass`。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建，从 S0002 拆出（用户同意）。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
