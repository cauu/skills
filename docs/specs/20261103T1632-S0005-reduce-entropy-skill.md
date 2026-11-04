# reduce-entropy skill

Spec-ID: S0005
Task-ID: (待建)
Change-Type: feature
Status: active
Created Time: 2026-11-03T13:55:00+08:00
Start Time: 2026-11-03T16:32:00+08:00
Completion Time:
Previous Spec-ID: S0002
Closure Reason:

## 1. Requirement Details

### Scope

新增可分发 skill `skills/engineering/reduce-entropy/`，用户定期手动触发。

1. 找熵源：近期提交、revert、review 评论中反复出现的错误（出现两次算一类）；死代码；只有一个调用方的包装层；多余的校验；只复述代码的注释。
2. 每个目标先固定行为（表征测试、快照或等价对比）。
3. 先删后改。API 改动时，调用方迁移和删除旧 API 在同一批完成，不留兼容层。
4. 读者负担没有降低的改动回滚。
5. 反复出现的错误按以下顺序选能解决问题的最高一层处理：架构消除 → 类型约束 → lint（报错信息写明正确做法）→ 测试 → 文档。每条新检查要证明它能拦住一个真实发生过的错误。
6. 小改动直接走 review；大改动建 Task，回到主流程。

### Constraints

- 独立安装。在 SKILL.md 中内联 refactor 门槛一句：改前固定行为，改后证明行为不变，类型检查和 lint 不算。由 S0002 的一致性检查确认与 `immutable-spec` 门槛表一致。
- 不改变行为。发现 bug 时拆出去，走 bug-fix。

### Non-goals

- 自动定时触发。

## 2. Outline Design

SKILL.md 分“扫描”和“处理”两段，输出熵源清单、每项处理层级和理由。

## References

- `docs/research/2026-11-03-pstack.md`
- pstack `poteto-mode/playbooks/refactoring.md`、`skills/correct/`、`skills/no-comments/`

## 3. Execution Plan

- [x] p1-1 编写 SKILL.md（内联 refactor 门槛） → TC-1, TC-2, TC-3, TC-4
- [x] p1-2 补充 `agents/openai.yaml`，更新 README → none (reason: 元数据和文档，不改变 agent 行为)
- [x] p1-3 用 case designer 设计 `evals/reduce-entropy/` 中 TC-1 至 TC-3 的用例，新增 `npm run eval:reduce-entropy`；**先经用户审核，再实际运行** → TC-1, TC-2, TC-3
- [x] p2-1 在一个真实项目上试运行一次（项目由用户之后指定） → TC-5, TC-6, TC-7
- [x] p1-1-fix1 SKILL.md：清单引用逐条核对；large 条目写成可提交的 Task 文件；重放证明逐字记录命令和输出（p2-1 试点审计发现） → TC-1, TC-2, TC-3, TC-4
- [x] p1-3-fix1 新增用例 `reduce-entropy.inventory-verifies-citations`（fixture `invoice-cli-misleading-sha`）→ TC-8

## 4. Test and Acceptance Criteria

行为类 TC（TC-1 至 TC-3）用 S0008 的 eval 用例验证，用例放在 `evals/reduce-entropy/`，由 p1-3 用 case designer 设计、用户审核后运行。规则类 TC 用脚本验证。TC-5 至 TC-7 在用户之后指定的真实项目上运行（p2-1），方法是对该项目执行的命令步骤。

- TC-1 eval 用例 `reduce-entropy.inventory-with-evidence`：fixture 中埋有死代码、只有一个调用方的包装层、多余的校验，以及在历史记录中出现两次的同类错误；用户只要清单。agent 输出熵源清单，每项有证据（提交、文件位置），没有改动任何文件。
  method: command: `npm run eval:reduce-entropy`（用例 `reduce-entropy.inventory-with-evidence`）
- TC-2 eval 用例 `reduce-entropy.pin-before-change`：让 agent 清理一个文件。包装层和死代码被删除；agent 留下的行为固定检查在改动前的代码上通过、在改动后的代码上也通过，并且能拦住对被重构代码的一处行为改动；CLI 对隐藏输入的输出与改动前一致（包括一个已知 bug 没有被顺手修掉）。
  method: command: 同 TC-1（用例 `reduce-entropy.pin-before-change`）
- TC-3 eval 用例 `reduce-entropy.repeated-mistake-to-check`：历史记录中同一类错误出现两次。agent 加入一条检查并接入项目已有的命令；当前代码上检查通过；重放历史上的那次错误后检查失败，报错信息写明正确做法；输出列出两次历史错误的提交。
  method: command: 同 TC-1（用例 `reduce-entropy.repeated-mistake-to-check`）
