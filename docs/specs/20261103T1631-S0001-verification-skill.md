# verification skill：项目级验收工具

Spec-ID: S0001
Task-ID: (待建)
Change-Type: feature
Status: active
Created Time: 2026-11-03T13:55:00+08:00
Start Time: 2026-11-03T16:31:29+08:00
Completion Time:
Previous Spec-ID: S0002
Closure Reason:

## 1. Requirement Details

### Background

S0002 规定了每个 spec 的通过标准和自主验收规则。标准说明了要检查什么，但 agent 每次还要重新摸索怎么启动和操作应用。启动复杂的项目（多服务、数据库、登录、链上环境）、需要通过界面验收的项目、在 Orca 中多个 worktree 并行时，这一步经常失败。结果要么是退回 `inconclusive` 交给人，要么是换一条更容易的路径去验证。

验收工具的作用，是把怎么启动、怎么操作、证据存在哪固定下来一次，之后所有 agent 直接复用。它不定义验收标准。

### Scope

1. 新增可分发 skill `skills/engineering/verification/`，用户手动调用，三种用法：
   - `create`：为目标项目生成项目内的验收工具 `verify-<app>`。
   - `maintain --scope <diff>`：局部更新，只处理 diff 涉及的功能。
   - `maintain`：全量检查，处理所有功能。
2. `references/drive-contract.md`：驱动真实应用时的取证标准、证据目录、实例隔离、控制脚本要求。create 时把它写进生成的 `verify-<app>`，所以执行阶段的 agent 不需要安装 `verification` 也能读到。
3. `references/feature-map-example/`：功能清单示例。
4. 更新 README 与工作流概览。

### 触发时机

| 时机 | 用法 | 触发方 |
|---|---|---|
| ① 第一次需要时：`spec-design` 起草验证计划，发现有 TC 必须在真实应用上验证，而项目里还没有 `verify-<app>` | `create` | agent 提议，用户决定 |
| ② 每个 spec 收尾时：作为执行计划的最后一项，在关闭之前（规则见 S0002） | `maintain --scope <该 spec 的 diff>` | spec 执行者 |
| ③ 定期，或执行中发现验证因清单过时而跑不通 | `maintain` | 用户 |

### Constraints

- 独立安装，不要求安装其他 skill。
- 生成的产物是普通文件。`immutable-spec`、`spec-design`、`bug-fix`、`code-review` 只读取它，不依赖 `verification`。
- 不绑定 harness，Claude Code、Codex、Cursor 都能使用产物。
- 生成的 `verify-<app>` 交付前必须完整运行一次。没有运行过的只算草稿。
- maintain 只改验收工具自己的目录，不改产品代码。

### Non-goals

- 验收标准、证据门槛、结论用词（S0002）。
- 形式化验证（S0006）。
- 并行全量验证（swarm 式扇出）。

## 2. Outline Design

### 2.1 取证标准（`references/drive-contract.md`）

1. 走真实用户路径，不用内部 setter 或只供测试用的接口。
2. 同时记录动作和动作后的状态。副作用（写入的文件、插入的记录、发出的消息）要单独确认。
3. dry-run 或测试模式实际跳过了什么，要观察确认，不能按名字推断。
4. mock 只用在生产环境本来就隔离的外部边界上。
5. 证据目录：`.verify-artifacts/<run-id>/<feature-id>/`，加入 gitignore，清理时不删除。写入 spec 的证据行必须摘录关键输出（S0002），目录中的截图和日志只作补充。
6. 实例隔离：多个 worktree 并行时，用 run-id 派生端口、数据目录和用户配置。做不到时，在产物中明确声明一次只能运行一个实例。
7. 控制脚本要求：命令少而可组合；有破坏性的操作支持 `--dry-run`；输出 JSON；错误信息说明该怎么做；`--help` 完整。
8. 结论用词与 S0002 一致：`pass`、`fail`、`inconclusive`、`unreachable`。

### 2.2 生成产物

```text
<产物根目录>/verify-<app>/
├── SKILL.md         Launch / Doctor / Drive / Evidence / Cleanup / Helpers / Isolation
├── drive-contract.md
├── features/
│   ├── README.md    前置条件、驱动约定、证据与跳过的报告方式、功能索引
│   └── <feature>.md
└── scripts/         控制脚本（可选）
```

每个功能文件有五个固定的二级标题：
- `Sub-features`
- `How to get to it (user POV)`
- `Driving it with <harness>`
- `Gotchas`
- `Source entry points`：功能对应的源码路径和函数，用于从 diff 推出需要更新或验证的功能。

前四个沿用 pstack，第五个是新增的。

spec 中引用功能的写法：`method: verify:<feature-id>/<sub-feature>`。

产物根目录待定（决策 D1，见 p1-1）：
- 方案 A：放在 harness 的 skill 目录，例如 `.claude/skills/`。agent 能自动发现，但各 harness 的路径不同。
- 方案 B：主体放在 `docs/verification/`，各 harness 的 skill 目录里只放一个指向它的薄包装，和 `docs/specs/` 的做法一致。当前倾向 B。

### 2.3 create

1. 先从代码里找答案，只问代码里看不出来的：用户接触的界面、启动方式、驱动方式、可采集的证据、能否同时运行多个实例。
2. 项目构建或启动不了时，先修好或如实报告，再生成。
3. 生成 SKILL.md 的各节和辅助脚本，不留占位符。写入 `drive-contract.md`。
4. 从路由、命令、菜单中挑出 3 到 5 个主要功能，写进清单。
5. 完整跑一遍：Launch → Doctor → 驱动一个功能 → 采集证据 → Cleanup → 确认证据还在。失败就修，每次失败后都执行清理。
6. 如果是在替代环境中跑通的，列出替代环境多做了、而真实目标不会做的步骤。

