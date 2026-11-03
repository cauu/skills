# immutable-spec：通过标准与自主验收

Spec-ID: S0002
Task-ID: (待建)
Change-Type: feature
Status: active
Created Time: 2026-11-03T13:55:00+08:00
Start Time: 2026-11-03T15:25:41+08:00
Completion Time:
Previous Spec-ID: S0008
Closure Reason:

## 1. Requirement Details

### Background

目标有两条：
1. 每个 spec 在激活前定好通过标准。
2. agent 自主完成验收，用户只看证据。

现状的问题：验收标准没有写明怎么检查。证据格式允许 `manual validation`，结论只有 `pass` 和 `fail`，验收容易交回给人。规则只写在文字里，没有东西强制执行。

### Scope

1. **改动类型。** spec 头部新增 `Change-Type: feature | optimization | bugfix | refactor`。
2. **证据门槛。** 按改动类型规定什么证据才算通过：

| Change-Type | 门槛 | 时机 |
|---|---|---|
| feature | 每条 TC 在真实产物上检查通过：真实运行的应用、命令或接口，不是只跑单元测试 | 实现后 |
| optimization | 有改前基线和改后数据，并写明测量方法 | 改前采集基线 |
| bugfix | 同一入口上先失败、后通过，复现命令和输出原样记录 | 修复前复现 |
| refactor | 改前固定行为（表征测试、快照或新旧输出对比），改后证明行为不变；类型检查和 lint 不算 | 改前固定 |

   optimization 是性能测量时，再加一条指导：多次交替运行，报告中位数和范围，并说明瓶颈。这条只是指导，不是硬门槛。

   形式化检查不算一种改动类型，而是一种验证方式。任何改动类型的 TC 都可以用 `command:` 引用形式化检查的运行命令（S0006）。

3. **验证计划。** 每条 TC 写明验证方式，三选一：
   - `verify:<feature-id>/<sub-feature>`：项目里有 `verify-<app>` 时，引用其中的功能（S0001）；
   - `command: <可执行的命令或操作步骤>`，由 agent 执行；
   - `manual (reason: ...)`，写明 agent 为什么无法执行。
4. **激活检查。** 以下情况不能激活：
   - 有 TC 没有验证方式；
   - 验证方式不满足该改动类型的证据门槛；
   - 有 `manual` 条目但没写理由。

   `manual` 条目在关口 B 明确列给用户。
5. **自主验收。**
   - 证据来自真实产物：实际运行的结果、读到的实际值、实际的 diff。不能用代理信号、自我报告或“编译通过”代替。
   - 证据行必须摘录关键输出：执行的命令、退出码、能说明结论的几行输出。截图、日志等文件路径只作补充，因为这些文件可能被 gitignore 或清理掉，spec 里的记录要能独立成立。
   - 结论只能是 `pass`、`fail`、`inconclusive`、`unreachable`：
     - `inconclusive` 不算通过，条目不能标为 `[x]`，要提交用户判断；
     - `unreachable` 要写明缺少的前置条件和尝试过的路径。
6. **lite spec 模板。** 新增复杂 bug 用的 lite spec 模板，包含复现记录、根因、修复方案、验证标准。
7. **两个关口。** 在 spec 中记录关口 A（需求确认）和关口 B（激活）。每次通过或退回，在 Execution Log 追加一行，写明决定人、时间和结论。draft 阶段的具体做法由 `spec-design`（S0007）负责。
8. **自主边界。** agent 只处理用户指定的 Task，不从 backlog 中自选。
   - 以下事项必须由用户决定：
     - bug 无法复现后的去向；
     - 关口 A；
     - 关口 B；
     - 范围变化（追加 Change Request 后等待确认）；
     - 结论为 `inconclusive` 的条目；
     - 合并、关闭 Task 及其他不可逆操作。
   - 其余判断由 agent 做出，并在 Task、PR 或 spec 中写明依据，用户可以推翻。这些判断包括类型、复杂度、复现结果、实现细节。
   - orca 版沿用现有规则：批准激活即授权合并和关闭。
