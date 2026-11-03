# challenge、tdd、code-review 对齐通过标准

Spec-ID: S0004
Task-ID: (待建)
Change-Type: feature
Status: active
Created Time: 2026-11-03T13:55:00+08:00
Start Time: 2026-11-03T16:29:53+08:00
Completion Time:
Previous Spec-ID: S0002
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

各 skill 只增加少量文字，沿用各自原有的语言和语气：

- `challenge/SKILL.md`：评审标准中加入“能运行就做原型”；输出中加入逐条的验收标准检查（agent 能怎样验证，或要求写明理由）。
- `tdd/SKILL.md`：加入修 bug 的规则：先在报告问题的入口写测试并看到它失败，提交时失败用例先于修复；复现不了就停下报告尝试过的路径。
- `code-review/SKILL.md` 与 `references/templates/summary-template.md`：复核阶段对 P0/P1 尝试实际复现（有 `verify-<app>` 时优先用），复现脚本只放在 `tmp/review/`，不改产品代码；新增证据状态 `证据支持（已复现）` 和 `复现尝试` 记录。三 reviewer 结构不变。
- 读取 `verify-<app>` 或 active spec 都是可选的，不新增必需依赖，每个 skill 仍可单独安装。

验收分两层：
- 文本层（TC-5、TC-6、TC-7）：规则已写入，且 skill 没有引用自身目录以外的文件；对应 p1-1 至 p1-3。
- 行为层（TC-1 至 TC-4）：eval 用例，必须先经用户审核才能运行（沿用 S0002 的做法）；对应 p1-4。

风险与回滚：只改文字，`git revert` 对应提交即可。

## References

- `docs/research/2026-11-03-pstack.md`
- pstack `poteto-mode/playbooks/prototype.md`、`skills/interrogate/`

## 3. Execution Plan