### 2.4 maintain --scope（局部）

1. 用 diff 对照各功能的 `Source entry points`，找出受影响的功能。diff 里新增了用户可见入口（路由、命令、菜单）、但清单里没有对应功能的，算作新功能。
2. 新功能写进清单；受影响的功能更新操作步骤和 `Source entry points`。
3. 实际运行受影响的功能和新功能各一次，确认清单与应用一致。
4. 结论为 `clean`、`changed`、`blocked` 之一。证据追加到所在 spec 的第 6 节。

### 2.5 maintain（全量）

1. 整理功能清单的索引。
2. 每个功能派一个只读子 agent 读源码，返回：功能摘要、源码入口、疑似漂移、一条验证配方。
3. 合并配方，抽查漂移，检查近期改动中有没有清单漏掉的功能。
4. 每个功能至少实际运行一次。全程遵守三条：
   - 驱动前先做健康检查；
   - 证据在任何清理之后都还在；
   - 运行中启动的东西，运行结束后都清理掉。
5. 问题分三类：
   - 文档过时：修清单。
   - 驱动方法覆盖不到：修脚本。
   - 产品本身坏了：只报告，不改产品代码。
6. 结论为 `clean`、`changed`、`blocked` 之一。只有 `changed` 时才提交一次改动。

### 2.6 风险与回滚

- 风险：SKILL.md 篇幅过长。缓解：取证标准放在 references 里，SKILL.md 只写流程。
- 风险：GUI 应用驱动不了。缓解：如实标为 `unreachable`，写明缺少的前置条件。
- 风险：局部更新漏掉没有登记源码入口的功能。缓解：靠时机 ③ 的全量检查兜底。
- 回滚：这是一个新目录，删除即可，不影响已有 skill。

## References

- `docs/research/2026-11-03-pstack.md`
- `docs/specs/completed/20261103T1525-S0002-immutable-spec-upgrade.md`（通过标准、结论用词、收尾检查）
- pstack `skills/create-verification-skill/`、`skills/maintain-verification-skill/`、`docs/guide/06-verify-and-ship.md`

## 3. Execution Plan

p1 交付 skill 文本，用静态检查（TC-1、TC-8）验收；skill 的行为由 p1-7 的 eval 用例（TC-9 至 TC-12）和 p2 的试点（TC-2 至 TC-7）验收。全部通过之前本 spec 不关闭。