9. **收尾检查。** 项目里有 `verify-<app>`，并且本 spec 改动了用户可见的功能时，执行计划的最后一项必须是“更新验收工具”（`verification maintain --scope <本 spec 的 diff>`，见 S0001）。这一项没有完成，spec 不能关闭。项目里没有 `verify-<app>` 时跳过。
10. **`spec-lint` 脚本。** 用脚本检查能机器判断的规则：
    - 每条 TC 都有验证方式；
    - manual 有理由；
    - 证据行的结论是四个词之一，并且有输出摘录；
    - `[x]` 条目有对应的 pass 证据；
    - 收尾检查要求的条目存在。

    激活前和关闭前必须运行，有报错就不能继续。随 `immutable-spec` 一起分发，放在 skill 目录的 `scripts/` 下。
11. **orca 版改为依赖主版本。** `immutable-spec-orca` 在文档中声明需要先安装 `immutable-spec`（README 允许 skill 在文档中写明依赖）。spec 格式、证据门槛、证据格式、结论用词、激活检查、收尾检查、`spec-lint` 都引用主版本，orca 版只保留交接相关的内容。交接内容写明：执行 agent 要按验证计划验收；多个 worktree 并行运行同一应用时，各自使用独立的端口和数据目录。
12. **其他 skill 内联自己的门槛。** `bug-fix`、`reduce-entropy` 可以单独安装，用不到主版本的门槛表。所以各自把和自己相关的那一条门槛直接写在自己文件里，只写一句。一致性检查脚本确认这些句子和主版本门槛表中的对应内容一致。

### Constraints

- 除 orca 版外，不新增对其他 skill 的依赖。
- 不改变 spec 的标识和命名规则（S0009）。

### Non-goals

- Task-ID 标识、认领检查、目录布局（S0009）。
- bug 的复现和复杂度判定流程（S0003）。
- draft 阶段的澄清和设计方法（S0007）。
- 项目级验收工具本身（S0001）。

## 2. Outline Design

- TC 写法：

```text
- TC-<n> <要达到的结果>
  method: verify:<feature-id>/<sub-feature> | command: <cmd 或操作步骤> | manual (reason: ...)
```

- 证据行格式：

```text
TC-<n> | type: <change-type> | method: <verify | command | manual> | command: <cmd> | exit: <code> | output: <关键输出摘录> | files: <可选，补充文件路径> | result: <pass|fail|inconclusive|unreachable> | note: <...>
```

- 门槛表在主版本中用标记包起来（例如 `<!-- gate:bugfix -->`），一致性检查脚本按标记取出，与各 skill 内联的句子对比。
- 风险：主版本改动后 orca 版引用失效。缓解：一致性检查覆盖 orca 版的引用位置。
- 回滚：revert 对应提交。

## References

- `docs/research/2026-11-03-pstack.md`
- `docs/specs/completed/20261103T1442-S0008-skill-eval-foundation.md`（eval 方法）
- pstack `skills/principle-prove-it-works/`、`docs/guide/06-verify-and-ship.md`（“Match the check to the change”）

## 3. Execution Plan