- TC-4 SKILL.md 内联的 refactor 门槛与 `immutable-spec` 的门槛块逐字一致；在副本上改动 reduce-entropy 的门槛句后，一致性检查报错。
  method: command: `scripts/check-skill-consistency.py`；`tests/consistency/run.sh`；把 `skills/` 复制到临时目录、改动 reduce-entropy 门槛块中的一个词后对副本运行 `scripts/check-skill-consistency.py <副本>`，期望退出码 1
- TC-5 真实项目试运行输出熵源清单，每项有证据（提交 SHA、文件位置）。
  method: command: 在用户指定的项目中按 skill 运行一次，取得清单后逐项执行 `git show <sha>` 或打开 `<file>:<line>`，确认证据存在且与描述相符
- TC-6 真实项目中每个合入的重构在改动前后都通过同一个行为固定检查。
  method: command: 对每个重构提交，把固定检查文件叠加到改动前的提交上运行一次（例如 `git worktree add /tmp/pin-before <sha>^` 后复制固定检查文件并运行项目测试命令），再在改动后的提交上运行一次，两次都退出 0
- TC-7 真实项目中至少一类重复错误被升级为类型、lint 或测试约束，并证明它能拦住历史上的一次错误。
  method: command: 在临时副本中重放历史错误（`git show <历史错误提交>` 中的错误写法），运行新检查，期望失败且报错写明正确做法；在当前代码上运行，期望通过
- TC-8 eval 用例 `reduce-entropy.inventory-verifies-citations`（2026-11-04 追加，来自 p2-1 试点缺陷 1）：导出的历史中，review 评论把重复错误归到只改了 README 的 c9d81f0。agent 不改动任何文件；清单表格中关于这类错误的行引用真正带入错误的提交（e41c0d2 或 7be0d44），不引用 c9d81f0。表格外的说明可以提到 c9d81f0。
  method: command: 同 TC-1（用例 `reduce-entropy.inventory-verifies-citations`）
