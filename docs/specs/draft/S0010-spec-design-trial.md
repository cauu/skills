# spec-design 真实项目试跑

Spec-ID: S0010
Task-ID: (待建)
Change-Type: feature
Status: draft
Created Time: 2026-11-03T19:30:00+08:00
Start Time:
Completion Time:
Previous Spec-ID: S0007
Closure Reason:

## 1. Requirement Details

### Background

S0007 交付了 `spec-design` skill，eval 用例全部通过，但真实项目上的试跑（原 S0007 p2-1、p2-2，TC-13、TC-14）要等用户指定任务和 bug，因此拆到本 spec。用户会指定一个真实的 feature Task 和一个复杂 bug。

### Scope

- 用 `spec-design` 在用户指定的真实 feature Task 上走到关口 B。
- 用 `spec-design` 的简化版在用户指定的复杂 bug 上走到关口 A，并在用户确认后走到关口 B。
- 试跑中发现 skill 的问题时，在本 spec 中追加修复条目。

### Constraints

- 只在用户指定的任务和 bug 上试跑，不自行挑选。
- 试跑项目中的 spec 按该项目自己的规则激活和交付；本 spec 只记录试跑结果和对 skill 的修复。

### Non-goals

- 交付试跑任务本身（实现、合入）。

## 2. Outline Design

- 试跑记录写在试跑项目的 spec 或 Task 中，本 spec 的证据行引用其路径和关键输出。
- 风险：试跑项目没有 spec 体系。缓解：按 `spec-design` 的“无 spec”路径写入 Task 或设计文档，TC-1、TC-2 的检查改为对该文件执行，并追加 Change Request 说明。

## References

- `docs/specs/completed/20261103T1630-S0007-spec-design-skill.md`
- `skills/engineering/spec-design/SKILL.md`
- `evals/spec-design/case-review.md`

## 3. Execution Plan

- [ ] p1-1 用一个真实 feature Task 试运行，走到关口 B → TC-1
- [ ] p1-2 用一个复杂 bug 试运行简化版 → TC-2
- [ ] p1-3 bug-fix：用一个真实可复现的 bug 试运行 → TC-3
- [ ] p1-4 bug-fix：用一个真实不可复现的报告试运行 → TC-4

## 4. Test and Acceptance Criteria

- TC-1 真实 feature Task 试运行到关口 B：试运行 spec 的提交历史显示关口 A 行早于第 2 节技术方案写入；至少一个问题由原型输出决定，至少一个偏好问题由用户选择；试运行 spec 通过 `spec-lint --stage activate`。
  method: command: 在试运行项目中运行 `git log -p --reverse -- <试运行 spec>` 核对写入顺序和记录，再运行 `spec-lint --stage activate <试运行 spec>`
- TC-2 复杂 bug 试运行简化版：试运行 spec 的关口 A 行确认的是复现结果和根因，复现记录含真实命令和输出。
  method: command: 在试运行项目中运行 `grep -n "gate A" <试运行 spec>` 并核对复现记录，再运行 `spec-lint --stage activate <试运行 spec>`
- TC-3 真实可复现 bug 试运行（bug-fix）：试运行项目的 git 历史中失败检查的提交早于修复提交，Task 或 PR 中有复现命令和先失败后通过的输出。
  method: command: 在用户指定的试运行项目中运行 `git log --reverse --stat <base>..HEAD`，在失败检查提交上运行复现命令确认失败、在 HEAD 上运行确认通过，并核对 Task 或 PR 中的记录
- TC-4 真实不可复现报告试运行（bug-fix）：skill 停止后没有产品代码改动，Task 中有原因、尝试过的路径和缺少的条件。
  method: command: 在用户指定的试运行项目中运行 `git status --porcelain` 与 `git log --stat <base>..HEAD`，并核对 Task 中的记录
- 通过标准：全部 `pass`。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建，从 S0007 拆出（用户同意）。
- 2026-11-03 草稿修订：并入 S0003 的真实 bug 试运行（原 S0003 p2-1、TC-8、TC-9，改为本 spec 的 p1-3、p1-4、TC-3、TC-4），用户同意。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