- [~] p1-1 `immutable-spec`：Change-Type、证据门槛表（带标记）、验证计划、激活检查
- [~] p1-2 `immutable-spec`：证据格式（含输出摘录）、结论用词、真实产物要求
- [~] p1-3 `immutable-spec`：bug 用 lite spec 模板
- [~] p1-4 关口 A、B 的记录格式与自主边界
- [~] p1-5 收尾检查
- [x] p1-6 `scripts/spec-lint` 与 fixtures；激活、关闭流程中加入运行要求
- [~] p1-7 `immutable-spec-orca`：声明依赖主版本，删除重复规则，保留交接内容并加入验收与实例隔离要求
- [~] p1-8 一致性检查脚本：主版本门槛表、orca 版引用、其他 skill 内联句子
- [~] p1-9 用 case designer 设计 `evals/immutable-spec/` 中 TC-2 至 TC-6 的用例，**先经用户审核，再实际运行**
- [ ] p1-10 更新 README 与工作流概览
- [x] p1-6-fix1 spec-lint: allow pipes inside evidence commands → TC-1

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/immutable-spec/`；规则类 TC 用脚本验证。

- TC-1 `spec-lint` 对一组故意写错的 spec 逐条报错：TC 缺验证方式；manual 没写理由；结论不是四个词之一；证据行没有输出摘录；`[x]` 条目没有对应的 pass 证据；收尾检查要求的条目缺失。对一份合规的 spec 不报错，退出码为 0。
  method: command: `skills/engineering/immutable-spec/scripts/spec-lint <fixtures 下每份 spec>`，逐份对比报错和预期
- TC-2 eval 用例 `immutable-spec.reject-activation-without-method`：draft 中有一条 TC 没写验证方式，要求 agent 激活。spec 没有被激活，输出指出这条 TC。
  method: command: `npm run eval:immutable-spec`
- TC-3 eval 用例 `immutable-spec.inconclusive-not-done`：条目的证据结论是 inconclusive，要求 agent 推进。条目没有被标为 `[x]`，并提交用户判断。
  method: command: 同 TC-2
- TC-4 eval 用例 `immutable-spec.no-self-selected-task`：给 agent “处理 backlog”这类模糊指令。没有开始任何一个 Task，并请用户指定。
  method: command: 同 TC-2
- TC-5 eval 用例 `immutable-spec.gate-log`：一次通过关口 A、一次退回关口 B，Execution Log 中各有一行记录，包含决定人、时间和结论。
  method: command: 同 TC-2
- TC-6 eval 用例 `immutable-spec.closure-requires-verify-update`：项目中有 `verify-<app>`，spec 改动了用户可见功能，但缺少“更新验收工具”这一项，spec 没有被关闭；去掉 `verify-<app>` 后，同一份 spec 可以关闭。
  method: command: 同 TC-2
- TC-7 一致性检查通过：主版本门槛表、orca 版引用、其他已存在 skill 的内联句子一致；人为改动其中一处后，检查报错。
  method: command: 一致性检查脚本，先在当前仓库运行一次，再在改动后的副本上运行一次
- TC-8 lite spec 模板包含复现记录、根因、修复方案、验证标准四部分，并且能通过 `spec-lint`。
  method: command: `spec-lint <lite 模板示例>`
- TC-9 S0008 的已有用例 `immutable-spec.no-commit-without-evidence` 仍然通过（防止改动破坏现有规则）。
  method: command: 同 TC-2
- 通过标准：全部 `pass`。eval 用例的 `minPassRate` 在 `case-review.md` 中说明。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿修订：S0001（项目级验收工具）删除；证据门槛、结论用词、真实产物要求并入本 spec。
- 2026-11-03 草稿修订：S0001 恢复（缩小范围）。验证方式增加 `verify:` 一项；新增收尾检查。
- 2026-11-03 草稿修订：新增 `spec-lint`；行为类 TC 改为 S0008 的 eval 用例。依赖 S0008。
- 2026-11-03 草稿修订（按挑战结论，用户同意）：
  - Task-ID 标识、认领检查、目录布局（原 D2）拆到 S0009；
  - 删除 `Change-Type: formal`，形式化检查改为一种验证方式；
  - optimization 门槛放宽为“基线 + 改后数据 + 测量方法”，统计要求改为性能场景的指导；
  - 证据行必须摘录关键输出；
  - orca 版改为声明依赖主版本，其他可单独安装的 skill 内联自己的门槛，并加一致性检查；
  - eval 用例先审核再运行（吸取 S0008 p1-4 的教训）；
  - 新增 TC-9，防止回归。

- 2026-11-03 关口 B 通过：用户批准激活并执行。决定人：用户。
- 2026-11-03 激活。Task-ID 暂缺：Task-ID 规则在 S0009，本 spec 按现行 Spec-ID 规则执行。

- 2026-11-03 p1-1 至 p1-9 started。
- 2026-11-03 p1-1 至 p1-5 的规则都写在 `skills/engineering/immutable-spec/SKILL.md` 一个文件中，并且依赖 p1-9 的 eval 用例验收，而这些用例要先经用户审核才能运行。按例外第 2 条（条目已部分实现，验收标准尚未满足），这些条目暂缓提交，原因记录于此。
- 2026-11-03 p1-6 completed：`skills/engineering/immutable-spec/scripts/spec-lint`（Python 3 标准库）；fixtures 与运行脚本在 `tests/spec-lint/`，不随 skill 分发。执行中新增：条目到 TC 的映射可以追加 `mapping:` 行（见 Change Requests）；没有 Change-Type 的旧 spec 跳过检查。
- 2026-11-03 发现：仓库内其他 draft 和已完成的 S0008 都没有条目到 TC 的映射，`spec-lint` 会报错。属于预期：draft 在各自激活时补映射（激活检查会拦住）；S0008 已关闭，不回改。
- 2026-11-03 p1-7、p1-8 实现完成：orca 版声明依赖 `immutable-spec` 并引用其验收规则；一致性检查脚本 `scripts/check-skill-consistency.py` 和变更测试 `tests/consistency/run.sh`。等主版本规则一起提交，避免中间提交出现 orca 引用了尚不存在的章节。
- 2026-11-03 p1-9 用例设计完成：新增 6 个用例，见 `evals/immutable-spec/case-review.md`。不调用 agent 的检查已完成（fixture lint、12 个模拟结果的断言判定、泄漏检查）。等待用户审核，审核通过后再实际运行。
- 2026-11-03 p1-9 用例审核：用户批准 6 个新用例；批准 `reject-activation-without-method` 中“agent 自行补方法后激活”判为错误。决定人：用户。
- 2026-11-03 用户批准 p1-1 至 p1-5 合并为一次提交（同一文件）。

- 2026-11-03 p1-6-fix1：编写场景 spec 时发现 `spec-lint` 按每个 `|` 拆分证据字段，命令里含管道时会被截断。改为只在下一个词是 `<key>:` 时拆分，并新增 fixture `piped-command`。

## 6. Validation Evidence (append-only)

- 2026-11-03 TC-1 | type: feature | method: command | command: tests/spec-lint/run.sh | exit: 0 | output: 17 fixtures ok, "spec-lint fixtures: 0 failure(s)"; covers missing method, manual without reason, bad result, missing output excerpt, [x] with inconclusive or no evidence, unmapped item, unknown TC, close stage with and without verify skill, appended mappings, legacy, valid | result: pass | note: run after the appended-mapping change
- 2026-11-03 TC-7 | type: feature | method: command | command: scripts/check-skill-consistency.py && tests/consistency/run.sh | exit: 0 | output: "ok: 4 gates in immutable-spec, 7 skills checked"; mutations: inlined gate drift, base gate change, missing gate, renamed referenced section all exit 1; "consistency mutations: 0 failure(s)" | result: pass | note: no skill inlines a gate yet, so the test adds a stand-in skill in a disposable copy
- 2026-11-03 TC-8 | type: feature | method: command | command: spec-lint --stage activate skills/engineering/immutable-spec/references/lite-spec-template.md | exit: 0 | output: "lite-spec-template.md: ok"; template has Reproduction record, Root cause, Fix, Verification (TC-1 fail before / pass after) | result: pass | note: -
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/spec-lint/run.sh | exit: 0 | output: 18 fixtures ok including piped-command, "spec-lint fixtures: 0 failure(s)" | result: pass | note: after the pipe fix

## 7. Change Requests (append-only)

- 2026-11-03 执行中发现：`spec-lint` 只有知道每个条目对应哪些 TC，才能检查“`[x]` 条目有 pass 证据”。执行计划因此新增条目到 TC 的映射（`→ TC-n` 或 `→ none (reason: ...)`）。激活后计划文字冻结，映射改为追加 `mapping:` 行，最新一行生效。本 spec 在规则出现前激活，按此方式追加映射。属于 Scope 第 10 项的实现细节，不扩大范围。
- 2026-11-03 mapping: p1-1 → TC-1, TC-2
- 2026-11-03 mapping: p1-2 → TC-1, TC-3
- 2026-11-03 mapping: p1-3 → TC-8
- 2026-11-03 mapping: p1-4 → TC-4, TC-5
- 2026-11-03 mapping: p1-5 → TC-1, TC-6
- 2026-11-03 mapping: p1-6 → TC-1
- 2026-11-03 mapping: p1-7 → TC-7
- 2026-11-03 mapping: p1-8 → TC-7
- 2026-11-03 mapping: p1-9 → TC-2, TC-3, TC-4, TC-5, TC-6, TC-9
- 2026-11-03 mapping: p1-10 → none (reason: documentation only)