- 通过标准：全部 `pass`。eval 用例的 `minPassRate` 在 `evals/reduce-entropy/case-review.md` 中说明。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿修订（按挑战结论）：refactor 门槛改为内联。
- 2026-11-03 草稿修订（激活前）：每条 TC 写明验证方式；行为类 TC 改为 eval 用例，新增 p1-3（用例设计，先审核再运行）；原试运行要求拆为 TC-5 至 TC-7，在用户之后指定的真实项目上执行；新增 TC-4（门槛一致性）；每个条目写明 TC 映射。
- 2026-11-03 并行交付：本 spec 在独立 worktree 分支中激活和交付，与 S0007、S0001、S0004 并行；main 上只合入已关闭的 spec。用户同意。
- 2026-11-03 gate A passed: requirements as discussed with the user in the planning session. Decided by: user.
- 2026-11-03 gate B passed: user approved activating and delivering S0005 ("按照这个顺序继续推进"). Decided by: user.
- 2026-11-03 激活。spec-lint --stage activate 通过，没有 manual TC。Task-ID 暂缺：Task-ID 规则在 S0009，本 spec 按现行 Spec-ID 规则执行。
- 2026-11-03 p1-1 started。
- 2026-11-03 p1-1 实现完成：`skills/engineering/reduce-entropy/SKILL.md`，用户触发（`disable-model-invocation: true`）。分扫描、逐项改动、把重复错误变成结构三段；refactor 门槛块逐字内联。参考 pstack refactoring playbook、`correct`、`no-comments`，按本仓库规则改写：不使用子 agent 和模型配置；大改动写成 Task 交回主流程；发现 bug 不修，固定现状并报告。
- 2026-11-03 p1-1 按当前状态 [~] 提交：TC-4 已通过；TC-1 至 TC-3 依赖 p1-3 的 eval 用例，用例须先经用户审核再运行，所以 p1-1 暂不标 [x]。提交是为了在并行 worktree 中保存可审阅的成果，不表示条目完成；用例运行通过后追加证据并标 [x]。
- 2026-11-03 p1-2 completed：`skills/engineering/reduce-entropy/agents/openai.yaml`（`allow_implicit_invocation: false`，与 code-review 一致）；README 在 User-invoked 下新增条目，并在目录结构中列出。条目映射为 none，不需要 TC 证据。`docs/ai-engineering-workflow-overview.md` 按要求未修改。
- 2026-11-03 p1-3 started。
- 2026-11-03 p1-3 用例设计完成：`evals/reduce-entropy/` 新增 3 个用例（`inventory-with-evidence`、`pin-before-change`、`repeated-mistake-to-check`），共用 fixture `invoice-cli`；`package.json` 新增 `eval:reduce-entropy`。eval hook 只做一次提交，历史改为 fixture 中导出的 `docs/git-log.txt` 和 `docs/review-notes.md`，理由见 case-review.md。不调用 agent 的检查已完成：fixture 检查、18 个模拟结果（3 个正确、15 个错误）全部按预期判定、泄漏检查、`promptfoo validate`。检查中发现并修正一处断言弱点（变异点从 pricing.js 移到包装层调用处）。等待用户审核，审核通过后再实际运行；未运行 `evals/run.sh`。
- 2026-11-03 p1-3 按当前状态 [~] 提交，理由同 p1-1：TC-1 至 TC-3 要等用例审核和实际运行。
- 2026-11-03 p1-3 用例审核：用户批准 reduce-entropy 的全部用例及 case-review 中列出的判断；接受 p1-1、p1-3 在进行中状态下提交。决定人：用户。
- 2026-11-03 第一次全量运行（`npm run eval:reduce-entropy`，Node 24.12.0）：3 个用例全部通过，退出码 0，耗时 3 分 37 秒，Claude Code 报告标价折算约 0.89 USD（0.21 + 0.43 + 0.25）。没有用例失败，skill 和用例都未修改；没有触到 40 轮上限。
- 2026-11-03 p1-3 completed：3 个用例（用户已审核）、断言、fixture 与 case-review.md；TC-1 至 TC-3 有通过证据。
- 2026-11-03 p1-1 completed：TC-1 至 TC-3 由第一次全量运行通过，TC-4 已通过；SKILL.md 自 TC-4 证据以来未改动，复跑 `check-skill-consistency.py`（ok: 4 gates, 8 skills）、`tests/consistency/run.sh`（0 failure(s)）、副本门槛变异（exit 1）结果相同；`tests/spec-lint/run.sh` 0 failure(s)。不需要修复条目。
- 2026-11-03 p2-1 用户批准试运行：项目 bubble-hub，只限 `server/`，在新分支上进行，不合并、不推送。决定人：用户。
- 2026-11-03 p2-1 started：`git -C bubble-hub worktree add /tmp/pilots/bubble-hub-reduce-entropy -b pilot/reduce-entropy dev`（dev 在 ed2b02d），Node 22.21.1、pnpm 10.29.2，`pnpm install --frozen-lockfile` 成功；主 checkout 未改动。
- 2026-11-03 p2-1 基线不通过，按约定停止，未运行 skill：`pnpm --dir server exec eslint "{src,test}/**/*.ts"`（不带 --fix）退出 1，49 个错误全部是 prettier/prettier，集中在 cardano 模块和 `rss-http.client.spec.ts`；`pnpm --dir server test` 退出 1，"Tests: 1 failed, 85 skipped, 609 passed, 695 total"，失败的是 `src/modules/cardano/cardano-persistence-style.spec.ts`（原始 SQL 白名单），实际多出 `services/cardano-single-pool-candidate.service.ts`（第 76 行 `this.dataSource.query(sql, params)`，来自 cf89f0c/7543aab），是 dev 上确定性的失败，与 worktree 路径无关；`pnpm --dir server build` 退出 0。TC-5 至 TC-7 没有运行，没有证据行。pilot 分支 `pilot/reduce-entropy` 没有新提交，worktree 保留。继续之前需要用户决定：先在 bubble-hub 修好基线（走 bubble-hub 自己的流程），或接受把这两项已知失败作为基线照常试运行，或换一个基线通过的项目。
- 2026-11-03 p2-1 用户选择方案 2（"按建议"）：把 dev 的红基线作为已知基线照常试点；TC-6 的验证方式按第 7 节 Change Request 修改。决定人：用户。
- 2026-11-03 p2-1 试运行：skill 复制到 pilot worktree 的 `.claude/skills/reduce-entropy/`（bubble-hub 的 `.gitignore` 第 51 行已忽略 `.claude`；worktree 的 `info/exclude` 在主仓库公共目录里，为不碰主 checkout 未写入）。在 `/tmp/pilots/bubble-hub-reduce-entropy` 用新的 headless Claude 运行 `claude -p "<约定任务文本>" --permission-mode acceptEdits --allowedTools "Bash,Read,Edit,Write,Glob,Grep,Skill" --output-format json`，21:16 至 21:29，退出 0，subtype success，58 轮，778.7 秒，total_cost_usd 2.76；一次运行，未重跑。输出：`/tmp/pilots/reduce-entropy-run.json`。
- 2026-11-03 p2-1 run 在 `pilot/reduce-entropy`（基于 ed2b02d）上的提交：5c2bd4c 固定 Cardano 客户端请求信号传递；46bc658 固定 pool-audit 输入拒绝顺序；8fdfe31 删除 `abort-signal.ts` 包装层，直接调用 `AbortSignal.any`；f80f42c 删除 `assertInputBounds` 中重复的 ADA 解析；6819d20 删除未使用的 `CARDANO_POOL_AUDIT_REASON_CODES`、`CARDANO_POOL_AUDIT_DATA_GAP_CODES`；1421401 在 `mcp-tool.catalog.spec.ts` 加检查：MCP 工具的输入 schema 必须显式给出 `required`，有默认值的字段不能列为必填。未合并、未推送。
- 2026-11-03 p2-1 审计中的发现：(1) 清单第 1 行（重复错误）第二次出现引用 a7a3546，但该提交没有 MCP catalog 改动；`claim_cardano_governance_documents` 及其 `limit ... .default(10)` 由 426efdc（同一 S0021 的 p1-3）加入，描述正确、SHA 错误。(2) 已有的原始 SQL 白名单违规（`cardano-persistence-style.spec.ts` 失败）没有进入熵源清单，run 只在"发现但未处理的 bug"中报告它是 ed2b02d 上已有的测试失败，是跑测试时看到的，不是扫描发现的。(3) b243c2e 的注释写明"so MCP clients do not treat a default-less string as required"，与第 1 行是同一类，run 把它归为"还不算一类"。(4) 清单第 8 行标为 large，但 run 没有写 Task，与 SKILL.md"large 写成 Task 交回"不一致。(5) 重放证明只写了结果，没有逐字记录命令。(6) headless 运行中 vercel 插件 hook 提示加载无关 skill，run 自行忽略。
- 2026-11-03 p2-1 结论：TC-6、TC-7 pass，TC-5 fail（1 个引用的 SHA 与描述不符），p2-1 保持 [~]。可能的修复：在 SKILL.md 扫描段要求写入清单前逐条打开所引用的 SHA 和 `file:line` 核对；是否修改 skill 并重跑试点，由用户决定。pilot 分支和 worktree 保留给用户审阅。
- 2026-11-04 p1-1-fix1 用户批准修复试点暴露的三个缺陷后重跑 eval（"ok 按照建议执行吧"）。决定人：用户。
- 2026-11-04 p1-1-fix1 started。
- 2026-11-04 p1-1-fix1 completed：SKILL.md 三处修改。(1) 扫描段：写入清单前对每个引用执行 `git show <sha>`、打开每个 `file:line`，确认与描述相符；同一功能或 PR 的其他提交不算，不符则更正或删除。(2) large 条目：写成用户可以提交的 Task 文件（项目用 immutable-spec 时为 `docs/specs/draft/` 下的 draft spec，否则为 `docs/tasks/<slug>.md`），提交到分支并在报告中列出路径；有 large 条目没有 Task 文件时，本次运行不算完成。(3) 重放证明：在报告中逐字记录重放方式（具体改动或恢复的 `git show <sha>:<file>`）、每条命令以及显示失败和通过的输出行；只有结果、没有命令的不算证明。报告段同步更新。refactor 门槛块未改动。现有 3 个用例都判定不了这三条新规则；为缺陷 1 提议新用例 `reduce-entropy.inventory-verifies-citations`，写在 case-review.md 中，未运行，等待用户审核。p2-1 和 bubble-hub 未动。
- 2026-11-04 p2-1 第二次试点获批（"ok 按照建议执行吧"），使用 p1-1-fix1 后的 skill（S0005 worktree 3df0821）。决定人：用户。
- 2026-11-04 p2-1 第二次试点准备：`git -C bubble-hub worktree add /tmp/pilots/bubble-hub-reduce-entropy-2 -b pilot/reduce-entropy-2 dev`，dev 仍在 ed2b02d；`pnpm install --frozen-lockfile` 成功。基线与已知基线一致：eslint（不带 --fix）"49 problems (49 errors, 0 warnings)"，错误集合与第一次基线逐条相同；test "Tests: 1 failed, 85 skipped, 609 passed, 695 total"，只有 `cardano-persistence-style.spec.ts` 失败；build 退出 0。第一次试点分支 `pilot/reduce-entropy`（1421401）和 worktree 未改动。
- 2026-11-04 p2-1 第二次运行：当前 skill 复制到 `.claude/skills/reduce-entropy/`（`diff -r` 与 S0005 worktree 一致，`.gitignore` 已忽略）；任务文本和参数与第一次相同，输出 `/tmp/pilots/reduce-entropy-run-2.json`；08:13 至 08:24，退出 0，subtype success，59 轮，646.9 秒，total_cost_usd 2.83；未重跑。提交（`pilot/reduce-entropy-2`）：147b925 固定 MCP 工具面（`listTools()` 和协议层 `tools/list` 快照、未知工具报错）；778f501 用一张定义表生成工具列表、分发和注册（mcp-tool.catalog.ts +94/-233）；ed4593e 通过 HTTP 固定 Admin MCP Test 路由；cff0d7c 删除 `McpTestService`，控制器直接调用 catalog；4372f0c 删除 9 个没有引用的 Cardano/Telegram 导出；d75281e 在 `mcp-tool.surface.spec.ts` 加检查：协议层每个工具的输入 schema 必须有显式 `required`，删除 `mcp.gateway.spec.ts` 中只覆盖 `search` 的旧断言。未合并、未推送。
- 2026-11-04 p2-1 三处修复的检查：(a) 引用核对：清单 7 行，第 1 至 6 行的引用（7 个 SHA、约 15 处 file:line、9 个无引用名称、规格第 647 行）逐条打开，0 处不符；第 7 行（注释）本次没有扫描，没有引用。(b) Task 文件：没有条目标为 large，所以不需要 Task 文件，run 也没有写；第一次标为 large 的 catalog 重复声明这次判为 small 并完成（一个文件、不改对外接口、有快照固定）。(c) 重放：报告逐字写出恢复的写法（`.strict();`，去掉 `.meta({ required: [] })`）、命令 `npx jest --ci src/modules/mcp/mcp-tool.surface.spec.ts -t "explicit required"` 和失败输出，transcript 证实确实运行过；通过的输出只写了缩略形式（"✓ ... 1 passed"）。
- 2026-11-04 p2-1 与第一次比较：相同的有 MCP 输入 schema 可选性这一类（daef627）、9 个死代码名称、`McpTestService` 转发层、catalog 重复声明；第二次出现由引错的 a7a3546 改为 b243c2e（引用正确，但 run 自己说明新检查拦不住 b243c2e 那种错误）；新增"严格的 Koios schema 拒绝真实上游数据"一类（ed1e53a、f02571f，未处理）和约 80 个只在本文件使用的导出；不再列 `abort-signal.ts` 和 `assertInputBounds`；新检查改为读协议层 `tools/list`（第一次读的是 `listTools()`），并报告 Admin 页与协议层的 schema 不一致（claim 的 `limit`，未核实）。原始 SQL 白名单违规仍然没有进入清单，只作为已有失败报告，这次写明了来源 cf89f0c（已核实：该提交新建 `cardano-single-pool-candidate.service.ts`，第 76 行 `this.dataSource.query(sql, params)`，白名单没有它）。
- 2026-11-04 p2-1 completed：TC-5、TC-6（按 2026-11-03 Change Request）、TC-7 均 pass。两个试点分支和 worktree 保留给用户审阅；spec 未关闭。
- 2026-11-04 新用例审核：用户批准 reduce-entropy.inventory-verifies-citations（只检查清单表格行）。决定人：用户。
- 2026-11-04 p1-3-fix1 started：按 immutable-spec "Bug Fixes Before Spec Closure" 追加计划条目 p1-3-fix1 和 TC-8（第 4 节只追加新条目，不改动原有内容）。fixture `invoice-cli-misleading-sha` 复制自 `invoice-cli`，只改了导出历史：新增只改 README 的提交 c9d81f0；PR #12 列出 e41c0d2 和 c9d81f0；PR #14 的评论写"came in with c9d81f0"。不调用 agent 的检查：fixture 检查（c9d81f0 只改 README.md、不含 toISOString；e41c0d2 带入错误写法；`npm test` 退出 0），7 个模拟结果（2 个正确、5 个错误）全部按预期判定，泄漏检查无命中，`promptfoo validate` 通过。
- 2026-11-04 新用例单独运行（`--filter-pattern "reviewer blamed"`）：通过，46 秒，约 0.23 USD。随后全量运行一次：4 个用例全部通过，退出码 0，4 分 48 秒，约 1.18 USD（0.23 + 0.45 + 0.27 + 0.23）。没有失败，skill、用例和断言都未修改。
- 2026-11-04 p1-3-fix1 completed：新用例、fixture、断言与 case-review.md；TC-8 有通过证据，TC-1 至 TC-3、TC-8 的最新证据来自同一次全量运行。

