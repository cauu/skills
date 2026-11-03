# Decision brief

Use this whenever you ask the user to decide something: a product or preference question, gate A, or gate B. The user must be able to decide from this one reply, without opening other files or asking follow-up questions.

## One decision

```markdown
### D<n> <the question, in one line>
- Options: A <option>; B <option>[; C ...]
- Recommendation: <option>, in one sentence
- Basis: <the evidence: file:line, prototype command and output, measurement, or the user's earlier statement>
- Risk: <what goes wrong if the recommendation is wrong, and how hard it is to undo>
- Needed from you: <pick an option | confirm | answer in your own words>
```

Rules:

- Ask only what the code cannot answer. Questions the code answers are stated as findings, with `file:line`.
- One brief per decision. Order them by how much of the design depends on the answer.
- For a preference question with a comparison page, give the page path and how to switch variants.
- Never bundle a decision you made yourself as a question. State it as a finding the user can overrule.

## Gate A request

```markdown
## Gate A: requirements
- Goal: <restated in your own words>
- Problem: <what is wrong today, and for whom>
- Minimum change: <the smallest change that meets the goal>
- Scope: <in>
- Non-goals: <out>
- Priorities: <what wins when they conflict>
- Findings from the code: <answers you found yourself, with file:line>

<one decision brief per open product or preference question>

Reply "gate A passed", or say what to change.
```

For a complex bug, replace Goal through Minimum change with the reproduction record (command and observed output) and the root cause (`file:line` and the evidence).

## Gate B request

```markdown
## Gate B: activation
- Change-Type: <type> and its evidence gate in one line
- Design: <chosen shape in one line>; rejected: <one line each>
- Plan: <item ids with their TCs>
- Verification: <each TC with its method>
- Manual TCs: <each with its reason, or "none">
- Risks: <what could still go wrong>

<one decision brief per remaining open question>

Reply "gate B passed" to activate, or say what to change.
```
