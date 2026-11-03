# bug-fix skill

Spec-ID: S0003
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

修 bug 时常见的问题：用户说有 bug，agent 没复现就改；改动里夹带“可能有用”的防御代码；修完只跑单元测试。

### Scope

新增可分发 skill `skills/engineering/bug-fix/`，模型可自动调用。流程：

1. 前提：Task 已由用户指定并认领。bug-fix 只检查这一前提，不实现认领流程（认领规则在 `immutable-spec`，见 S0009）。
2. 只读复现。项目里有 `verify-<app>` 时优先用它，其次用测试、脚本或直接操作真实应用。记录复现命令和输出。
3. 无法复现：说明原因、尝试过的路径和缺少的条件，然后停止。不因为用户提出就强行修复。后续去向由用户决定。
4. 已复现：判定复杂度，把结果和依据写入 Task。满足任意一条即为复杂：
   - 根因跨越模块边界；
   - 涉及数据、迁移或并发；
   - 需要先做设计决策；
   - 验收标准无法用一句话写清。

   判定后分两条路：
   - 复杂：用 lite spec 模板（S0002）建 spec，按 `spec-design` 简化版（S0007）走两个关口。关口 A 确认复现结果和根因，关口 B 确认修复方案和验证标准。未安装 `immutable-spec` 时，把复现记录、根因、方案和验证标准写入 Task，并提示可以改用 spec 跟踪。
   - 简单：直接修复，复现命令与先失败后通过的输出写入 Task 或 PR。用户可以随时把它升级为复杂。
5. 用证据定位根因：列出假设，逐个排除，每一步要有运行证据。证据否定了某个假设，就回滚它带来的改动。
6. 失败用例先于修复提交。
7. 在复现的同一界面上验证。

### Constraints

- 独立安装。`tdd`、`immutable-spec`、`spec-design` 都是可选输入。
- 只合入证据支持的最小改动。

### Non-goals

- 运行时诊断、trace 分析。
- PR 合并流程。

## 2. Outline Design

- SKILL.md 约 60 行以内，复杂度判定条件和证据要求写成清单。
- 在 SKILL.md 中内联 bugfix 门槛一句：同一入口上先失败、后通过，复现命令和输出原样记录。由 S0002 的一致性检查确认与 `immutable-spec` 门槛表一致。

## References

- `docs/research/2026-11-03-pstack.md`
- pstack `poteto-mode/playbooks/bug-fix.md`、`skills/blast-radius/`

## 3. Execution Plan

- [ ] p1-1 编写 SKILL.md
- [ ] p1-2 补充 `agents/openai.yaml`，更新 README
- [ ] p2-1 用一个可复现的 bug 和一个不可复现的报告各试一次

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/<skill>/`，写法为 `method: command: npm run eval:<skill>` 加用例 ID。下面写成自然语言的行为类 TC，在执行前用 case designer 转成用例，并由人审核。

- TC-1 frontmatter 合法，name 与目录一致。
- TC-2 对不可复现的报告，agent 停止并给出原因，没有修改代码。
- TC-3 对可复现的 bug，git 历史中失败用例先于修复提交，且附有先失败后通过的输出。
- TC-4 复杂度判定的结果和理由写入 Task、PR 或 spec。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。依赖 S0002、S0007。
- 2026-11-03 草稿修订：认领改为前提条件；补充未安装 immutable-spec 时的处理；复杂 bug 走 spec-design 简化版。
- 2026-11-03 草稿修订（按挑战结论）：bugfix 门槛改为内联；认领规则改指 S0009。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
