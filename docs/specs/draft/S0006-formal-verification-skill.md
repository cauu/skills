# formal-verification skill

Spec-ID: S0006
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

新增可分发 skill `skills/engineering/formal-verification/`，用户手动调用，两种模式：

1. `create`：
   - 从代码中挑出出错代价最高、测试最难覆盖的性质。
   - 按问题选工具：时序和并发默认 TLA+；逐输入正确性用代码级验证器；没有可用验证器时，用生成输入测试真实代码。
   - 生成项目内检查，记录覆盖的代码和最后一次核对时的 commit。
   - 证明每条性质能在故意改坏的代码上报错。
   - 当前代码违反性质时，作为发现报告，不削弱性质。
2. `maintain`：
   - 读取上次核对后覆盖代码的所有改动。
   - 每个检查给出 `in sync`、`updated`、`bug`、`blocked` 之一。
   - 区分验证没跟上代码和代码真有 bug。
   - 只改验证文件，不改产品代码。

### Constraints

- 独立安装。结论用词和证据格式与 `immutable-spec`（S0002）一致。

### Non-goals

- statechart 可视化（依赖 TLC、Java 和专用编译器，暂缓）。

## 2. Outline Design

产物为项目内的检查和说明。`Change-Type: formal` 的 spec 在验证计划中引用它的运行命令。

## References

- `docs/research/2026-11-03-pstack.md`
- pstack `skills/create-formal-verification-skill/`、`skills/maintain-formal-verification-skill/`

## 3. Execution Plan

- [ ] p1-1 编写 SKILL.md 的 create 模式
- [ ] p1-2 编写 SKILL.md 的 maintain 模式
- [ ] p1-3 补充 `agents/openai.yaml`，更新 README
- [ ] p2-1 在一个有并发或状态机的项目上试运行（项目待定）

## 4. Test and Acceptance Criteria

行为类 TC 用 S0008 的 eval 用例验证，用例放在 `evals/<skill>/`，写法为 `method: command: npm run eval:<skill>` 加用例 ID。下面写成自然语言的行为类 TC，在执行前用 case designer 转成用例，并由人审核。

- TC-1 试运行生成的检查能在故意改坏的代码上报错，恢复后回到原状态。
- TC-2 maintain 能把一次人为改动正确归类为 drift 或 bug。
- TC-3 生成的检查一条命令可重跑，并记录了覆盖代码和 sync commit。

## 5. Execution Log (append-only)

- 2026-11-03 草稿创建。依赖 S0002。

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
