# challenge、tdd、code-review 对齐通过标准

Spec-ID: S0004
Task-ID: (待建)
Change-Type: feature
Status: draft
Created Time: 2026-11-03T13:55:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details

### Background

S0002 定义了通过标准和自主验收规则。`challenge`、`tdd`、`code-review` 需要与之对齐，否则会在各自环节放过不可验证的标准，或者只凭读代码下结论。

### Scope

1. `challenge`：
   - 能通过运行回答的问题（行为、时序、布局、性能），建议做原型，不在纸面上争论。
   - 逐条检查验收标准能否由 agent 执行验证；不能的，要求写明理由。
2. `tdd`：修 bug 时先复现，失败用例先于修复。
3. `code-review`：对 P0/P1 问题尝试实际复现，项目里有 `verify-<app>` 时优先用它；复现成功的标为“证据支持（已复现）”，复现失败的写明尝试过的路径。

### Constraints

- 只增加少量规则，不新增对其他 skill 的依赖。
- 结论用词与 `immutable-spec`（S0002）一致。

### Non-goals

- 改变 code-review 的三 reviewer 结构。

## 2. Outline Design

各 skill 只增加少量文字。

## References

- `docs/research/2026-11-03-pstack.md`
- pstack `poteto-mode/playbooks/prototype.md`、`skills/interrogate/`

## 3. Execution Plan

- [ ] p1-1 `challenge`
- [ ] p1-2 `tdd`
- [ ] p1-3 `code-review`

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/<skill>/`，写法为 `method: command: npm run eval:<skill>` 加用例 ID。下面写成自然语言的行为类 TC，在执行前用 case designer 转成用例，并由人审核。

- TC-1 challenge 对一份含不可验证验收标准的方案提出对应意见。
  method: command: 用一份示例方案运行 challenge，检查输出
- TC-2 tdd 处理一个 bug 时，git 历史中失败用例先于修复提交。
  method: command: 用一个示例 bug 运行，检查 git log
- TC-3 code-review 对一个人为植入的 P1 问题给出复现命令和输出。
  method: command: 在示例分支植入问题后运行 code-review

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿修订：S0001 删除，去掉对项目级验收工具的接入，改为对齐 S0002 的通过标准。依赖 S0002。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
