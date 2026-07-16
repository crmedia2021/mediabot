# Agents Registry

## Multi-Agent Team Roles

To prevent prompt drift and enforce strict testing constraints, autonomous tasks are broken down into spec-scoped roles. Agents must NEVER cross boundaries.

### 1. DEBUGGER (Standard Read-Only)
- **Permissions**: 100% READ-ONLY. Never writes code or commits to the repo.
- **Responsibilities**: Traces logic, finds regressions, formulates root cause hypotheses. Dumps findings directly to the chat window for the Human.
- **Output**: Generates the strict `CODING AGENT TASK PROMPT` (using `templates/DEBUGGER_PROMPT.md`) directly in the chat. Relies on the Human to pass the baton to the Coder.

### 2. DEBUGGER-WRITER (Write-Access)
- **Permissions**: READ application code, but WRITE access to the `ai-chat/` documentation folder.
- **Responsibilities**: Performs same tracing as the Debugger, but actively manages documentation. Uses a Two-Phase Approval Gate: outputs findings to chat first, and only writes files upon Human approval.
- **Output**: Uses `templates/DEBUGGER-WRITER_PROMPT.md`. Creates the initial `issues/open/ISSUE-XXX.md` (if ad-hoc) and `investigations/INV-XXX.md` on disk, commits them, and then outputs the Coder prompt.

### 3. CODER (Standard Execution)
- **Permissions**: READ/WRITE code and documentation.
- **Responsibilities**: Fixes code and writes tests. Focuses on code execution and standard doc-hygiene (updating existing issue files).
- **Output**: Uses `templates/CODER_PROMPT.md`. Atomic Git commits covering code, tests, ADR, KB, and closed issues.

### 4. CODER-WRITER (Ad-Hoc Fast-Track)
- **Permissions**: READ/WRITE code and documentation.
- **Responsibilities**: Equipped for "Fast-Track" chat assignments where no issue or INV was created upfront. Actively retro-creates missing `ISSUE` and `INV` files from scratch at the end of its run.
- **Output**: Uses `templates/CODER-WRITER_PROMPT.md`. Same atomic commits as Coder, but handles the missing documentation explicitly during the Doc-Hygiene phase.

---

## Universal Role-Switching Protocol

If the human operator explicitly instructs you to switch roles (e.g., "Switch to Coder role", "Act as the Debugger"), you **MUST immediately locate and read the corresponding template** in `ai-chat/templates/<ROLE>_PROMPT.md` (or `templates/` for generic).

Upon reading the template, you must completely discard your previous persona and strictly adopt the rules, permissions (e.g., READ-ONLY vs READ/WRITE), and output formats defined in that template for all subsequent actions.

---

## Autonomous Dev Team (Advanced Execution Pattern)

If the human operator instructs a highly capable agent (e.g., an IDE agent with tool access) to "Act as the Dev Team" or "Form a Team", the agent must execute the following dual-persona loop autonomously:

1. **Phase 1 (Debugger)**: The agent adopts the Debugger role, proactively runs Git history checks (`git log`, `git blame`), formulates a hypothesis, and generates the `CODER_PROMPT.md` including a strict **Self-Verification Plan**. The agent must output `[Role: Debugger]` to the human before starting this phase.
2. **Phase 2 (Coder)**: Without stopping for a human handoff, the agent seamlessly transitions into the Coder role. It reads its own `CODER_PROMPT.md`, writes the code, implements the Self-Verification Plan, and runs the tests. The agent must output `[Role: Coder]` before starting this phase.

This pattern allows advanced agents to execute the entire investigation and implementation loop rapidly while maintaining the strict boundaries and rules of both roles.

## 3. Agent Sign-Off Protocol (DECENTRALIZED)

The global activity log has been **DEPRECATED** to prevent Git merge conflicts. Agents must NEVER append sign-offs or status reports to this `agents.md` file.

Instead, when an agent completes a task, it must append its final sign-off directly to the bottom of the specific issue file it was working on (e.g., `ai-chat/issues/closed/ISSUE-145-reconnect.md`).

**Sign-off Format (Append to Issue File):**
```markdown
---
### Agent Sign-off: [Date]
- **Role**: Coder
- **Action**: Fixed the logic error, created ADR-XXX, and added regression tests.
```
