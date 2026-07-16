**ðŸ›‘ NO AI AGENT IS PERMITTED TO MODIFY THIS FILE WITHOUT EXPLICIT APPROVAL FROM A HUMAN.**
# Master Governance Document (SOP)

## 1. Agent Onboarding & Pre-Flight Check

Any agents starting work in this repository MUST execute the following Git-Native flow:

1. `git fetch && git pull`
2. Read `ai-chat/SOP.md` (THIS FILE)
3. **READ `ai-chat/PROJECT_RULES.md` (MANDATORY HANDOFF)**
4. Run `python ai-chat/utils/build_index.py ai-chat` to ensure the Index is up to date.
5. Check `ai-chat/issues/open/` for assigned tasks (DO NOT read issues.md)
6. Create task branch: `task/[issue-id]-[short-name]`
7. Execute task
8. Commit atomically (code + docs in the SAME commit)
9. Push and PR

*(Note: As of 2026-07-02, chatpad.md is deprecated. Agent activity is now tracked exclusively via Git commits and branch names.)*

**IMPORTANT: Agents are capable of dynamic role-switching mid-task. If instructed to switch roles (e.g. "Act as Debugger"), refer immediately to the Universal Role-Switching Protocol in `ai-chat/agents.md`.**

### 1.2 Common Pitfalls (READ BEFORE CODING)

These are the most frequently missed rules that cause **runtime crashes** or production incidents. Read this section BEFORE writing any code. Each entry links to the full rule.

1. **Adding `.env` vars without adding `Settings` fields** (ADR-191, CONFIG-SCHEMA-001)
   - **Symptom:** App crashes at startup with `ValidationError: Extra inputs are not permitted [type=extra_forbidden]`
   - **Cause:** A PR added a new env var to `.env.example` but forgot to add the corresponding field in the `Settings` class.
   - **Rule:** EVERY env var in `.env`/`.env.example` MUST have a matching field in the `Settings` class — even vars consumed only by Node.js or shell scripts. `extra="forbid"` enforces this at startup.
   - **Pre-commit check:** `python -c "from app.config import settings; print('OK')"` MUST print `OK`.
   - **Full rule:** PROJECT_RULES §5 (CONFIG-SCHEMA-001) + SOP §9.
   - **History:** This bug is the #1 most-missed rule. ADR-191 adds process guards (checklist + verifier gate + structural test) to prevent recurrence.

2. **Missing regression test for bug fixes** (SOP §21.4)
   - **Symptom:** Bug recurs months later because no test guards against it.
   - **Rule:** Every bug fix MUST include a regression test that (a) fails BEFORE the fix and (b) passes AFTER the fix.
   - **Full rule:** SOP §21.4.

3. **Breaking the Single-Response Contract** (SOP §2, ADR-086)
   - **Symptom:** User receives duplicate messages when an LLM call fails.
   - **Rule:** Service functions that return user-facing messages MUST catch all exceptions internally and ALWAYS return a string. Callers MUST NOT have a separate error-message send that could double-fire.
   - **Full rule:** SOP §2 (Single-Response Contract) + ADR-086.

4. **Skipping LLM retry on transient errors** (LLM-RETRY-001)
   - **Symptom:** User sees "AI service unavailable" on the first 429/5xx from the LLM provider.
   - **Rule:** All `ask_llm()` calls MUST retry 429/500/502/503/504 with exponential backoff (1s→2s→4s, max 3 attempts). 4xx errors MUST NOT be retried.
   - **Full rule:** SOP §2 (LLM-RETRY-001) + ADR-057.

5. **Using `git add .` or `git add -A`** (SOP §2.1)
   - **Symptom:** Accidental commits of `.env`, `bot.db`, or runtime artifacts.
   - **Rule:** ALWAYS stage files explicitly (e.g., `git add app/config.py ai-chat/INDEX.md`).
   - **Full rule:** SOP §2.1 (Anti-Pollution).

*As new recurring pitfalls are discovered, append them here. This section is the "TL;DR for agents in a hurry" — keep entries short, link to full rules.*

