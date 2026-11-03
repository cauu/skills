# reduce-entropy skill

Spec-ID: S0005
Task-ID: (待建)
Change-Type: feature
Status: draft
Created Time: 2026-11-03T13:55:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
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

- [ ] p1-1 编写 SKILL.md
- [ ] p1-2 补充 `agents/openai.yaml`，更新 README
- [ ] p2-1 在一个真实项目上试运行一次

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/<skill>/`，写法为 `method: command: npm run eval:<skill>` 加用例 ID。下面写成自然语言的行为类 TC，在执行前用 case designer 转成用例，并由人审核。

- TC-1 试运行输出熵源清单，每项有证据（提交、文件位置）。
- TC-2 每个合入的重构在改动前后都通过同一个行为固定检查。
- TC-3 至少一类重复错误被升级为类型、lint 或测试约束，并证明它能拦住历史上的一次错误。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。
- 2026-11-03 草稿修订（按挑战结论）：refactor 门槛改为内联。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