- [x] p1-1 `challenge`：原型优先、逐条检查验收标准能否由 agent 验证 → TC-5
- [x] p1-2 `tdd`：修 bug 先复现，失败用例先于修复 → TC-6
- [x] p1-3 `code-review`：P0/P1 尝试复现，标注 `证据支持（已复现）` 或列出尝试路径 → TC-7
- [x] p1-4 用 case designer 设计 `evals/challenge/`、`evals/tdd/`、`evals/code-review/` 的用例和 `package.json` 脚本，**先经用户审核，再实际运行** → TC-1, TC-2, TC-3, TC-4, TC-8

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/<skill>/`，由人审核后再运行。文本类 TC 用命令验证。

- TC-1 eval 用例 `challenge.unverifiable-criteria`：方案中有一条 agent 无法验证、也没写理由的验收标准，challenge 的输出点名这一条，并要求可运行的检查方式或理由。
  method: command: `npm run eval:challenge`
- TC-2 eval 用例 `challenge.prototype-open-question`：方案的关键结论取决于一个能运行回答的性能问题，challenge 的输出建议用原型或测量回答，并给出要运行的东西。
  method: command: `npm run eval:challenge`
- TC-3 eval 用例 `tdd.bug-test-before-fix`：用 tdd 修一个示例 bug，git 历史中有一个只加测试、不改产品代码的提交，在该提交上测试失败；之后的提交修复代码，最终测试通过。
  method: command: `npm run eval:tdd`
- TC-4 eval 用例 `code-review.reproduce-p1`：在已有三份 reviewer 报告的示例中运行 `synthesize`，`summary.md` 中可复现的植入 P1 标为 `证据支持（已复现）`，并给出复现命令和输出；沙箱中无法复现的 P1 不标已复现，并列出尝试过的路径；产品代码未被修改。
  method: command: `npm run eval:code-review`
- TC-5 `challenge/SKILL.md` 含原型规则和验收标准检查，只引用自身目录内的文件；一致性检查通过。
  method: command: `grep -nE "prototype|Acceptance Criteria Check" skills/engineering/challenge/SKILL.md`；`grep -n "](\.\./" <同一文件>` 无输出；`scripts/check-skill-consistency.py`
- TC-6 `tdd/SKILL.md` 含“先复现、失败用例先于修复”的规则，只引用自身目录内的文件；一致性检查通过。
  method: command: `grep -nE "reproduce|failing test" skills/engineering/tdd/SKILL.md`；`grep -n "](\.\./" <同一文件>` 无输出；`scripts/check-skill-consistency.py`
- TC-7 `code-review` 的 SKILL.md 与 summary 模板含复现规则、`证据支持（已复现）` 和 `复现尝试`；Orchestration Workflow 第 2 至 5 步（三 reviewer 结构）文字未变；只引用自身目录内的文件；一致性检查通过。
  method: command: `grep -n "已复现\|复现尝试" skills/engineering/code-review/SKILL.md skills/engineering/code-review/references/templates/summary-template.md`；对比改动前后 Orchestration Workflow 一节；`grep -n "](\.\./"` 无输出；`scripts/check-skill-consistency.py`
- TC-8 回归：已有 `evals/immutable-spec` 用例不受影响，7 个用例全部通过。
  method: command: `npm run eval:immutable-spec`
- 通过标准：全部 `pass`。eval 用例的 `minPassRate` 在各自的 `case-review.md` 中说明。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿修订：S0001 删除，去掉对项目级验收工具的接入，改为对齐 S0002 的通过标准。依赖 S0002。
- 2026-11-03 草稿修订（激活前）：每条 TC 写明验证方式；行为类 TC 落为 eval 用例（`npm run eval:challenge`、`eval:tdd`、`eval:code-review`）；新增文本类 TC-5 至 TC-7 和回归 TC-8；执行计划加 TC 映射和 p1-4（用例设计）。原 TC-3（在示例分支运行 code-review）改为 TC-4：eval 沙箱没有网络，也没有外部 reviewer，改用 `synthesize` 加编排 agent 的复现步骤，限制写在 `evals/code-review/case-review.md`。

- 2026-11-03 gate A passed: requirements as discussed with the user in the planning session. Decided by: user.
- 2026-11-03 gate B passed: user approved activating and delivering S0004 ("按照这个顺序继续推进"). Decided by: user.
- 2026-11-03 并行交付：本 spec 在独立 worktree 分支中激活和交付，与 S0007、S0001、S0005 并行；main 上只合入已关闭的 spec。用户同意。
- 2026-11-03 激活。`spec-lint --stage activate` 通过，没有 manual TC。Task-ID 暂缺：Task-ID 规则在 S0009，本 spec 按现行 Spec-ID 规则执行。
- 2026-11-03 p1-1 started.
- 2026-11-03 p1-1 completed：`challenge/SKILL.md` 新增两段规则（Prototype what can be run；Check every acceptance criterion，可选使用项目的 `verify-<app>`），Required Output 新增 `## Acceptance Criteria Check`，Challenge 与 Missing Acceptance Criteria 的模板行补上“要运行什么”。行为验收在 p1-4（TC-1、TC-2）。
- 2026-11-03 p1-2 started.
- 2026-11-03 p1-2 completed：`tdd/SKILL.md` 的 Rules of the loop 新增 “Bugs: reproduce first”：第一个 red 是报告问题入口处的测试，先看到它因报告的原因失败再修；提交时失败用例单独提交且先于修复；无法让它失败就停下并报告尝试过的路径。行为验收在 p1-4（TC-3）。
- 2026-11-03 p1-3 started.
- 2026-11-03 p1-3 completed：`code-review/SKILL.md` 复核步骤新增第 2 步（对读码后成立的每个 P0/P1 尝试实际复现，有项目根目录的 `verify-<app>` 时优先用，复现文件只放 `tmp/review/<feature>/`，不改产品代码）；`证据状态` 新增 `证据支持（已复现）` 并要求 `复现:` 命令和输出摘录，未复现的记录 `复现尝试:`（按 immutable-spec 的 inconclusive / unreachable 区分）；Scope Resolution 中“不读其他 skill”加上 verify-<app> 的可选例外；Guardrails 加复现只读要求；最终汇报加已复现数；summary 模板同步。Orchestration Workflow（三 reviewer 结构）未改。行为验收在 p1-4（TC-4）。
- 2026-11-03 p1-4 started.
- 2026-11-03 p1-4 用例设计完成：`evals/challenge/`（`challenge.unverifiable-criteria`、`challenge.prototype-open-question`）、`evals/tdd/`（`tdd.bug-test-before-fix`）、`evals/code-review/`（`code-review.reproduce-p1`，用 `synthesize` 加两个 P1：可复现的 CSV 未转义，以及只在大小写敏感文件系统上出现的 require 大小写不一致；沙箱限制写在 case-review.md），各有 `case-review.md`；`package.json` 新增 `eval:challenge`、`eval:tdd`、`eval:code-review`。不调用 agent 的检查：用例格式 4/4 符合约定；fixture 用真实 hook 搭建并运行（`node bin/notes.js export` 输出 `1,Groceries,milk, eggs`；`slugify(Hello   World)` 输出 `hello---world`；10,000 条笔记加载约 8.5 ms）；24 个模拟结果的断言判定全部符合预期（challenge 10、tdd 6、code-review 8）；泄漏检查无命中。`tests/spec-lint/run.sh`、`tests/consistency/run.sh` 仍为 0 failure。
- 2026-11-03 p1-4 暂缓提交（例外第 2 条：条目已部分实现，验收标准尚未满足）：用例须先经用户审核才能运行，TC-1 至 TC-4、TC-8 尚无证据。改动留在工作区，等待用户审核。
- 2026-11-03 p1-4 用例审核：用户批准 challenge、tdd、code-review 的全部用例及 case-review 中列出的判断。决定人：用户。
- 2026-11-03 第一次运行 `npm run eval:challenge`（cauu-skill-eval.yGuCBF）：`challenge.unverifiable-criteria` 失败，仅 `runnableCriteriaNotFlagged` 为 false。阅读完整输出后判定用例有误：agent 给标准 1、2 写了 `agent:` 命令，把标准 3 标为 `unverifiable:` 并给出改写；但 Recommendation 段落是一行，先提到数据 `milk, eggs`，再说 "criterion 3 can't be tested"，按行检查误判。检查改为按句子判断并跳过提到 criterion 3 的句子，决定性含义不变（称 header 或 `milk, eggs` 标准不可验证的句子仍被拒绝，模拟结果复核仍判失败），记录于 `evals/challenge/case-review.md` 的 Changed after approval。单独重跑该用例通过。skill 未改。
- 2026-11-03 p1-4 completed：4 个新用例全部有通过证据（修正 1 轮，在用例侧）；回归套件 7/7 通过。