### 1.1 Core Document Edit Permissions

To maintain strict portability of this Agentic OS across different projects, documents are classified into two tiers:

- **TIER 1: CONSTITUTIONAL DOCS (IMMUTABLE)**
  Files: `SOP.md`, `PROJECT_RULES.md`, `README.md`, `utils/build_index.py`, `templates/*_PROMPT.md`.
  **Rule:** NO AI AGENT is permitted to modify these files without explicit human approval. These define the non-negotiable laws of the workspace.
  
- **TIER 2: DECENTRALIZED STATE DIRECTORIES (FLUID)**
  Directories: `issues/open/`, `issues/closed/`, `decisions/`, `investigations/`, and `knowledge_base/*`.
  **Rule:** The monolith tracking files (`issues.md`, `decisions.md`, `changelog.md`) are DEPRECATED. Agents MUST NOT read or edit them. AI Agents MAY autonomously create or edit individual `.md` files inside these state directories. To find tasks or read history, agents MUST use `ls` or `grep` on these directories. After modifying state, agents MUST run `python ai-chat/utils/build_index.py ai-chat` to update the global index.

- **TIER 3: EXTERNAL REFERENCE (READ-ONLY)**
  Files: `repo-reference/*`
  **Rule:** This directory contains raw codebases of other production apps intended PURELY for reference. NO AI AGENT is permitted to edit, refactor, or write files inside this directory under ANY circumstances. Treat this folder as a strictly read-only external library.

## 2. Coding Constraints
Strict adherence to the project's architecture is required.

- **Atomic Documentation Rule:** No code change is complete without its corresponding documentation update in the SAME commit. Commits containing code changes but missing new files in `issues/closed/`, `decisions/`, or `investigations/` (as applicable) will be rejected by CI.

- **Language Purism:** Python 3.12 strict typing enforced. Type hints mandatory on all public APIs, function parameters, and return values. Private functions may omit return type hints if inference is trivial. No implicit any types permitted. mypy strict mode enabled in CI.
- **Modularity:** Ensure code is well-structured and separated into logical, independent modules.
- **Interface Parity:** Interfaces should remain consistent across modules.

### 2.1 Strict Git Protocol (MANDATORY)
Because this OS relies on decentralized files and Git history, agents MUST execute Git operations with surgical precision:
1. **The Rename Rule (`git mv`)**: When moving an issue from `issues/open/` to `issues/closed/`, you MUST use `git mv <source> <dest>`. Do not use bash `mv` or python rename, as this severs the file's historical blame tree.
2. **Anti-Pollution (`git add`)**: NEVER use `git add .` or `git add -A`. You must explicitly stage ONLY the specific files you intended to modify (e.g., `git add app/contact_sync.py ai-chat/INDEX.md`).
3. **Indexable Commits**: All commit messages MUST begin with the exact Issue or ADR ID to ensure the Historian Debugger can find them later. Format: `[ISSUE-XXX] <Type>: <Description>`.

#### 2.1.1 Pre-Commit Config Validation (MANDATORY when touching config)

