# skill 验收基础：用 Claude 跑 skill 行为用例

Spec-ID: S0008
Task-ID: (待建)
Change-Type: feature
Status: completed
Created Time: 2026-11-03T16:00:00+08:00
Start Time: 2026-11-03T14:42:15+08:00
Completion Time: 2026-11-03T15:18:23+08:00
Previous Spec-ID:
Closure Reason: delivered

## 1. Requirement Details

### Background

本仓库交付的是 skill，也就是写给 agent 的指令。验收一个 skill，就是验收“agent 读了它之后会不会照做”。目前仓库没有办法验证这一点，所以其他 spec 中描述 agent 行为的 TC 都没法执行，和 S0002 “每条 TC 都要可执行”的要求矛盾。

`pao-skills` 仓库已有可用的方案（见 References）。本 spec 移植它的最小部分，并把被测 agent 换成 Claude。

### Scope

1. 固定 Promptfoo 版本，使用 `anthropic:claude-agent-sdk` provider 启动一个全新的 Claude agent。
2. 每次运行新建一个临时 git 工作区，把待测 skill 放进 `.claude/skills/<name>/`。运行结束后丢弃，不修改真实仓库。
3. 用例放在仓库顶层的 `evals/<skill>/`，测试数据放在 `evals/<skill>/fixtures/`。不能放在 skill 目录里，因为 skills.sh 会把整个 skill 目录安装到用户机器上。
4. 采用 pao-skills 的用例格式。每个用例有固定的 `metadata.caseId`，并写明 `behavior`、`regressionRisk`、`knownOmissions`、`repeat`、`minPassRate`。
5. 移植 `skill-eval-case-designer`，作为本仓库内部使用的 skill（放在 `.claude/skills/`，不对外分发）。
6. 用 `immutable-spec` 的一个现有行为跑通一个真实用例。
7. 在 README 中写明运行命令和证据边界：本次运行证明了什么、没有证明什么。

### Constraints

- Promptfoo 负责启动 agent、执行断言、重复运行和保存结果。仓库只写一层很薄的胶水代码，不自己造运行器或断言框架。
- 预期值和断言不能出现在 agent 能读到的提示词或测试数据中。
- 只检查能观察到的结果：最终输出、文件、git 状态。优先用确定性断言；只有确定性断言做不到时才用 LLM 评委，并在 `case-review.md` 中注明。
- 被测 agent 不继承本机的环境变量、用户级设置和其他 skill。只加载待测 skill，关闭网络。
- 超时有上限。凭证缺失或运行环境不可用时，要明确报错，不能判为通过。
- 本 spec 只提供本地验收能力，不做 CI 检查，也不作为发布的强制关口。
- 用例一旦改动，要在 `case-review.md` 中说明意图变化，不能悄悄降低标准。

### Non-goals

- 和发布版本或 `main` 分支版本做对比（pao-skills 的 S0002 部分）。
- 测试 agent 能否自动选中 skill。用例显式指定 skill，只证明“agent 照做”。
- 测试 Codex 等其他 harness。
- 在 CI 中运行。

## 2. Outline Design

```text
evals/
├── README.md                      运行命令、证据边界
├── run.sh                         新建临时工作区 → 复制 skill → 调用 promptfoo
└── <skill>/
    ├── promptfooconfig.yaml       provider、提示词、用例
    ├── case-review.md             用例审核记录（待人批准）
    └── fixtures/                  初始文件，复制进临时工作区
.claude/skills/skill-eval-case-designer/SKILL.md
package.json                       固定 promptfoo 版本，提供 eval:<skill> 脚本
```

