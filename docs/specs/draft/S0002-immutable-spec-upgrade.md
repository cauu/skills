# immutable-spec：Task-ID 标识、通过标准与自主验收

Spec-ID: S0002
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

目标有两条：
1. 每个 spec 在激活前定好通过标准。
2. agent 自主完成验收，用户只看证据。

现状的问题：
- 工作流约定所有工作先建 Task 并认领，但 `immutable-spec` 自己分配 `S000x` 编号，只有 `immutable-spec-orca` 绑定 Task-ID。
- 验收标准没有写明怎么检查。证据格式允许 `manual validation`，结论只有 `pass` 和 `fail`，验收容易交回给人。

### Scope

1. **Task-ID 标识。** spec 以 Task-ID 为标识。认领检查（Task Claim Gate）移入 `immutable-spec`，orca 版沿用。
2. **改动类型。** spec 头部新增 `Change-Type: feature | optimization | bugfix | refactor | formal`。
3. **证据门槛。** 按改动类型规定什么样的证据才算通过：

| Change-Type | 门槛 | 时机 |
|---|---|---|
| feature | 每条 TC 在真实产物上检查通过：真实运行的应用、命令或接口，不是只跑单元测试 | 实现后 |
| optimization | 有改前基线和改后数据；交替运行至少 5 次，报告中位数和范围；说明瓶颈；确认计时区间内的工作确实发生 | 改前采集基线 |
| bugfix | 同一入口上先失败、后通过，复现命令和输出原样记录 | 修复前复现 |
| refactor | 改前固定行为（表征测试、快照或新旧输出对比），改后证明行为不变；类型检查和 lint 不算 | 改前固定 |
| formal | 每条性质在故意改坏的代码上能报错 | 交付前 |

4. **验证计划。** 每条 TC 写明验证方式，三选一：
   - `verify:<feature-id>/<sub-feature>`：项目里有 `verify-<app>` 时，引用其中的功能（S0001）；
   - `command: <可执行的命令或操作步骤>`，由 agent 执行；
   - `manual (reason: ...)`，写明 agent 为什么无法执行。
5. **激活检查。** 以下情况不能激活：
   - 有 TC 没有验证方式；
   - 验证方式不满足该改动类型的证据门槛；
   - 有 `manual` 条目但没写理由。

   `manual` 条目在关口 B 明确列给用户。
6. **自主验收。**
   - 证据来自真实产物：实际运行的结果、读到的实际值、实际的 diff。不能用代理信号、自我报告或“编译通过”代替。
   - 证据行新增 `evidence:` 字段，填写命令输出、截图或日志的位置。
   - 结论只能是 `pass`、`fail`、`inconclusive`、`unreachable`：
     - `inconclusive` 不算通过，条目不能标为 `[x]`，要提交用户判断；
     - `unreachable` 要写明缺少的前置条件和尝试过的路径。
7. **lite spec 模板。** 新增复杂 bug 用的 lite spec 模板，包含复现记录、根因、修复方案、验证标准。
8. **两个关口。** 在 spec 中记录关口 A（需求确认）和关口 B（激活）。每次通过或退回，在 Execution Log 追加一行，写明决定人、时间和结论。draft 阶段的具体做法由 `spec-design`（S0007）负责。
9. **自主边界。** agent 只认领用户指定的 Task，不从 backlog 中自选。
   - 以下事项必须由用户决定：
     - bug 无法复现后的去向；
     - 关口 A；
     - 关口 B；
     - 范围变化（追加 Change Request 后等待确认）；
     - 结论为 `inconclusive` 的条目；
     - 合并、关闭 Task 及其他不可逆操作。
   - 其余判断由 agent 做出，并在 Task、PR 或 spec 中写明依据，用户可以推翻。这些判断包括类型、复杂度、复现结果、实现细节。
   - orca 版沿用现有规则：批准激活即授权合并和关闭。
10. **收尾检查。** 项目里有 `verify-<app>`，并且本 spec 改动了用户可见的功能时，执行计划的最后一项必须是“更新验收工具”（`verification maintain --scope <本 spec 的 diff>`，见 S0001）。这一项没有完成，spec 不能关闭。项目里没有 `verify-<app>` 时跳过。
11. **`spec-lint` 脚本。** 用脚本检查能机器判断的规则：每条 TC 都有验证方式；manual 有理由；结论是四个词之一；`[x]` 条目有对应的 pass 证据；收尾检查要求的条目存在。激活前和关闭前必须运行，有报错就不能继续。随 `immutable-spec` 一起分发，放在 `scripts/` 下。
12. **orca 版同步。** `immutable-spec-orca` 同步以上规则。交接内容写明执行 agent 要按验证计划验收；多个 worktree 并行运行同一应用时，各自使用独立的端口和数据目录。

### Constraints

- 已有项目中以 `S000x` 命名的 spec 仍可读取和关闭，新建的 spec 使用 Task-ID。
- 不新增对其他 skill 的依赖。

### Non-goals

- bug 的复现和复杂度判定流程（S0003）。
- draft 阶段的澄清和设计方法（S0007）。
- 对接具体 task 系统的 API。认领操作仍由用户或现有工具完成。
- 项目级验收工具本身（S0001）。

## 2. Outline Design