## 6. Validation Evidence (append-only)

- 2026-11-03 TC-4 | type: feature | method: command | command: scripts/check-skill-consistency.py; tests/consistency/run.sh; copy skills/ to a temp dir, sed 'Pin before changing code.' to 'Pin when convenient.' in reduce-entropy/SKILL.md, run scripts/check-skill-consistency.py <copy> | exit: 0; 0; 1 | output: "ok: 4 gates in immutable-spec, 8 skills checked"; "consistency mutations: 0 failure(s)"; on the mutated copy "error: skills/engineering/reduce-entropy/SKILL.md: gate 'refactor' differs from immutable-spec" | result: pass | note: 8 skills now includes reduce-entropy, the first real skill that inlines a gate
- 2026-11-03 TC-1 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.inventory-with-evidence pass; checks {workspaceUnchanged, noNewCommit, namesDeadCode, namesWrapper, namesRedundantValidator, givesFileLocation, citesFirstOccurrence, citesSecondOccurrence} all true; "I didn't change anything." inventory rows: repeated mistake "introduced in 91b2e6a, fixed in a3f9c21 ... e41c0d2 ... fixed in 7be0d44", "`src/report.js:19-21` `formatRowLegacy`", "`getLineTotal` ... collapse", "`assertValidLine` ... Repeats the checks in `src/orders.js:11-16`" | result: pass | note: suite run 2026-11-03 (cauu-skill-eval.lf3mwA), first run after approval, 3/3 passed
- 2026-11-03 TC-2 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.pin-before-change pass; checks {wrapperGone, deadCodeGone, behaviorUnchanged, pinAdded, pinPassesOnOriginal, pinPassesOnResult, pinCatchesChangeAtWrapperCall, committed} all true; "Before touching the code I added `test/report.test.js` (commit cd37716) ... It passed on the original code, and the same unedited test passed after every commit"; "I found a bug and left it alone. The `TOTAL` line skips the first order" | result: pass | note: suite run 2026-11-03 (cauu-skill-eval.lf3mwA); 6 commits on branch reduce-entropy/report
- 2026-11-03 TC-3 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.repeated-mistake-to-check pass; checks {checksPassOnResult, replayedMistakeFails, failureNamesFix, citesFirstOccurrence, citesSecondOccurrence} all true; agent added test/no-utc-day.test.js run by npm test; "I put back the `src/export.js` from `e41c0d2` and ran `npm test`. It failed with 'toISOString() gives the UTC day, not the local one. Use formatLocalDate from src/dates.js instead:'"; once-seen typo 5d18b7e "doesn't count as a repeat" | result: pass | note: suite run 2026-11-03 (cauu-skill-eval.lf3mwA)
- 2026-11-03 TC-5 | type: feature | method: command | command: for each inventory row of the bubble-hub pilot run, `git show <sha>` / `git show ed2b02d:<file>` and `git grep -n -w <name> ed2b02d -- .` | exit: 0 | output: rows 2-8 match: `abort-signal.ts` only wraps `AbortSignal.any` (fallback unreachable, engines ">=22.13.0 <23", Dockerfile node:22.21.1); `assertInputBounds` ends with `parseCanonicalAdaToLovelace(input.lowStakeAda); parseCanonicalAdaToLovelace(input.highStakeAda);` and caller line 109-110 parses again; `CARDANO_POOL_AUDIT_REASON_CODES` types.ts:96 and `..._DATA_GAP_CODES` :108, `compareLovelace`, `TelegramJoinedChannelView`, `cardanoStakePoolMetadataV1Schema`, `KoiosPool{List,Info,History}`, `CardanoGovernanceActionType` each "1 refs" (definition only); `McpTestService` both methods forward to catalog; catalog `listTools()` :345 and `createServer()` :407 declare tools twice, `this.tools[0].description` :415. Row 1: daef627 matches ("discovered JSON Schema omitted the top-level `required` keyword", adds `.meta({ required: [] })`); a7a3546 does not (no change to mcp-tool.catalog.ts; the claim schema with `limit ... .default(10)` came in 426efdc). Row 9 cites nothing (no finding). | files: /tmp/pilots/reduce-entropy-run.json | result: fail | note: 8 rows with evidence, 7 fully match, 1 cites a wrong commit (description correct). The existing raw-SQL allowlist violation was not in the inventory; it was reported only as a pre-existing failing test
- 2026-11-03 TC-6 | type: feature | method: command | command: per Change Request 2026-11-03: detached scratch worktree, run each pin file alone with `pnpm --dir server exec jest --runInBand --no-watchman <pin files>` at the refactor commit's parent and at the commit (plus the new pins overlaid on ed2b02d); `git diff <sha>^ <sha> -- <pin files>`; full `pnpm --dir server test` and `pnpm --dir server exec eslint "{src,test}/**/*.ts"` at 1421401 compared with baseline logs | exit: all pin runs 0; test 1 (baseline 1); lint 1 (baseline 1) | output: 8fdfe31 (pin 5c2bd4c: http-cardano-metadata/koios client specs) original/before/after "Tests: 44 passed, 44 total"; f80f42c (pin 46bc658: cardano-stake-pool-audit.service.spec.ts) "15 passed, 15 total" x3; 6819d20 (existing audit service spec + mcp-tool.catalog.spec.ts) before/after "30 passed, 30 total"; pin files not edited in any refactor commit; mutation dropping `signal` from `AbortSignal.any([...])` in both clients -> "Tests: 3 failed, 41 passed, 44 total"; full suite after "Tests: 1 failed, 85 skipped, 618 passed, 704 total" (baseline "1 failed, 85 skipped, 609 passed, 695 total"), only failure `cardano-persistence-style.spec.ts` in both; lint "49 problems (49 errors, 0 warnings)" in both, error sets identical ignoring line numbers; build exit 0 before and after | files: /tmp/pilots/logs/ | result: pass | note: refactor commits 8fdfe31, f80f42c, 6819d20; 6819d20 pinned by existing specs
- 2026-11-03 TC-7 | type: feature | method: command | command: scratch worktree at 1421401: `pnpm --dir server exec jest --runInBand --no-watchman src/modules/mcp/mcp-tool.catalog.spec.ts -t "advertises every input field"`; then replay daef627's mistake by removing `.meta({ required: [] })` from `searchInputSchema` and rerun | exit: 0; 1 | output: current code "✓ advertises every input field the runtime defaults or omits as optional", "Tests: 15 skipped, 1 passed, 16 total"; replay "✕ advertises every input field ...", "search: input schema omits \"required\"; MCP clients then guess which fields to fill. Declare it explicitly with .meta({ required: [...] }) on the Zod input schema.", "Tests: 1 failed, 15 skipped, 16 total" | result: pass | note: test-level check run by `pnpm test`; the live claim `limit` violation is an allowlisted known exception reported for bug-fix; the check reads `listTools()`, not the SDK's wire schema from `createServer()`
- 2026-11-04 TC-4 | type: feature | method: command | command: scripts/check-skill-consistency.py; tests/consistency/run.sh; copy skills/ to a temp dir, sed 'Pin before changing code.' to 'Pin when convenient.' in reduce-entropy/SKILL.md, run scripts/check-skill-consistency.py <copy> | exit: 0; 0; 1 | output: "ok: 4 gates in immutable-spec, 8 skills checked"; "consistency mutations: 0 failure(s)"; mutated copy "error: skills/engineering/reduce-entropy/SKILL.md: gate 'refactor' differs from immutable-spec" | result: pass | note: after p1-1-fix1
- 2026-11-04 TC-1 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.inventory-with-evidence pass, all 8 checks true; "The commit IDs below can't be checked with `git show` because that history isn't in Git. I checked each one against the diffs in `docs/git-log.txt` ... and opened every `file:line` in the current code." | result: pass | note: suite run 2026-11-04 (cauu-skill-eval.4JnRfg) after p1-1-fix1, 3/3 passed
- 2026-11-04 TC-2 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.pin-before-change pass, all 8 checks true; "I first added `test/report.test.js` (d15d1a3) ... It passed 2 of 2 on the original code and still passed 2 of 2, unedited, after every commit below."; grand-total bug reported and left alone | result: pass | note: suite run 2026-11-04 (cauu-skill-eval.4JnRfg)
- 2026-11-04 TC-3 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.repeated-mistake-to-check pass, all 5 checks true; "First replay: I put back the two lines from e41c0d2 (`git-log.txt:54,58`) with `sed` on `src/export.js` ... The test failed with `✖ no calendar day cut from toISOString()` and listed `src/export.js:5` and `src/export.js:9`"; "After `git checkout` of both files: `pass 2`, `fail 0`." | result: pass | note: suite run 2026-11-04 (cauu-skill-eval.4JnRfg); replay steps described, but the exact sed command was not quoted
- 2026-11-04 TC-5 | type: feature | method: command | command: for every citation in run 2's inventory (transcript of session e2bd4587): `git show <sha>`, `git show ed2b02d:<file> | sed -n <lines>p`, `git grep -n -w <name> ed2b02d -- .` | exit: 0 | output: row 1: catalog.ts:61 ".meta({ required: [] });", single-pool schemas.ts:49-62 "null so MCP clients do not treat a default-less string as required" and :111 ".meta({ required: [] })", daef627 spec "discovered JSON Schema omitted the top-level `required` keyword", b243c2e spec line 647 "MCP clients treated the default-less `cursor` string as required"; row 2: :207 `this.tools = Object.freeze([`, :349-365 if-chain over 9 tools, :407 `createServer()`, :415 `this.tools[0].description`, :692 `toolMeta`; row 3: `McpTestService` used only by mcp-test.controller.ts (plus module and its own spec), 3752386 adds `ADMIN_TEST_TOOL_NAMES`, 088b654 removes it; row 4: all 9 names "1 refs" at the cited lines; row 5: ed1e53a `total_rewards: nullableDecimalIntegerSchema`, f02571f drops `.min(1)` on page lists and adds `unknownKeys`; row 6: koiosTipSchema, RssHttpRequest, MAX_PODCAST_ENTRIES each exported and used only in their own file | files: /tmp/pilots/reduce-entropy-run-2.json | result: pass | note: 0 mismatches over ~27 citations; row 7 (restating comments) not scanned and cites nothing; "about 80" exports count not checked; the raw-SQL allowlist violation is again not an inventory row (reported as a pre-existing failure from cf89f0c)
- 2026-11-04 TC-6 | type: feature | method: command | command: per Change Request 2026-11-03: detached scratch worktree, `pnpm exec jest --ci --runInBand --no-watchman <pin files>` at each refactor commit's parent and at the commit (new pins also overlaid on ed2b02d); `git diff <sha>^ <sha> -- <pin files>`; full `pnpm --dir server test` and `pnpm --dir server exec eslint "{src,test}/**/*.ts"` at d75281e compared with the baseline | exit: all pin runs 0; test 1 (baseline 1); lint 1 (baseline 1) | output: 778f501 (pin 147b925 mcp-tool.surface.spec.ts + snapshot) original/before/after "Tests: 3 passed, 3 total Snapshots: 2 passed, 2 total", with mcp-tool.catalog.spec.ts and mcp.gateway.spec.ts "22 passed, 22 total" before/after, swapping one `call:` handler -> "1 failed, 21 passed"; cff0d7c (pin ed4593e mcp-test.controller.spec.ts) original/before/after "7 passed, 7 total"; 4372f0c (cardano + telegram-account suites, 36 files, known-baseline cardano-persistence-style.spec.ts excluded) before/after "27 skipped, 307 passed, 334 total", including it "1 failed, 27 skipped, 307 passed" both; pin files not edited in any refactor commit; full suite after "Tests: 1 failed, 85 skipped, 610 passed, 696 total", only failure cardano-persistence-style.spec.ts; lint "49 problems (49 errors, 0 warnings)", set identical to baseline; build exit 0 | files: /tmp/pilots/logs2/ | result: pass | note: refactor commits 778f501, cff0d7c, 4372f0c
- 2026-11-04 TC-7 | type: feature | method: command | command: scratch worktree at d75281e: `pnpm exec jest --ci --runInBand --no-watchman src/modules/mcp/mcp-tool.surface.spec.ts -t "explicit required"`; then replay daef627 by changing `searchInputSchema`'s ending from `.strict()` + `.meta({ required: [] });` to `.strict();` and rerun | exit: 0; 1 | output: current "✓ declares an explicit required list for every tool input on the wire", "Tests: 3 skipped, 1 passed, 4 total"; replay "✕ declares an explicit required list ...", "MCP tools/list inputSchema has no \"required\" for: search. MCP clients then fill optional fields with placeholders. Add .meta({ required: [...] }) to the tool's z.object input schema, listing only fields callers must send (see searchInputSchema).", "Tests: 1 failed, 3 skipped, 4 total" | result: pass | note: test-level check run by `pnpm test`, reads the wire `tools/list`; the run states it would not catch b243c2e
- 2026-11-04 TC-8 | type: feature | method: command | command: evals/run.sh reduce-entropy --filter-pattern "reviewer blamed" | exit: 0 | output: reduce-entropy.inventory-verifies-citations pass; checks {workspaceUnchanged, noNewCommit, listsRepeatedMistake, citesRealSecondOccurrence, tableDoesNotCiteTrapCommit} all true; "The review comment at `review-notes.md:17` says the UTC-day bug 'came in with c9d81f0'. That's wrong: c9d81f0 only changes the README (git-log.txt:44–55). The commit that brought it in is **e41c0d2** ... The table uses e41c0d2." | result: pass | note: new case alone, cauu-skill-eval.GWhe0F
- 2026-11-04 TC-1 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: "4 passed (100%)"; reduce-entropy.inventory-with-evidence pass, all 8 checks true; "`git show a3f9c21` returns `unknown revision`. So I checked every SHA below against the diffs in `docs/git-log.txt` ... I opened every `file:line` and confirmed it shows what the entry says." | result: pass | note: full suite, one run, cauu-skill-eval.6kN644
- 2026-11-04 TC-2 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.pin-before-change pass, all 8 checks true; "it went from 45 lines and 4 functions to 24 lines and 1 function, with the same output ... I also found a bug that I left alone, because the skill says cleanup must not change behavior." | result: pass | note: full suite, one run, cauu-skill-eval.6kN644
- 2026-11-04 TC-3 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.repeated-mistake-to-check pass, all 5 checks true; "I put back the `91b2e6a` line at `src/report.js:35`. `npm test` reported `ℹ fail 1` and listed `src/report.js:35`. After `git checkout src/report.js`: `ℹ pass 2`, `ℹ fail 0`." | result: pass | note: full suite, one run, cauu-skill-eval.6kN644
- 2026-11-04 TC-8 | type: feature | method: command | command: npm run eval:reduce-entropy | exit: 0 | output: reduce-entropy.inventory-verifies-citations pass, all 5 checks true; "PR #14's review says the bug 'came in with c9d81f0'. That commit only edits the README (`docs: document --csv`). The `toISOString` lines came in with **`e41c0d2`** ... The table above uses `e41c0d2`." | result: pass | note: full suite, one run, cauu-skill-eval.6kN644

## 7. Change Requests (append-only)

- 2026-11-03 p2-1 试点项目 bubble-hub 的 dev 分支基线不干净（1 个测试失败：cardano-persistence-style.spec.ts；49 个 prettier lint 错误）。用户同意把它们作为已知基线照常试点。TC-6 的验证方式改为：每个重构对应的行为固定检查测试文件在改动前、改动后都通过（单独运行该测试文件），并且整套测试、lint 与基线相比没有新增失败；TC-5、TC-7 不变。决定人：用户。