- [x] p1-1 调研 Claude Code、Codex、Cursor 项目级 skill 的发现路径，确定产物根目录（D1），把决策追加到 Execution Log → TC-8
- [x] p1-2 编写 `references/drive-contract.md` → TC-1
- [x] p1-3 编写 SKILL.md 的 create → TC-1
- [x] p1-4 编写 SKILL.md 的 maintain（局部和全量） → TC-1
- [x] p1-5 编写 `references/feature-map-example/`（含 `Source entry points`） → TC-1
- [x] p1-6 补充 `agents/openai.yaml`，更新 README（工作流概览由用户维护，本 spec 不修改） → TC-1
- [x] p1-7 用 case designer 设计 `evals/verification/` 用例，先不调用 agent 验证用例本身，经用户审核后再实际运行 → TC-9, TC-10, TC-11, TC-12
- [~] p2-1 试点 A：在一个 Web 或 CLI 项目上运行 create（项目待定） → TC-2, TC-3, TC-4
- [ ] p2-2 试点 B：在一个 Aiken 项目上运行 create，与 `aiken-debug` 对照（项目待定） → TC-5
- [~] p2-3 局部更新试点：在试点 A 上做一次新增功能的改动，运行 `maintain --scope` → TC-6
- [x] p2-4 全量检查试点：在试点 A 上人为制造漂移和一个产品回归，运行 `maintain` → TC-7
- [x] p1-4-fix1 maintain：只有全量检查更新 `Last full run:`，局部更新不动它 → TC-1, TC-12
- [x] p1-3-fix2 create：包装写不进去时不算完成，输出包装内容和创建命令并列为剩余一步，说明哪个 agent 在此之前发现不了工具 → TC-1
- [ ] p1-4-fix2 maintain --scope：源码入口匹配到的功能都算受影响并要驱动，排除必须点名并说明理由；说明新入口何时并入已有功能、何时单建文件，报告写明选择和理由 → TC-1, TC-12

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/verification/`，由 `npm run eval:verification` 运行，证据行写明用例 ID。用例先经用户审核再运行。

TC-2 至 TC-7 在试点项目上运行，试点项目由用户在 p2 开始前指定。下文 `<pilot-A>`、`<pilot-B>` 指试点项目根目录，`<app>` 指生成的工具名。

- TC-1 skill 结构检查通过：frontmatter 合法，`name` 与目录名一致；SKILL.md 与 references 中引用的文件都存在；SKILL.md 不要求安装其他 skill；`drive-contract.md` 的结论用词恰好是 `pass`、`fail`、`inconclusive`、`unreachable`；`feature-map-example` 的每个功能文件按顺序有五个二级标题；`agents/openai.yaml` 存在；README 列出 `verification`。
  method: command: `tests/verification/structure.sh`
- TC-2 试点 A 的产物包含与 skill 相同的 `drive-contract.md`，并按 D1 在 agent skill 目录中有 `verify-<app>` 包装。
  method: command: `diff skills/engineering/verification/references/drive-contract.md <pilot-A>/docs/verification/<app>/drive-contract.md`，再列出 `<pilot-A>/.claude/skills/verify-*/SKILL.md` 与 `<pilot-A>/.agents/skills/verify-*/SKILL.md`
- TC-3 试点 A 生成的 `verify-<app>` 被完整执行一次：启动、健康检查、驱动一个功能、采集证据、清理，并确认清理后证据还在。
  method: command: 在 `<pilot-A>` 上按产物的 Launch、Doctor、Drive、Evidence、Cleanup 逐步执行并记录每一步的输出，最后 `ls <pilot-A>/.verify-artifacts/<run-id>/`
- TC-4 在两个 worktree 中同时运行试点 A 的验证，互不冲突；或产物明确声明只能单实例运行。
  method: command: 在 `<pilot-A>` 的两个 worktree 中同时执行 TC-3 的步骤，比较两次运行的端口、数据目录和证据目录
- TC-5 试点 B 达到 TC-3 的标准，或者在 `unreachable` 中写明具体的前置条件。
  method: command: 在 `<pilot-B>` 上执行 TC-3 的步骤
- TC-6 局部更新：新功能被写进清单，受影响的功能被实际运行过，未受影响的功能没有被运行。
  method: command: 在 `<pilot-A>` 上运行 `maintain --scope <新增功能的 diff>`，检查 `docs/verification/` 的改动和 `.verify-artifacts/<run-id>/` 下的功能目录
- TC-7 全量检查：人为制造的漂移被识别并修正，结论为 `changed`；人为制造的产品回归被报告，没有被改文档掩盖。
  method: command: 在 `<pilot-A>` 上制造漂移和回归后运行 `maintain`，检查输出、文档改动，并确认产品代码未改动
- TC-8 D1 选定的布局能被 `spec-lint` 识别：只有 `.claude/skills/verify-*` 包装、只有 `.agents/skills/verify-*` 包装、两者都有，三种情况下 `--stage close` 都要求验收工具更新；只有 `docs/verification/` 主体时不要求。
  method: command: `tests/verification/layout.sh`
- TC-9 eval 用例 `verification.create-proves-before-handover`：在一个能运行的小 CLI 项目上 create，产物按 D1 布局写出并记录一次完整运行，证据在清理后仍在，产品代码未改。
  method: command: `npm run eval:verification`
- TC-10 eval 用例 `verification.create-unrunnable-stays-draft`：项目在当前环境中启动不了，create 不把没运行过的工具当作交付（要么不写，要么标为草稿），输出说明卡在哪一步，产品代码未改。
  method: command: `npm run eval:verification`
- TC-11 eval 用例 `verification.maintain-reports-regression`：全量 maintain 修正文档漂移并提交；产品回归只报告，不改产品代码，也不改文档去迁就它。
  method: command: `npm run eval:verification`
- TC-12 eval 用例 `verification.maintain-scope-only-mapped`：`maintain --scope` 把新功能写进清单并运行它，不运行、不修改未受影响的功能。
  method: command: `npm run eval:verification`
- 通过标准：全部 `pass`。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿曾被删除，随后恢复并缩小范围：证据门槛和结论用词移到 S0002；新增三个触发时机和 `maintain --scope`。依赖 S0002。
- 2026-11-03 草稿修订（按挑战结论）：证据行必须摘录关键输出，证据目录只作补充。
- 2026-11-03 草稿修订（激活前）：每条 TC 写明验证方式，每个条目映射到 TC；新增 TC-8（D1 布局能被 spec-lint 识别）、TC-9 至 TC-12（eval 用例）和条目 p1-7（eval 用例设计与运行）；TC-2 改为只检查试点产物，“不要求安装其他 skill”并入 TC-1；p1-6 不再包含工作流概览。`spec-lint --stage activate` 通过，没有 manual TC。
- 2026-11-03 并行交付：本 spec 在独立 worktree 分支中激活和交付，与 S0007、S0004、S0005 并行；main 上只合入已关闭的 spec。用户同意。
- 2026-11-03 gate A passed: requirements as discussed with the user in the planning session. Decided by: user.
- 2026-11-03 gate B passed: user approved activating and delivering S0001 ("按照这个顺序继续推进"). Decided by: user.
- 2026-11-03 激活。Task-ID 暂缺：Task-ID 规则在 S0009，本 spec 按现行 Spec-ID 规则执行。

- 2026-11-03 p1-1 started。
- 2026-11-03 p1-1 调研结果（各 harness 的项目级 skill 目录）：
  - Claude Code（code.claude.com/docs/en/skills）：项目级 `.claude/skills/<skill-name>/SKILL.md`，从启动目录向上找到仓库根（worktree 中到 worktree 根）；子目录里的 `.claude/skills/` 在读写该子目录文件后才加载。文档没有提到 `.agents/skills/`。
  - Codex（learn.chatgpt.com/docs/build-skills，原 developers.openai.com/codex/skills 308 跳转）：扫描从当前目录到仓库根每一级的 `.agents/skills`。文档没有把 `.codex/skills` 列为 skill 目录。
  - Cursor（cursor.com/docs/context/skills）：项目级 `.agents/skills/` 和 `.cursor/skills/`；“For compatibility, Cursor also loads skills from Claude and Codex directories: `.claude/skills/`, `.codex/skills/`”。
  - skills.sh CLI 1.7.6（`/tmp/s0001-skillscli/node_modules/skills/dist/cli.mjs`）：`AGENT_PROJECT_SKILL_DIRS` 共 30 个目录，含 `.agents/skills`、`.claude/skills`、`.codex/skills`；安装目标 `claude-code` 为 `.claude/skills`，`codex` 与 `cursor` 都是 `.agents/skills`。
  - 结论：没有一个目录能同时被 Claude Code 和 Codex 发现；`.claude/skills/` 加 `.agents/skills/` 两处覆盖三个 harness。
- 2026-11-03 D1 决策：采用方案 B。主体放在 `docs/verification/<app>/`（`README.md` 写 Launch / Doctor / Drive / Evidence / Cleanup / Helpers / Isolation，另有 `drive-contract.md`、`features/`、`scripts/`）；在 `.claude/skills/verify-<app>/SKILL.md` 和 `.agents/skills/verify-<app>/SKILL.md` 各放一个只含 frontmatter 和指向主体的薄包装，项目确定只用其中一种 harness 时只写对应的那个。理由：（1）主体与 harness 无关，满足“不绑定 harness”，也和 `docs/specs/` 的做法一致，人能直接读；（2）两个包装覆盖 Claude Code、Codex、Cursor，内容只有指针，不会出现两份主体漂移；（3）包装就是根目录 agent skill 目录下的 `verify-*` 目录，`spec-lint` 的收尾检测照常生效（TC-8）；（4）maintain 的修改范围清楚：`docs/verification/<app>/` 加两个包装。代价：agent 多读一个文件；Cursor 会看到两个同名包装，内容相同，不影响使用。没有选方案 A（主体放在某个 harness 目录、另一个放符号链接或副本）：符号链接在 Windows 和部分 harness 上不可靠，副本会漂移。决定人：agent，用户可推翻。
- 2026-11-03 p1-1 completed：新增 `tests/verification/layout.sh`，验证 D1 布局被 `spec-lint` 识别。

- 2026-11-03 p1-2 started。
- 2026-11-03 p1-2 completed：`skills/engineering/verification/references/drive-contract.md`（Proof、Evidence、Results、Isolation、Control scripts）；新增 `tests/verification/structure.sh`，按部分检查 skill 结构（contract、feature-map、skill、meta，不带参数时全部检查）。各条目先只检查自己交付的部分，p1-6 时跑全量。

- 2026-11-03 p1-5 started（先于 p1-3：SKILL.md 要链接到这个示例）。

- 2026-11-03 p1-5 completed：`references/feature-map-example/`：README（前置条件、驱动约定、报告方式、功能文件约定、索引）和两个功能文件 `create-note.md`（浏览器与 CLI）、`export.md`（CLI，含 dry-run），各有五个固定二级标题，最后一个是 `Source entry points`。示例按 D1 写，命令走生成工具的 `scripts/verify`。

- 2026-11-03 p1-3 started。

- 2026-11-03 p1-3 completed：`skills/engineering/verification/SKILL.md`：三种用法、D1 产物布局与包装模板、修改范围、create 七步。决定：主体首行 `Last full run:` 记录最近一次完整运行的 run-id，没跑通时写 `none (draft: <卡住的步骤和原因>)`，草稿不提交，这样“没运行过的只算草稿”可以从文件上直接看出来；只能修环境问题，改产品代码要用户同意；伪造应用自己的部件（如数据库）不算替代环境。frontmatter 设 `disable-model-invocation: true`（用户手动调用）。

- 2026-11-03 p1-4 started。

- 2026-11-03 p1-4 completed：SKILL.md 新增 `maintain`：共用规则（定位工具、修改范围、三类问题的分诊和区分“有意改动”与“回归”的依据、驱动的三条不变式、结论 `clean`/`changed`/`blocked`），`maintain --scope` 五步（按 `Source entry points` 匹配 diff、识别新入口、只驱动受影响和新增的功能），`maintain` 全量五步。`structure.sh skill` 增加章节和三个结论词的检查。

- 2026-11-03 p1-6 started。

- 2026-11-03 p1-6 completed：`agents/openai.yaml`（不允许隐式调用，与 code-review 一致）；README 在 User-invoked 下加入 verification 条目、目录树和 `tests/verification/`。`docs/ai-engineering-workflow-overview.md` 按用户要求未修改（该文件也未纳入版本控制）。仓库已有检查不受影响：`scripts/check-skill-consistency.py` 输出 "ok: 4 gates in immutable-spec, 8 skills checked"，`tests/spec-lint/run.sh` 输出 "spec-lint fixtures: 0 failure(s)"。

- 2026-11-03 p1-7 started：按 case designer 设计 4 个用例（TC-9 至 TC-12），新增 `npm run eval:verification`。

- 2026-11-03 p1-7 用例设计完成：4 个用例 `verification.create-proves-before-handover`（TC-9）、`verification.create-unrunnable-stays-draft`（TC-10）、`verification.maintain-reports-regression`（TC-11）、`verification.maintain-scope-only-mapped`（TC-12），见 `evals/verification/case-review.md`；新增 `npm run eval:verification`。不调用 agent 的检查已完成：4 个 fixture 应用在临时副本中按预期运行或失败；`tests/verification/eval-simulations.cjs` 用 suite 自己的 hook 建工作区并运行真实断言，18 个模拟结果全部判定正确（4 个正确结果通过，14 个错误结果被拒绝）；泄漏检查无命中（仅 fixture 中工具自带的 drive-contract 副本含 “drift” 一词）；`promptfoo validate config` 输出 "Configuration is valid."。等待用户审核，审核通过后再实际运行。
- 2026-11-03 p1-7 暂缓提交：按例外第 2 条（条目已部分实现，TC-9 至 TC-12 尚无运行证据），用例、fixtures、断言、`package.json` 脚本和模拟脚本留在工作区未提交，等用户审核用例后与运行证据一起提交。

- 2026-11-03 p1-7 用例审核：用户批准 verification 的全部用例、case-review 中列出的判断、D1 方案 B 和 Last full run 标记；试点 A 定为 utxray，试点 B 定为 bubble-cardano-validators。决定人：用户。

- 2026-11-03 第一次全量运行（cauu-skill-eval.sIFfyp）：create-proves-before-handover、create-unrunnable-stays-draft、maintain-scope-only-mapped 通过；maintain-reports-regression 失败，只有 driftFixed 为 false，agent 输出称已把 list.md 改为 `list`。判断为用例过窄：负向检查在整个文件里找 `notes ls`，修正后的文件在 Gotchas 等处提到旧名字也会被判失败，比已批准的意图（清单的驱动步骤用 `list` 而不是 `ls`）更窄。修正第 1 轮：driftFixed 只检查 “Driving it with” 一节，决定性要求不变；新增两个模拟（Gotchas 提到旧名字应通过；入口改了但驱动步骤仍是 `ls` 应失败），20 个模拟全部判对。记录在 case-review.md 的 Changed after approval。当时的工作区已被后续用例覆盖，无法确认 list.md 的原文，原因是推断。
- 2026-11-03 单独重跑 maintain-reports-regression（cauu-skill-eval.5t639W）：driftFixed 等文件检查全部通过（list.md 驱动步骤为 `list`，提交 84ca5df 只改工具文件并写明 export 回归），但 outcomeChanged 为 false：agent 启动了 3 个后台只读子 agent 并调用 ScheduleWakeup 等待，provider 在第 9 轮（45 秒）以 terminalReason completed 返回了中间消息作为最终输出，最终报告没有被捕获。判断为输出捕获的基础设施问题，不是 skill 或用例错误；按要求不采用这次的部分输出，改动 skill 后整套重跑。
- 2026-11-03 p1-4-fix1 started：第一次运行中 maintain-scope 的 agent 指出 SKILL.md 要求 `changed` 时一律把 `Last full run:` 设为本次运行，但局部更新不是全量检查，挪动这一行会让下一次全量检查漏看变化。agent 的判断正确，skill 有误。修改为只有全量检查更新这一行。

- 2026-11-03 p1-4-fix1 completed：SKILL.md 的 `changed` 结论改为 “Only a full pass sets `Last full run:` to this run; a scoped pass leaves it”。第三次整套运行（cauu-skill-eval.6AYJhG，基于修正后的 skill）中 maintain-scope 的工作区 `Last full run:` 保持 20261101T100000Z-notes，提交 b5dd1aa 只改 features/README.md 和 features/search.md。

- 2026-11-03 p1-7 completed：第三次整套运行（cauu-skill-eval.6AYJhG，基于修正后的 skill）4 个用例全部通过，exit 0；共做了 1 处用例修正（driftFixed 的检查范围，见 case-review.md）和 1 处 skill 修正（p1-4-fix1）。所有 create 运行中沙箱都拒绝写 `.claude/skills/`，只写出了 `.agents/skills/` 包装，用例按已批准的判断接受；试点要确认两个包装都写出。模拟验证 20 个结果全部判对。

- 2026-11-04 p2-1 started：试点 A = utxray。分支 `pilot/verification`（从 main 31f3b1d 开出），worktree `/tmp/pilots/utxray-verify`；TC-4 另用 `/tmp/pilots/utxray-verify-2`（detached HEAD）。不合并、不推送。
- 2026-11-04 p2-1 基线：`cargo build` exit 0。第一次 `cargo test --workspace` exit 101，只有 `test_schema_validate_blueprint_not_found` 失败（`left: String("CONFIG_LOAD_FAILED")`）。原因：`tests/fixtures/no_blueprint` 是 git 不跟踪的空目录，新 worktree 里没有。在试点 worktree 中建出这个空目录（不跟踪，和主 checkout 相同）后 exit 0，392 passed、0 failed、8 ignored。另外两点：`cargo test` 会改写 `tests/fixtures/escrow/.utxray/context.json`（主 checkout 里用户那处未提交改动很可能就是这样来的），已在试点 worktree 中还原；`cargo clippy --workspace -- -D warnings` 在 `crates/utxray-core/src/cbor/schema.rs` 有既有的 collapsible-match 错误（新版 clippy），与试点无关。
- 2026-11-04 p2-1 create：全新 headless Claude（`claude -p "... Run create for this project ..." --permission-mode acceptEdits`，输出 `/tmp/pilots/verification-create.json`），55 轮、512 秒、标价 $2.51，提交 bacbfd5。产物：`docs/verification/utxray/`（README、drive-contract.md、5 个功能 build / test-diagnose / schema-validate / cbor / tx-offline、控制脚本 `scripts/verify`，子命令 launch、doctor、seed、run、drive、cleanup）、`.agents/skills/verify-utxray/SKILL.md`、`.gitignore` 加 `.verify-artifacts/`。`.claude/skills/verify-utxray/SKILL.md` 没有写出：输出的 `permission_denials` 记录了对这个路径的 Write 被拒（Claude Code 在 acceptEdits 下仍保护 `.claude/`），agent 在报告中说明了缺失和补法。skill 的说明本身没有错，但用 Claude Code headless 跑 create 时写不出 D1 的第二个包装。待用户决定：手动补包装；跑 create 时放开 `.claude/skills/` 的写权限；或者改 skill，让包装被拒时输出一条可直接执行的补写命令。运行没有报错，未重跑。
- 2026-11-04 p2-1 未完成：TC-3、TC-4 pass，TC-2 fail（缺 `.claude/skills/verify-utxray/`）。条目标为 `[~]`。

- 2026-11-04 p2-3 started：试点分支提交 2b10c16，新增只读子命令 `utxray cbor info --hex <hex>`（输出字节长度和顶层 major type），只改 `crates/utxray-cli/src/commands/cbor.rs` 和 README 命令表。按清单，`cbor.rs` 同时列在 `cbor` 和 `tx-offline` 的 `Source entry points` 中（后者写作 "`crates/utxray-cli/src/commands/cbor.rs`: `RedeemerIndexArgs` handler"）。
- 2026-11-04 p2-3 maintain --scope：全新 headless Claude（输出 `/tmp/pilots/verification-maintain-scope.json`），23 轮、136 秒、标价 $0.74，结论 `changed`，提交 7ce0861 只改 `features/README.md`、`features/cbor.md`、`scripts/verify`。`cbor info` 作为 `cbor` 的子功能 `info`、`info-invalid` 写进清单，没有单独建功能文件。agent 的理由是同一命令组、同一源文件，但这偏离了 skill 中"没有功能覆盖的新入口算新功能"。运行 20261104T004811Z-utxray-verify-scope 只驱动了 `cbor`（8 步全部符合），`Last full run:` 没动。问题：agent 写 "`cbor` was the one affected feature"，既没驱动也没提到同样列了 `cbor.rs` 的 `tx-offline`。按 skill 第 2 步（"a changed path appears in its Source entry points"）这是漏判。按符号粒度可以说得通（diff 没碰 redeemer-index 的 handler），但 skill 没说符号限定可以缩小匹配，agent 也没说明自己是这样判断的。
- 2026-11-04 p2-3 未完成：TC-6 fail。条目标为 `[~]`。建议修 skill：路径匹配到的功能都算受影响；要按符号排除，必须在报告中点名被排除的功能和理由；同时说明新入口归入已有功能和单建文件分别在什么情况下用。

- 2026-11-04 p2-4 started：在试点分支分两个提交植入问题。8cb2b90 是文档漂移：`cbor decode --file` 改名为 `--input`，CHANGELOG.md（新建，"Unreleased / Changed"）、README 和 `crates/utxray-cli/tests/cli_cbor_test.rs` 都与新行为一致。f561e63 是产品回归：`schema validate` 把 `ValidatorNotFound` 并进 `BLUEPRINT_NOT_FOUND` 分支，提交信息只写 "refactor(schema): merge not-found error arms"；`test_schema_validate_validator_not_found` 仍要求 `VALIDATOR_NOT_FOUND`，一运行就失败（`left: String("BLUEPRINT_NOT_FOUND")`）。
- 2026-11-04 p2-4 maintain：全新 headless Claude（输出 `/tmp/pilots/verification-maintain-full.json`），37 轮、294 秒、标价 $3.35，结论 `changed`，提交 6ef6d49 只改 `docs/verification/utxray/` 下的 7 个文件。漂移已修：驱动步骤和脚本都改成了 `--input`。回归按 fail 报告，清单仍要求 `VALIDATOR_NOT_FOUND`。`Last full run:` 更新为 20261104T005206Z-utxray-verify，5 个功能都驱动过。agent 又试着补写 `.claude/skills/verify-utxray/SKILL.md`，同样被权限拒绝，并在报告中说明（见 p2-1）。
- 2026-11-04 p2-4 completed：TC-7 pass。
- 2026-11-04 试点 A 花费（标价，取自各次 `total_cost_usd`）：create $2.51 + maintain --scope $0.74 + maintain $3.35 = $6.60。试点分支 `pilot/verification`、worktree `/tmp/pilots/utxray-verify` 和 `/tmp/pilots/utxray-verify-2` 留给用户，没有合并、没有推送。`.git/info/exclude` 中加了 `.claude/skills/verification/`；这个文件是所有 worktree 共用的，主 checkout 里没有该路径，所以没有影响。

- 2026-11-03 p1-3-fix2 completed（来自试点 A 的 TC-2 失败：headless Claude Code 拒绝写 `.claude/`，create 只写出 `.agents/skills/` 包装）：SKILL.md create 新增第 8 步：包装写入被拒或失败时不算完成，报告包装的完整内容、可直接运行的创建命令，列为唯一剩余步骤，并说明在它存在之前哪个 agent 发现不了工具（`.claude/skills/` 对应 Claude Code，`.agents/skills/` 对应 Codex 和 Cursor）。

## 6. Validation Evidence (append-only)

- 2026-11-03 TC-8 | type: feature | method: command | command: tests/verification/layout.sh | exit: 0 | output: "ok claude-wrapper-only: update required (exit 1)", "ok agents-wrapper-only: update required (exit 1)", "ok both-wrappers: update required (exit 1)", "ok body-without-wrapper: ok (exit 0)", "verification layout: 0 failure(s)" | result: pass | note: runs the real spec-lint --stage close against temporary repos laid out per D1
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/verification/structure.sh contract | exit: 0 | output: "ok result words: pass fail inconclusive unreachable", contract mentions .verify-artifacts/<run-id>/<feature-id>/, gitignore, --dry-run, JSON, --help, run-id; "verification structure (contract): 0 failure(s)"; mutation (unreachable -> verified-unreachable) gives "FAIL result words are 'pass fail inconclusive verified-unreachable'" | result: pass | note: contract part only (p1-2); the four words match immutable-spec SKILL.md lines 350-353
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/verification/structure.sh feature-map | exit: 0 | output: "ok five H2s in order" for create-note.md and export.md, "ok indexed" for both, "ok 2 feature files", "verification structure (feature-map): 0 failure(s)"; mutation (Source entry points -> Source files) gives "FAIL H2s in .../export.md" | result: pass | note: feature-map part only (p1-5)
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/verification/structure.sh skill | exit: 0 | output: "ok name: verification", "ok description present", "ok link SKILL.md -> references/drive-contract.md", "ok link SKILL.md -> references/feature-map-example/README.md", "ok SKILL.md requires no other skill", "ok no placeholders", "verification structure (skill): 0 failure(s)"; mutation (appended "Requires the immutable-spec skill" and a link to references/missing.md) gives 2 failures | result: pass | note: skill part only (p1-3, create section)
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/verification/structure.sh skill | exit: 0 | output: "ok section: ## create", "ok section: ## maintain", "ok section: ### maintain --scope <diff>", "ok section: ### maintain (full)", "ok maintain outcomes: clean changed blocked", "verification structure (skill): 0 failure(s)"; mutation (blocked -> stuck) gives "FAIL maintain outcomes are 'clean changed stuck'" | result: pass | note: skill part (p1-4); maintain behavior is accepted by TC-11, TC-12 and TC-6, TC-7
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/verification/structure.sh | exit: 0 | output: 36 ok lines across contract, feature-map, skill, meta, including "ok result words: pass fail inconclusive unreachable", "ok name: verification", "ok SKILL.md requires no other skill", "ok maintain outcomes: clean changed blocked", "ok openai.yaml has allow_implicit_invocation", "ok README lists verification"; "verification structure (contract feature-map skill meta): 0 failure(s)" | result: pass | note: full run (all parts) after p1-6
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/verification/structure.sh | exit: 0 | output: "ok maintain outcomes: clean changed blocked", "verification structure (contract feature-map skill meta): 0 failure(s)" | result: pass | note: after p1-4-fix1
- 2026-11-03 TC-12 | type: feature | method: command | command: npm run eval:verification | exit: 0 | output: verification.maintain-scope-only-mapped pass; checks {newFeatureMapped, newFeatureIndexed, newFeatureDriven, unaffectedNotDriven, unaffectedNotEdited, productUnchanged, oneCommit} all true; "Evidence is in .verify-artifacts/20261103T110120Z-workspace/search/"; workspace keeps "Last full run: 20261101T100000Z-notes" | result: pass | note: suite run cauu-skill-eval.6AYJhG (4 passed), after p1-4-fix1
- 2026-11-03 TC-9 | type: feature | method: command | command: npm run eval:verification | exit: 0 | output: verification.create-proves-before-handover pass; checks {wrapperNamedVerifyApp, wrapperPointsToBody, contractCopiedVerbatim, featureMapShaped, lastRunRecorded, evidenceSurvivedCleanup, evidenceIgnored, toolCommitted, productUnchanged} all true; "A full test run passed and it's committed as d1594fb, with one gap: the Claude Code wrapper is missing" | result: pass | note: suite run cauu-skill-eval.6AYJhG; the sandbox blocked .claude/skills writes, the .agents wrapper was written
- 2026-11-03 TC-10 | type: feature | method: command | command: npm run eval:verification | exit: 0 | output: verification.create-unrunnable-stays-draft pass; checks {notHandedOverAsProven, noCommit, productUnchanged, namesBlocker} all true; "The verification tool for notes-api is written but is only a draft. I couldn't launch the app here, so I did not commit it." | result: pass | note: suite run cauu-skill-eval.6AYJhG
- 2026-11-03 TC-11 | type: feature | method: command | command: npm run eval:verification | exit: 0 | output: verification.maintain-reports-regression pass; checks {driftFixed, headerStillExpected, productUnchanged, onlyToolFilesChanged, oneCommit, reportsRegression, outcomeChanged} all true; "The outcome is changed: I fixed and committed the tool's docs (627e75b). The pass also found one product regression in export, which I did not touch." | result: pass | note: suite run cauu-skill-eval.6AYJhG, after the driftFixed scope change recorded in case-review.md
- 2026-11-04 TC-2 | type: feature | method: command | command: diff skills/engineering/verification/references/drive-contract.md /tmp/pilots/utxray-verify/docs/verification/utxray/drive-contract.md; ls /tmp/pilots/utxray-verify/.claude/skills/verify-*/SKILL.md /tmp/pilots/utxray-verify/.agents/skills/verify-*/SKILL.md | exit: diff 0, ls 1 | output: diff 无输出 (exit 0); ".agents/skills/verify-utxray/SKILL.md" 存在，内容 "Read docs/verification/utxray/README.md and follow it."; "no matches found: .claude/skills/verify-*/SKILL.md"; create 输出 permission_denials 含 Write "/private/tmp/pilots/utxray-verify/.claude/skills/verify-utxray/SKILL.md"; agent: "The Claude Code wrapper is missing: this session wasn't allowed to write under `.claude/`." | files: /tmp/pilots/verification-create.json | result: fail | note: contract 逐字一致，.agents 包装正确；.claude 包装因 Claude Code 的权限保护没有写出，后来全量 maintain 再试一次也被拒
- 2026-11-04 TC-3 | type: feature | method: command | command: 在 /tmp/pilots/utxray-verify 按产物执行 V=docs/verification/utxray/scripts/verify; V launch --run-id 20261104T010000Z-tc3-audit; V doctor --run-id ...; V drive --run-id ... cbor; V cleanup --run-id ... --dry-run; V cleanup --run-id ...; ls .verify-artifacts/20261104T010000Z-tc3-audit/cbor | exit: 0 (每一步) | output: launch "ok":true,"ready":true,"aiken_version":"aiken v1.1.10+b25afa2"; doctor "healthy":true, checks binary_unchanged/checked_out_build("HEAD bacbfd5, working tree unchanged since launch")/aiken/utxray_env/evidence_dir 都 ok; drive "cbor/decode-hex: exit=0 status=ok", "decode-file: exit=0 status=ok", "diff: exit=0 status=ok", "decode-invalid: exit=1 status=error"; decoded {"constructor":0,"fields":[{"bytes":"aabbccdd"},{"int":1000},{"int":5000000}]}; cleanup {"removed":[".../verify-utxray/20261104T010000Z-tc3-audit"],"evidence_exists":true}，scratch 目录随后 "No such file or directory"; 清理后证据目录仍有 decode-*.cmd/.stdout/.stderr/.exit、diff.*、summary.json 共 17 个文件; git check-ignore ".gitignore:2:.verify-artifacts/" | files: /tmp/pilots/utxray-verify/.verify-artifacts/20261104T010000Z-tc3-audit/cbor/ | result: pass | note: 产物首行 "Last full run: 20261104T004326Z-utxray-verify" 是真实运行，.verify-artifacts/20261104T004326Z-utxray-verify/ 下 5 个功能都有 summary.json；create 结束后 $TMPDIR/verify-utxray/ 为空
- 2026-11-04 TC-4 | type: feature | method: command | command: git worktree add --detach /tmp/pilots/utxray-verify-2 pilot/verification; 在两个 worktree 同时运行 /tmp/pilots/tc4-run.sh（默认 run-id，launch → doctor → drive build、tx-offline、cbor → cleanup） | exit: 0 | output: A 08:46:02.302–08:46:06.233, B 08:46:02.302–08:46:06.719（时间重叠）; run_id A "20261104T004602Z-utxray-verify", B "20261104T004602Z-utxray-verify-2"; scratch A ".../T/verify-utxray/20261104T004602Z-utxray-verify", B ".../T/verify-utxray/20261104T004602Z-utxray-verify-2"; evidence A "/private/tmp/pilots/utxray-verify/.verify-artifacts/...", B "/private/tmp/pilots/utxray-verify-2/.verify-artifacts/..."; 两边 doctor "healthy":true，三个功能所有步骤 exit/status 与清单一致; 两边 cleanup "evidence_exists":true; 之后两个 worktree 的 git status 都为空 | files: /tmp/pilots/tc4-A.log, /tmp/pilots/tc4-B.log | result: pass | note: CLI 不占端口；数据和证据目录都由 run-id 派生；scratch 已存在时 launch 拒绝运行（scripts/verify 第 129 行），同名 worktree 在同一秒启动会被拒，而不是共用目录
- 2026-11-04 TC-6 | type: feature | method: command | command: claude -p "... I just added a read-only `utxray cbor info --hex <hex>` subcommand ... Run maintain --scope for that change: crates/utxray-cli/src/commands/cbor.rs README.md ..."; git diff --name-only 2b10c16 7ce0861; ls .verify-artifacts/20261104T004811Z-utxray-verify-scope/; grep -n "cbor.rs" docs/verification/utxray/features/*.md | exit: 0 | output: 改动文件 "docs/verification/utxray/features/README.md", "features/cbor.md", "scripts/verify"; cbor.md 新增 "- `info`: reports byte length and top-level major type of inline hex.", "- `utxray cbor info --hex <hex>`", Source entry points 加 "`CborCommands::Info`, `CborInfoData`"; 索引行 "CLI (`cbor decode`, `cbor diff`, `cbor info`)"; 证据目录只有 "cbor"，其中 info.stdout {"status":"ok","byte_length":16,"major_type_name":"tag"} exit 0，info-empty.stdout {"status":"error","error":"empty hex input"} exit 1; build、test-diagnose、schema-validate 没有被驱动或修改; 但 "features/tx-offline.md:39:- `crates/utxray-cli/src/commands/cbor.rs`: `RedeemerIndexArgs` handler" 也匹配，tx-offline 没被驱动; agent: "`crates/utxray-cli/src/commands/cbor.rs` was already listed under the `cbor` feature, so `cbor` was the one affected feature." | files: /tmp/pilots/verification-maintain-scope.json, /tmp/pilots/utxray-verify/.verify-artifacts/20261104T004811Z-utxray-verify-scope/cbor/ | result: fail | note: 新入口写进了清单（归入 cbor 子功能），未受影响的功能没有被运行；按 skill 的路径规则，受影响的 tx-offline 没有被运行，报告里也没提
- 2026-11-04 TC-7 | type: feature | method: command | command: claude -p "... Run a full maintain on this project's verify tool ..."; git diff --stat f561e63 6ef6d49 -- crates tests README.md CHANGELOG.md Cargo.toml; git diff f561e63 6ef6d49 -- docs/verification/utxray/; jq . .verify-artifacts/20261104T005206Z-utxray-verify/schema-validate/unknown-validator.stdout | exit: 0 | output: agent: "The full maintain finished as **changed**. I committed the fixes to the verify-utxray tool as `6ef6d49`"; "`schema-validate` | **fail** on `unknown-validator` (product bug)"; "An unknown validator now returns `error_code: \"BLUEPRINT_NOT_FOUND\"` ... `test_schema_validate_validator_not_found` still expects `VALIDATOR_NOT_FOUND`"; 产品路径 diff --stat 无输出; scripts/verify "+ do_run \"$f\" decode-file \"$W\" cbor decode --input ./cbor/datum_simple.hex"; cbor.md "Step `decode-file`: `utxray cbor decode --input ./cbor/datum_simple.hex`"; schema-validate.md 仍为 "error_code: \"VALIDATOR_NOT_FOUND\"" 并加 "This is a product regression. Keep the expectation and report the step as a fail"; 证据 {"status":"error","error_code":"BLUEPRINT_NOT_FOUND","message":"Blueprint file not found: escrow.nope.spend"}; README 首行 "Last full run: 20261104T005206Z-utxray-verify"; 运行后 git status 为空，$TMPDIR/verify-utxray/ 为空 | files: /tmp/pilots/verification-maintain-full.json, /tmp/pilots/utxray-verify/.verify-artifacts/20261104T005206Z-utxray-verify/ | result: pass | note: 漂移在清单和脚本中都修了，结论为 changed；回归被报告，没有改文档去迁就；产品代码没动
- 2026-11-03 TC-1 | type: feature | method: command | command: tests/verification/structure.sh | exit: 0 | output: "verification structure (contract feature-map skill meta): 0 failure(s)" | result: pass | note: after p1-3-fix2; the behavior is observed in the create cases of the final eval run (see p1-4-fix2)

## 7. Change Requests (append-only)