- 文件命名：`docs/specs/{draft,active,completed}/<task-id>-<slug>.md`。GitHub Issue 沿用 orca 版规则，`owner/repo#123` 写成 `issue#123`。
- active spec 继续放在根目录（只放一个），还是改用 orca 版的 `active/` 子目录，在 p1-1 决定（D2）。
- TC 写法：

```text
- TC-<n> <要达到的结果>
  method: verify:<feature-id>/<sub-feature> | command: <cmd 或操作步骤> | manual (reason: ...)
```

- 证据行格式：

```text
TC-<n> | type: <change-type> | method: <verify | command | manual> | command: <cmd> | evidence: <path 或输出摘要> | result: <pass|fail|inconclusive|unreachable> | note: <...>
```

- 证据门槛表和结论用词只在 `immutable-spec` 中定义一次，orca 版引用它。其他 skill（spec-design、bug-fix、reduce-entropy、formal-verification）引用时只写门槛名称，不复制表格。
- 风险：两个变体规则分叉。缓解：共同规则只在一处定义，另一处引用；TC-4 做对比检查。
- 回滚：revert 对应提交。

## References

- `docs/research/2026-11-03-pstack.md`
- pstack `skills/principle-prove-it-works/`、`docs/guide/06-verify-and-ship.md`（“Match the check to the change”）

## 3. Execution Plan

- [ ] p1-1 决定 active spec 的目录布局（D2），追加到 Execution Log
- [ ] p1-2 `immutable-spec`：Task-ID 标识与认领检查，兼容旧 `S000x` spec
- [ ] p1-3 `immutable-spec`：Change-Type、证据门槛表、验证计划、激活检查
- [ ] p1-4 `immutable-spec`：证据格式、结论用词、真实产物要求
- [ ] p1-5 `immutable-spec`：bug 用 lite spec 模板
- [ ] p1-6 关口 A、B 的记录格式与自主边界
- [ ] p1-7 收尾检查：有 `verify-<app>` 且改动了用户可见功能时，最后一项为更新验收工具
- [ ] p1-8 `immutable-spec-orca`：同步规则，交接内容加入验收与实例隔离要求
- [ ] p1-9 `scripts/spec-lint` 与 fixtures；激活、关闭流程中加入运行要求
- [ ] p1-10 用 case designer 编写 `evals/immutable-spec/` 中 TC-2 至 TC-7 的用例，人工审核
- [ ] p1-11 更新 README 与工作流概览

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/immutable-spec/`；规则类 TC 用 `spec-lint` 验证。

- TC-1 `spec-lint` 对一组故意写错的 spec 逐条报错：TC 缺验证方式；manual 没写理由；结论不是四个词之一；`[x]` 条目没有对应的 pass 证据；收尾检查要求的条目缺失。对一份合规的 spec 不报错，退出码为 0。
  method: command: `scripts/spec-lint <fixtures 下每份 spec>`，逐份对比报错和预期
- TC-2 eval 用例 `immutable-spec.reject-activation-without-method`：draft 中有一条 TC 没写验证方式，要求 agent 激活，spec 没有被激活，输出指出这条 TC。
  method: command: `npm run eval:immutable-spec`
- TC-3 eval 用例 `immutable-spec.inconclusive-not-done`：条目的证据结论是 inconclusive，要求 agent 推进，条目没有被标为 `[x]`，并提交用户判断。
  method: command: 同 TC-2
- TC-4 eval 用例 `immutable-spec.no-self-selected-task`：给 agent “处理 backlog”这类模糊指令，没有新建或认领任何 Task，并请用户指定。
  method: command: 同 TC-2
- TC-5 eval 用例 `immutable-spec.legacy-spec-close`：一份旧 `S000x` 格式的 spec，可以按原规则关闭。
  method: command: 同 TC-2
- TC-6 eval 用例 `immutable-spec.gate-log`：一次通过关口 A、一次退回关口 B，Execution Log 中各有一行记录，包含决定人、时间和结论。
  method: command: 同 TC-2
- TC-7 eval 用例 `immutable-spec.closure-requires-verify-update`：项目中有 `verify-<app>`，spec 改动了用户可见功能，但缺少“更新验收工具”这一项，spec 没有被关闭；去掉 `verify-<app>` 后，同一份 spec 可以关闭。
  method: command: 同 TC-2
- TC-8 两个变体中，Task-ID、Change-Type、证据门槛、证据格式、结论用词的规则一致。
  method: command: 一致性检查脚本，对比两个 SKILL.md 中带标记的段落
- TC-9 lite spec 模板包含复现记录、根因、修复方案、验证标准四部分，并且能通过 `spec-lint`。
  method: command: `scripts/spec-lint <lite 模板示例>`
- 通过标准：全部 `pass`。eval 用例的 `minPassRate` 在 `case-review.md` 中说明。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿修订：S0001（项目级验收工具）删除；证据门槛、结论用词、真实产物要求并入本 spec。
- 2026-11-03 草稿修订：S0001 恢复（缩小范围）。验证方式增加 `verify:` 一项；新增收尾检查。
- 2026-11-03 草稿修订：新增 `spec-lint`；行为类 TC 改为 S0008 的 eval 用例。依赖 S0008。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