provider 配置在 p1-1 中确认：
- 认证：`ANTHROPIC_API_KEY`，或者 `apiKeyRequired: false` 搭配本机的 Claude 登录。
- 模型名：0.122.0 内置的模型列表只到 `claude-opus-5` 和 `sonnet-5`。`claude-opus-5-5` 可能需要用别名，或者升级 Promptfoo。
- 写权限：只设置 `working_dir` 时只有只读工具，需要通过 `append_allowed_tools` 或 `permission_mode` 开放写入。
- skill 加载：通过 `setting_sources: [project]` 让 agent 发现 `.claude/skills/`，同时不加载用户级设置。
- 隔离：用 `sandbox` 关闭网络；`env` 只传入必需的变量。

第一个用例（p1-4）：
- `immutable-spec.no-commit-without-evidence`：临时工作区里有一份 active spec，其中一个条目已经实现，但没有验证证据。要求 agent 推进这个条目。
- 断言：git 中没有新增提交；该条目没有被标为 `[x]`；输出中说明缺少证据。
- 这是 `immutable-spec` 现有的规则（“Do not mark `[x]` based on implementation alone”），所以可以在 S0002 动手之前先验证基础设施。

风险：
- Claude agent 的行为不稳定，同一个用例有时通过有时失败。缓解：对行为确实不稳定的用例使用 `repeat` 和 `minPassRate`，并在审核记录中写明理由。
- 运行成本较高。缓解：运行器每次只跑指定的 skill。

回滚：新增的都是新文件，删除即可。

## References

- `~/Dev/projects/bubble-studio/pao-skills`：`README.md` 中的 Skill evaluation 一节，`docs/specs/completed/20260809T2311-S0001-skill-evaluation.md`，`docs/specs/completed/20260810T1209-S0002-skill-eval-design-and-release-comparison.md`，`.agents/skills/skill-eval-case-designer/SKILL.md`，`skills/agent-task/evals/`
- Promptfoo 0.122.0 `anthropic:claude-agent-sdk` provider（`dist/src/claude-agent-sdk-*.cjs`）
- `docs/research/2026-11-03-pstack.md`

## 3. Execution Plan

- [x] p1-1 小范围试验：确认认证方式、模型名、写权限、只加载项目 skill、关闭网络这五项能否满足；再确认 skills.sh 不会把 `.claude/skills/skill-eval-case-designer` 当作可安装的 skill 列出（会的话改放到其他目录）。结论追加到 Execution Log。任何一项无法满足时停下来，报告给用户
- [x] p1-2 `package.json` 固定 Promptfoo 版本；编写 `evals/run.sh`
- [x] p1-3 移植 `skill-eval-case-designer` 到 `.claude/skills/`，改成 Claude 和 `evals/<skill>/` 的写法
- [x] p1-4 用 case designer 设计 `immutable-spec.no-commit-without-evidence`，人工审核后实际运行
- [x] p1-5 编写 `evals/README.md`：运行命令、证据边界、成本

## 4. Test and Acceptance Criteria

- TC-1 `npm run eval:immutable-spec` 启动一个全新的 Claude agent，在临时工作区中运行，真实仓库的 `git status` 运行前后不变。
  method: command: 运行前后各执行一次 `git status --porcelain`，对比两次输出
- TC-2 第一个用例通过，Promptfoo 的 JSON 结果中，断言通过数等于断言总数。
  method: command: `npm run eval:immutable-spec -- --output <tmp>/result.json`
- TC-3 断言能区分对错：把 fixture 换成一份带有验证证据的 spec（这时应当提交），同一套断言失败。
  method: command: 用对照 fixture 运行一次
- TC-4 断言和预期值不出现在 agent 可读的提示词和 fixture 中。
  method: command: 用 grep 在提示词和 fixtures 中检查断言里的关键字
- TC-5 缺少凭证时，命令以非零退出码报错，不会判为通过。
  method: command: 不设置凭证运行一次
- TC-6 `skills/` 下没有任何 `evals/` 目录，用户通过 skills.sh 安装时不会装到用例。
  method: command: `find skills -type d -name evals`
- TC-7 `evals/README.md` 写明了这次运行证明了什么、没有证明什么。
  method: command: 检查文件中是否有证据边界一节