If your staged changeset includes ANY of these files:
- `.env`
- `.env.example`
- `app/config.py` (or your project's equivalent Settings class file)

You MUST run this command BEFORE `git commit`:

```bash
python -c "from app.config import settings; print('OK')"
```

If it raises `ValidationError`, DO NOT commit. Add the missing `Settings` field(s) first. This is the same check your startup script runs at boot — catching it pre-commit avoids a broken deploy.

**Why this matters:** `extra="forbid"` is a hard gate. A missing `Settings` field for a new `.env` var will crash the app at startup with `Extra inputs are not permitted`. This is the #1 most-missed rule. See SOP §1.2 #1 and PROJECT_RULES §5.

**Future automation:** A `.git/hooks/pre-commit` script should run this check automatically when the staged changeset matches the files above. Tracked as a follow-up task (ADR-191).
## 3. Testing & Deployment
### 3.1 Agentic Testing & Mocking Standards (MANDATORY)

To prevent fragmented, duplicated test files and ensure cross-agent test reusability, all agents MUST adhere to the following testing architecture:

## 4.2 Shell Scripting & Idempotent Installation
- **Intelligent Dependency Management:** Shell scripts (`start.sh`, `install.sh`) must intelligently reinstall dependencies when configuration files change. Do not just check for the existence of `node_modules` or `venv`. Use file modification timestamps (e.g., `[ package.json -nt node_modules ]`) to trigger `npm install` or `pip install` only when the requirement files are updated.
- **Safe Cleanup:** Cleanup traps must explicitly preserve persistent state markers (e.g., .bot_ready_state) and only remove runtime artifacts.
- All LLM prompts for translation must explicitly forbid meta-commentary and enforce 'output-only' constraints.
- **Input Validation:** All user-facing commands must validate inputs and provide sensible defaults or clear error messages. Never greedily assume user input matches a parameter just based on length.
- All token limits, context window sizes, and model parameters must be configurable via .env; no magic numbers in code. Hardcoded token counts and fixed conversation slices are strictly prohibited.
- **Operational Thresholds Configurable (CONFIG-EXTRACT-001, MANDATORY):** All operational thresholds (timeouts, concurrency limits, retry counts, intervals, delays) in BOTH the Python backend and the Node.js gateway MUST be configurable via environment variables with sensible defaults. No hard-coded magic numbers for operational parameters. The Node.js gateway uses the `parseInt(process.env.VAR_NAME) || DEFAULT` pattern; the Python backend uses Pydantic `Settings` fields. All new variables MUST be documented in `.env.example` with clear comments. See ADR-059.
### 6.4 Docker (REMOVED — ADR-135)
- Docker support has been removed from the project. The bot runs natively via `start.sh`
  which handles Python venv + Node.js gateway + Chrome Bridge server directly.
- `WHATSAPP_GATEWAY_URL` default is now `http://localhost:3000` (was `http://whatsapp-gateway:3000`
  which only resolved inside Docker and broke non-Docker setups).
- Do NOT re-add Dockerfiles or docker-compose.yml without explicit human approval.

### Code Maintenance and Hygiene
- **Dead code and backup files must be removed immediately upon refactoring, not batched.** Do not leave `*-backup.*`, `*.bak`, `*.old`, `*~`, or commented-out deprecated logic blocks in the codebase.

### Agentic Workflows and Loop Guards
- **Graceful Degradation**: All agentic loops must have hard iteration limits and timeout guards. If advanced reasoning logic fails (such as an LLM Gap Analysis phase), the system must log the failure but immediately fallback to synthesize a final answer using the available accumulated context, rather than completely failing.
- **Single-Response Contract (MANDATORY)**: Service functions that construct and return user-facing messages (e.g., `execute_iterative_search()`) MUST catch all exceptions internally and ALWAYS return a string. The caller MUST NOT have a separate error-message send in its `except` block that could fire when the service already returned a fallback. This prevents duplicate messages. If a safety-net `except` is kept in the caller, it must log `"this should not happen"` to flag contract violations.
- **LLM Retry & Graceful Fallback (LLM-RETRY-001, MANDATORY)**: All external LLM API calls (`ask_llm()` in `app/ai_client.py`) MUST implement automatic retry with exponential backoff for transient provider errors. Retry conditions: HTTP status codes 429 (Rate Limit), 500, 502, 503, 504 only. Client errors (400, 401, 403, 404) MUST NOT be retried Ã¢â‚¬â€ they indicate config or request problems. Retry parameters: maximum 3 attempts, exponential backoff of 1s, 2s, 4s between attempts. Each retry MUST be logged at WARNING level (`[WARNING] LLM error (attempt N/3): status=XXX. Retrying in Xs...`). If all retries are exhausted, the caller (`process_message()` in `ai_memory_engine.py`) returns `None`, and the router (`_handle_dm_message` / `_handle_group_message`) MUST send a user-friendly fallback message (`"Ã¢Å¡Â Ã¯Â¸Â AI service is temporarily unavailable. Please try again later."`). The fallback message is sent via `send_text_message()` which is already stealth-suppressed at the gateway level per ADR-050 Ã¢â‚¬â€ no separate stealth check is needed in the router. See ADR-057.
### Feature Flag Implementation Standards
- **Runtime vs ENV Configuration Priority**: When implementing feature flags, the system should always prioritize a verified runtime database state first (e.g. via `FeatureFlagService`), and fall back to a strictly typed ENV default if no override exists.
- **Experimental Features**: All experimental features must have an ENV kill-switch and RBAC guard. Do not deploy resource-heavy features universally without a means for the owner to toggle them off dynamically at runtime.

### Agentic Feature Documentation Standards
- **Strict Knowledge Base Standards**: When introducing new large-scale architectural features, complex workflows, or when explicitly requested by a human, you MUST create a dedicated markdown file in `ai-chat/knowledge_base/`. Every KB file MUST strictly contain the following sections:
  1. **Goal & Scope**: What the solution does and what problem it solves.
  2. **Architecture Visuals**: Mandatory Mermaid or ASCII flow diagrams illustrating the logic.
  3. **Code References**: Exact absolute file paths and function names (e.g., `app/services/my_service.py::process_data()`) so future agents can `grep` them.
  4. **Edge Cases & Failure Modes**: Known limitations, untested bounds, or failover states.
- **Search Infrastructure**: All external search deployments (e.g., SearXNG) must be strictly documented using the Copy-Paste-Deploy pattern. See [SEARXNG_DEPLOYMENT_GUIDE.md](knowledge_base/SEARXNG_DEPLOYMENT_GUIDE.md) as the standard.

## 6. Audit Requirements

All branch audits MUST include:
- Memory leak analysis for async task pipelines
- Error propagation review across service boundaries
- **Schema Migrations:** Any ad-hoc SQLAlchemy schema migrations run during startup (e.g., `db_migration.py`) must gracefully handle 0-day fresh installs (where tables do not exist yet) and must verify the exact state of `PRAGMA table_info` before executing DDL to prevent `sqlite3.OperationalError` crashes.
- Migration path documentation for breaking changes
- Dependency drift risk assessment (embedding models, vector schemas)
- **Integration Test Coverage:** every router sub-handler (`_handle_dm_message`,
  `_handle_group_message`, `_try_kb_trigger`, `_delayed_chatty_reply`) MUST have
  at least one integration test in `tests/integration/gateway_backend/` covering:
  1. Happy path (successful reply).
  2. Error path (LLM returns None, exception raised, fallback sent).
  3. Edge cases (empty text, media-only, mention-only, search trigger).
  Branch audits MUST verify this coverage exists before approving merges.

**Enforcement Rule:** DEBUG-LEAD must review all agent-generated audit reports before task generation. Findings must be validated, corrected if necessary, and missing issues added.

## Section X: Documentation Hygiene Enforcement

### X.1 Hard Line Count Limits

The following files have a maximum line count of 1000 lines:
- issues.md
- changelog.md
- decisions.md

When any of these files exceeds 1000 lines, the oldest content (all lines except the most recent 200) MUST be moved to ai-chat/archive/[filename]_archive_[YYYYMMDD_HHMM].md.

### X.2 Archival Format
- Archive Folder: ai-chat/archive/
- Filename Pattern: [original_name]_archive_[YYYYMMDD_HHMM].md
- Active File Header: "> Archived [DATE]: Content prior to line [X] moved to archive/[filename]_archive_[YYYYMMDD].md"
- Archive File Header: See templates/archival_header_template.md

### X.3 Pre-Flight Check Requirement
NO agent may begin coding without completing the Pre-Task Validation Checklist defined in README.md. Work performed without this checklist is INVALID.

### X.4 Weekly Hygiene Audit
DEBUG-LEAD must conduct a weekly audit checking:
- File line counts
- Duplicate detection in tables
- Unresolved placeholder detection
Results logged to ai-chat/audit_logs/weekly_hybrid_audit_[YYYYMMDD].md

### 8.2 XXE Protection & HTML Parsing
- **Safe Parser Configuration**: All XML/HTML parsing (e.g., BeautifulSoup) MUST use a hardened configuration. Default `lxml` is prohibited without protection.
- **Entity Constraints**: External entity resolution (`resolve_entities=False`) and network access (`no_network=True`) must be disabled.
- **Expansion Limits**: Maximum entity expansion depth is strictly limited. New Thresholds:

- **Parsing Timeout**: 5 seconds per document to prevent event loop starvation.
- **Tree Depth Limit**: 200 levels (protects against stack overflow).
- **Payload Size Limit**: 100MB hard limit (safeguards against extreme memory exhaustion while permitting modern SPAs).

## 9. Pydantic Environment Variable Sync Protocol
**One-to-One Mapping**: EVERY variable in `.env` Ã¢â‚¬â€ whether consumed by Python or Node.js Ã¢â‚¬â€ MUST have a corresponding field in the `app/config.py` `Settings` class. Node.js-only variables (e.g., `PORT`, `PYTHON_WEBHOOK_URL`, `WHATSAPP_SESSION_PATH`, `SQLITE_DB_PATH`) are declared with Python-appropriate defaults so they pass strict validation. Python code does not use them Ã¢â‚¬â€ they exist solely to satisfy `extra="forbid"`.

**Strict Validation (MANDATORY Ã¢â‚¬â€ FAIL-FAST-001)**: The `Settings` class MUST use `extra="forbid"` in `SettingsConfigDict`. `extra="ignore"` is **PROHIBITED**. This ensures the bot crashes immediately with a clear Pydantic validation error if `.env` contains an unknown variable (likely a typo) or a type mismatch, rather than starting in an invalid state and failing later with obscure errors. If a new env var causes a startup crash, the correct fix is to add it to the Settings class Ã¢â‚¬â€ NOT to relax validation.

**Shared `.env` File**: The `.env` file is shared between the Python backend and the Node.js gateway. Any new env var added to `.env` by either side MUST be declared in the `Settings` class. This is the contract for the shared file.

**Naming Convention**:
- `.env`: `SCREAMING_SNAKE_CASE` (e.g., `LID_MAX_DAILY_RESOLUTIONS`)
- `config.py`: `snake_case` (e.g., `lid_max_daily_resolutions`)

**Type Safety**: All fields must have explicit types (`int`, `str`, `bool`) and default values.

**Verification**: Before committing, run `python -c "from app.config import settings; print('OK')"` to ensure no validation errors.

**Enforcement**: Startup scripts (`start.sh`) are configured to automatically run this check and fail immediately with `Configuration Error` if the environment is misaligned.

## 13. AI Engine Standards (MANDATORY)
- **Dependency Injection**: All utility functions requiring DB access must explicitly accept a Session parameter; global state reliance or internal scoped sessions within utility functions are prohibited. Dependency Injection for DB sessions is mandatory for all stateful utilities.

## 21. General Debugging & Root-Cause Analysis Protocol (MANDATORY)

**Purpose:** Establish a standard workflow for diagnosing bugs, regressions, and
silent failures. Reduces reliance on ad-hoc investigation and ensures
traceability of root-cause findings.

### 21.1 Reproduction First
Before any code change, reproduce the bug with a minimal payload. Document:
- Exact input (webhook payload, command text, message content).
- Expected behavior.
- Actual behavior (including any exception type and message).
- Environment (DM vs Group, chat_id, sender_id, feature flags).

### 21.2 Log-Triage Order
When investigating a silent failure, check logs in this order:
1. `[SearchCheck]` Ã¢â‚¬â€ verifies `detect_search_intent()` was called on raw input.
2. `[MediaExtract]` Ã¢â‚¬â€ verifies media pipeline extraction path.
3. `[ManualHarvest]` Ã¢â‚¬â€ verifies contact harvest flow.
4. `mentioned_jids` vs `known_ids` Ã¢â‚¬â€ verifies bot identity resolution.
5. `this should not happen Ã¢â‚¬â€ Single-Response Contract violation flag` Ã¢â‚¬â€
   indicates a safety-net `except Exception` fired (per ADR-086).
6. `UnboundLocalError` / `NameError` Ã¢â‚¬â€ indicates a variable-scope bug.

### 21.3 Proactive Git History Tracing (The "Historian" Debugger)
To prevent hallucinating historical context or guessing why a line of code exists, the Debugger MUST proactively trace the repository's history before forming a hypothesis:
1. **Targeted Evolution**: Use `git log -S"function_name" -p` or `git log -L <start>,<end>:<file>` to trace how specific logic evolved over time.
2. **Contextual Blame**: Use `git blame <file>` to find the exact commit and PR that introduced a suspected bug or questionable logic.
3. **Git-Bisect Workflow (For obscure regressions)**:
   - Identify the last-known-good commit.
   - Identify the first-known-bad commit (current HEAD).
   - Run `git bisect start; git bisect bad <bad-commit>; git bisect good <good-commit>`.
   - Test each step and mark `good` or `bad`.
4. Once the history is established, document the culprit commit and the historical ADR in the bug investigation report.

### 21.4 Regression Test Authoring (MANDATORY)
Every bug fix MUST include a regression test that:
1. Fails BEFORE the fix (reproduces the bug).
2. Passes AFTER the fix.
3. Is named descriptively (e.g., `test_media_only_message_does_not_raise_unboundlocalerror`).
4. Lives in the appropriate test directory:
   - `tests/integration/gateway_backend/` for router-level flows.
   - `tests/services/` for service-level logic.
   - `tests/` (root) for unit-level tests.

### 21.4.1 Structural Regression Tests (RECOMMENDED)

When a bug reveals a **class** of mistake that could recur elsewhere (not just a single-instance bug), add a STRUCTURAL regression test that scans the codebase for the pattern. Structural tests catch entire bug classes, not just instances — they are higher-value than single-instance regression tests.

**Examples of structural tests:**

- A test that scans ALL active vars in `.env.example` and verifies each is declared as a `Settings` field in `app/config.py`. This catches the "missing Settings field" bug class (CONFIG-SCHEMA-001) automatically.
- (future) A test that scans for `logger.warning` calls without corresponding test assertions.
- (future) A test that scans for `except Exception` blocks without the "this should not happen" flag string.

**When to add a structural test:**

1. A bug fix that addresses a rule already documented in SOP/PROJECT_RULES but was missed anyway. The structural test enforces the rule automatically — future agents can't miss it even if they skip reading the docs.
2. A bug that has occurred more than once (a recurrence). The structural test breaks the recurrence loop.
3. A pattern that's easy to grep for (e.g., "env var declared in .env.example but not in Settings class").

**Pattern:** Structural tests are typically static-analysis tests that read source files and assert on content (regex matches, set differences, etc.). They run fast and don't require DB or network.

**Allowlist for legacy violations:** When adding a structural test, the codebase may have pre-existing violations that pre-date the rule. Document these in an `ALLOWED_VIOLATIONS` set/dict in the test, with a comment explaining why each is allowed. This prevents the test from blocking on technical debt while still catching NEW violations. The goal is monotonic improvement — new code must obey the rule, old code is grandfathered until cleaned up.

### 21.5 Safety-Net `except` Block Convention
All safety-net `except Exception` blocks in user-facing request handlers MUST:
1. Log with the literal string `"this should not happen Ã¢â‚¬â€ Single-Response Contract violation flag"` (per ADR-086).
2. Send a user-visible fallback message when `not reply_sent` (per ADR-086).
3. Be wrapped in try/except to prevent cascading failures.

### 21.6 Investigation Documentation
For non-trivial bugs, create an investigation file at
`ai-chat/investigations/investigation_<bug-name>.md` with:
- Bug description.
- Root cause.
- Files/lines implicated.
- Fix applied (or proposed).
- Commit references.
- Regression test reference.

### 21.7 References
- ADR-086 (Error Visibility & User-Facing Fallbacks).
- ADR-057 (LLM Retry & Graceful Fallback).
- Ã‚Â§2 Single-Response Contract.
- Ã‚Â§14 Mention Resolution Debugging Protocol.
- Section Z Emergency Procedures.
