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

- [~] p1-1 编写 SKILL.md（内联 refactor 门槛） → TC-1, TC-2, TC-3, TC-4
- [ ] p1-2 补充 `agents/openai.yaml`，更新 README → none (reason: 元数据和文档，不改变 agent 行为)
- [ ] p1-3 用 case designer 设计 `evals/reduce-entropy/` 中 TC-1 至 TC-3 的用例，新增 `npm run eval:reduce-entropy`；**先经用户审核，再实际运行** → TC-1, TC-2, TC-3
- [ ] p2-1 在一个真实项目上试运行一次（项目由用户之后指定） → TC-5, TC-6, TC-7

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

## 6. Validation Evidence (append-only)

- 2026-11-03 TC-4 | type: feature | method: command | command: scripts/check-skill-consistency.py; tests/consistency/run.sh; copy skills/ to a temp dir, sed 'Pin before changing code.' to 'Pin when convenient.' in reduce-entropy/SKILL.md, run scripts/check-skill-consistency.py <copy> | exit: 0; 0; 1 | output: "ok: 4 gates in immutable-spec, 8 skills checked"; "consistency mutations: 0 failure(s)"; on the mutated copy "error: skills/engineering/reduce-entropy/SKILL.md: gate 'refactor' differs from immutable-spec" | result: pass | note: 8 skills now includes reduce-entropy, the first real skill that inlines a gate

## 7. Change Requests (append-only)