- 通过标准：全部 `pass`。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。被测 agent 使用 Claude（用户决定）。
- 2026-11-03 关口 B 通过：用户批准激活并执行。决定人：用户。认证方式：本机 Claude 登录；用户接受运行成本。
- 2026-11-03 激活。Task-ID 暂缺：Task-ID 标识规则尚未落地（S0002 范围），本 spec 按现行 Spec-ID 规则执行。

- 2026-11-03 p1-1 started：在 `/tmp/s0008-spike` 中用一个临时 probe skill 试验。
- 2026-11-03 p1-1 结论（6 项全部满足）：
  - 认证：`apiKeyRequired: false`，在不设置 `ANTHROPIC_API_KEY` 的情况下使用本机 Claude 登录，可以调用。
  - 模型：Promptfoo 0.122.0 依赖的 claude-agent-sdk 0.3.220 自带 Claude Code 2.1.220，调用 `claude-opus-5-5` 时 API 返回 400（要求 2.1.280 及以上）。设置 `path_to_claude_code_executable` 指向本机 Claude Code 2.1.317 后调用成功；结果中 `modelUsage` 记录为 `claude-opus-5-5`。Promptfoo 会提示 unknown model，属于正常现象。单次运行约 0.15 美元。
  - 写权限：`permission_mode: acceptEdits` 加 `append_allowed_tools: [Write, Edit, Bash]`，agent 成功写入文件。
  - 只加载项目 skill：`setting_sources: [project]` 加 `skills: [probe]`，agent 列出的可用 skill 只有 `probe`。
  - 网络：`sandbox.enabled` 加 `network.allowedDomains: []`，`curl https://example.com` 被沙箱代理拒绝（403，exit=56）。
  - 环境变量：provider 会把父进程的全部环境变量传给 agent。用 `env -i` 只放行 PATH、HOME、USER、TMPDIR、LANG 和 PROMPTFOO_* 后，父进程中设置的 `FOO_SECRET` 在 agent 中为 unset，本机登录仍然可用。
  - skills.sh：1.7.6 会扫描 `.claude/skills/`。frontmatter 中设置 `metadata.internal: true` 后，`skills add <repo> --list` 不再列出该 skill（本地测试仓库验证）。
- 2026-11-03 p1-1 带来的设计决定（在 Scope 范围内，属于实现细节）：
  - 运行环境使用 Node 24（Promptfoo 0.122.0 要求 Node 22.22.0 及以上；本机默认 22.21.1，已安装的 24.12.0 满足要求）。`evals/run.sh` 中检查 Node 版本。
  - provider 配置 `path_to_claude_code_executable`，由 `run.sh` 通过 `command -v claude` 解析，不写死路径。
  - `run.sh` 用 `env -i` 加放行列表启动 Promptfoo。
  - 读取文件的断言写成独立的 `.js` 文件，通过 `file://` 引用（内联 JS 断言中不能使用 `require`）。
  - `skill-eval-case-designer` 放在 `.claude/skills/`，frontmatter 中设置 `metadata.internal: true`。
- 2026-11-03 p1-1 completed：无对应 TC；试验结论记录在上面的日志中。
- 2026-11-03 更正：头部的 Created Time（16:00）晚于 Start Time（14:42），是起草时写错了。实际创建时间早于 14:42。按只追加规则不修改头部，在此记录。

- 2026-11-03 p1-2 started.
- 2026-11-03 p1-2 completed: `package.json` pins promptfoo 0.122.0 (engines node>=22.22.0) with `package-lock.json`; `evals/run.sh` checks the suite, the skill, the Node version, promptfoo and `claude`, creates a disposable root, and starts promptfoo under `env -i` with an allowlist; `evals/lib/claude-provider.yaml` holds the shared provider; `evals/lib/hooks.cjs` rebuilds the workspace from `vars.fixture` before each test; `evals/lib/workspace.cjs` provides read-only assertion helpers. `EVAL_SUITE` selects an alternate suite file. `.gitignore` adds `node_modules/`.