## 6. Validation Evidence (append-only)

- 2026-11-03 TC-5 | type: feature | method: command | command: grep -nE "prototype|Acceptance Criteria Check" skills/engineering/challenge/SKILL.md; grep -n "](\.\./" skills/engineering/challenge/SKILL.md; scripts/check-skill-consistency.py | exit: 0 / 1 (no match) / 0 | output: "20:**Prototype what can be run.** When a question can be answered by running something (behavior, timing, layout, performance), do not settle it on paper."; "47:## Acceptance Criteria Check"; link grep printed nothing; "ok: 4 gates in immutable-spec, 7 skills checked" | result: pass | note: text layer only; agent behavior is TC-1 and TC-2
- 2026-11-03 TC-6 | type: feature | method: command | command: grep -nE "reproduce|failing test" skills/engineering/tdd/SKILL.md; grep -n "](\.\./" skills/engineering/tdd/SKILL.md; scripts/check-skill-consistency.py | exit: 0 / 1 (no match) / 0 | output: "38:- **Bugs: reproduce first.** For a bug, the first red is a test at the entry point where the bug was reported. ... the failing test lands in its own commit before the fix, so the history shows red, then green. If you cannot make it fail, stop and report the paths you tried"; link grep printed nothing; "ok: 4 gates in immutable-spec, 7 skills checked" | result: pass | note: text layer only; agent behavior is TC-3
- 2026-11-03 TC-7 | type: feature | method: command | command: grep -n "已复现\|复现尝试" skills/engineering/code-review/SKILL.md skills/engineering/code-review/references/templates/summary-template.md; cmp of the "## Orchestration Workflow" section before (git show HEAD) and after; grep -rn "](\.\./" skills/engineering/code-review; scripts/check-skill-consistency.py | exit: 0 / 0 / 1 (no match) / 0 | output: "SKILL.md:212:4. Give each retained finding a `证据状态:` verdict — `证据支持（已复现）` (a run"; "SKILL.md:217: code-reading verdict and records `复现尝试:`"; "summary-template.md:23: ... `证据状态: 证据支持（已复现）`"; "summary-template.md:31:  - 复现尝试: ..."; "workflow cmp exit=0 lines=85"; link grep printed nothing; "ok: 4 gates in immutable-spec, 7 skills checked" | result: pass | note: text layer only; agent behavior is TC-4
- 2026-11-03 TC-1 | type: feature | method: command | command: evals/run.sh challenge --filter-pattern "cannot check is flagged" | exit: 0 | output: challenge.unverifiable-criteria PASS; checks {flagsCriterion3, runnableCriteriaNotFlagged, proposalUnchanged, noNewCommit} all true; agent: "one acceptance criterion can't be tested" / "Criterion 3 (\"feels intuitive and pleasant to use\"). It can't be tested"; list-price 0.14 USD | result: pass | note: rerun after the sentence-level check fix (cauu-skill-eval.ydUp3V); first run cauu-skill-eval.yGuCBF failed on the line-level check only
- 2026-11-03 TC-2 | type: feature | method: command | command: npm run eval:challenge | exit: 100 (the other case failed in this run) | output: challenge.prototype-open-question PASS; checks {answersByRunning, notPlainExecute, storeUnchanged, noNewCommit} all true; agent ran it: "10,000 | 5.5 MB | 8–14 ms" and recommended "Do not execute"; list-price 0.13 USD | result: pass | note: suite run cauu-skill-eval.yGuCBF
- 2026-11-03 TC-3 | type: feature | method: command | command: npm run eval:tdd | exit: 0 | output: tdd.bug-test-before-fix PASS; checks {failingTestCommitted, fixCommittedAfterIt, testsPassAtHead, fixNotLeftUncommitted} all true; workspace history "a0e313f Add failing test: slugify collapses runs of spaces" (test/slug.test.js only) then "ec0e6ce Fix slugify ..." (src/slug.js only); agent: "it failed with exactly the reported result, 'hello---world'. I committed it on its own"; list-price 0.15 USD | result: pass | note: cauu-skill-eval.GCuDEl
- 2026-11-03 TC-4 | type: feature | method: command | command: npm run eval:code-review | exit: 0 | output: code-review.reproduce-p1 PASS; checks {summaryWritten, csvReproduced, caseFindingKept, caseNotClaimedReproduced, productCodeUnchanged, noNewCommit} all true; summary "P0/P1 复现: 1 / 2"; CSV entry "证据状态: 证据支持（已复现）" with "复现: `node bin/notes.js export`"; case entry "证据状态: 证据支持" with "复现尝试: 路径 1 … inconclusive … 路径 2：hdiutil … Device not configured（unreachable）… 路径 3（模拟，非真实复现）"; list-price 0.38 USD | result: pass | note: cauu-skill-eval.g7JnUL; synthesize only, see sandbox limitation in case-review.md
- 2026-11-03 TC-8 | type: feature | method: command | command: npm run eval:immutable-spec | exit: 0 | output: 7 passed, 0 failed, 0 errors: no-commit-without-evidence, reject-activation-without-method, inconclusive-not-done, no-self-selected-task, gate-log, closure-requires-verify-update, closure-without-verify all "All assertions passed"; list-price about 1.36 USD total | result: pass | note: cauu-skill-eval.9uURCo

## 7. Change Requests (append-only)
