# verification skill：项目级验收工具

Spec-ID: S0001
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
- `docs/specs/draft/S0002-immutable-spec-upgrade.md`（通过标准、结论用词、收尾检查）
- pstack `skills/create-verification-skill/`、`skills/maintain-verification-skill/`、`docs/guide/06-verify-and-ship.md`

## 3. Execution Plan

- [ ] p1-1 调研 Claude Code、Codex、Cursor 项目级 skill 的发现路径，确定产物根目录（D1），把决策追加到 Execution Log
- [ ] p1-2 编写 `references/drive-contract.md`
- [ ] p1-3 编写 SKILL.md 的 create
- [ ] p1-4 编写 SKILL.md 的 maintain（局部和全量）
- [ ] p1-5 编写 `references/feature-map-example/`（含 `Source entry points`）
- [ ] p1-6 补充 `agents/openai.yaml`，更新 README 与工作流概览
- [ ] p2-1 试点 A：在一个 Web 或 CLI 项目上运行 create（项目待定）
- [ ] p2-2 试点 B：在一个 Aiken 项目上运行 create，与 `aiken-debug` 对照（项目待定）
- [ ] p2-3 局部更新试点：在试点 A 上做一次新增功能的改动，运行 `maintain --scope`
- [ ] p2-4 全量检查试点：在试点 A 上人为制造漂移和一个产品回归，运行 `maintain`

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/<skill>/`，写法为 `method: command: npm run eval:<skill>` 加用例 ID。下面写成自然语言的行为类 TC，在执行前用 case designer 转成用例，并由人审核。

- TC-1 frontmatter 合法，`name` 与目录名一致，所有引用文件都存在。
  method: command: 检查 frontmatter 和引用路径
- TC-2 SKILL.md 不要求安装其他 skill；生成的产物里包含 `drive-contract.md`。
  method: command: 检查引用；检查试点 A 的产物
- TC-3 试点 A 生成的 `verify-<app>` 被完整执行一次：启动、健康检查、驱动一个功能、采集证据、清理，并确认清理后证据还在。
  method: command: 按产物步骤执行，记录每一步的输出
- TC-4 在两个 worktree 中同时运行试点 A 的验证，互不冲突；或产物明确声明只能单实例运行。
  method: command: 两个 worktree 同时执行 TC-3
- TC-5 试点 B 达到 TC-3 的标准，或者在 `unreachable` 中写明具体的前置条件。
  method: command: 同 TC-3
- TC-6 局部更新：新功能被写进清单，受影响的功能被实际运行过，未受影响的功能没有被运行。
  method: command: 在试点 A 上运行 `maintain --scope`，检查清单的 diff 和运行记录
- TC-7 全量检查：人为制造的漂移被识别并修正，结论为 `changed`；人为制造的产品回归被报告，没有被改文档掩盖。
  method: command: 在试点 A 上运行 `maintain`
- 通过标准：全部 `pass`。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿曾被删除，随后恢复并缩小范围：证据门槛和结论用词移到 S0002；新增三个触发时机和 `maintain --scope`。依赖 S0002。
- 2026-11-03 草稿修订（按挑战结论）：证据行必须摘录关键输出，证据目录只作补充。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