- 2026-11-03 p1-3 started.
- 2026-11-03 p1-3 completed: ported `skill-eval-case-designer` to `.claude/skills/` with `metadata.internal: true`; adapted to repo-level `evals/<skill>/`, per-test fixtures, `file://` `.cjs` assertions, contrast fixtures, and Claude. `npx skills add <this repo> --list` (skills 1.7.6) lists 7 skills: challenge, code-review, codebase-design, codebase-map, immutable-spec, immutable-spec-orca, tdd. The designer is not listed. No TC maps to this item.

- 2026-11-03 p1-4 started.
- 2026-11-03 p1-4 completed: case `immutable-spec.no-commit-without-evidence` (fixture `evidence-blocked`) and contrast suite `contrast.yaml` (fixture `evidence-available`), assertion `assert/no-done-without-evidence.cjs`, review notes `case-review.md`. During the work the contrast YAML had unquoted colons (fixed), and the fixture word "commit" in the rollback line was reworded to "change" after the leak check flagged it; TC-2 and TC-3 were rerun on the final fixtures. Case approval is pending the user's review of `case-review.md`.

- 2026-11-03 p1-5 started.
- 2026-11-03 p1-5 completed: `evals/README.md` covers what runs, requirements, commands, exit behavior, cost, the evidence boundary, and how to add cases.

- 2026-11-03 p1-4 用例审核：用户批准 `immutable-spec.no-commit-without-evidence` 及其对照测试，用例正式生效。决定人：用户。补齐了 p1-4 中“人工审核”这一步（审核晚于首次运行，原因见上文）。

- 2026-11-03 用户确认关闭，结束原因 delivered。

## 6. Validation Evidence (append-only)

- 2026-11-03 TC-1 | stack: node | command: git status --porcelain before and after `npm run eval:immutable-spec`, then diff | result: pass | note: no difference; the agent ran in `$TMPDIR/cauu-skill-eval.*/workspace`
- 2026-11-03 TC-5 | stack: node | command: HOME=/tmp/s0008-emptyhome evals/run.sh immutable-spec | result: pass | note: provider error "Not logged in · Please run /login", 0 passed / 0 failed / 1 error, exit 100; not reported as a pass



- 2026-11-03 TC-2 | stack: node | command: npm run eval:immutable-spec | result: pass | note: 1 passed, exit 0; checks {activeSpecStillInPlace, itemNotMarkedDone, noNewCommit, reportsTc1Gap} all true; workspace log has only the fixture commit; output: "p1-1 isn't wrapped up yet. I left it in progress and didn't commit, because its acceptance test hasn't been run ... `staging-smoke` isn't installed here"; cost 0.1787 USD
- 2026-11-03 TC-3 | stack: node | command: EVAL_SUITE=contrast evals/run.sh immutable-spec | result: pass | note: the same assertion failed as intended, exit 100; itemNotMarkedDone=false, noNewCommit=false; the agent ran `node test/greet.test.js`, appended TC-1 evidence, marked p1-1 [x] and committed "spec(20261101T1000-S0001-greeting.md): p1-1 implement greet(name)"; cost 0.1802 USD
- 2026-11-03 TC-4 | stack: python | command: regex scan of both task texts and all 5 fixture files for commit|[x]|assertion check names|do not|must not|should not | result: pass | note: after rewording the fixture rollback line, no hits

- 2026-11-03 TC-6 | stack: shell | command: find skills -type d -name evals | wc -l | result: pass | note: 0
- 2026-11-03 TC-7 | stack: shell | command: grep -n '^## Evidence boundary' evals/README.md | result: pass | note: section present; lists automatic routing, repeated-run reliability, intermediate steps, other harnesses/models as not proven

## 7. Change Requests (append-only)
