# Hotfix Lesson Template

> **Use this template when a hotfix is needed within 24h of shipping a change.**
> Append the filled-in entry to `ai-chat/changelog.md` at the TOP (most recent first).
> The goal is to create a feedback loop: over time, accumulated lessons become
> a dataset of "what agents commonly miss" that informs prompt + SOP improvements.

---

```markdown
### fix(<scope>): ADR-XXX hotfix — <one-line description> — <YYYY-MM-DD>

**<What broke and how it was caught — 1-2 sentences>**

Root cause: <technical cause — what specific code/config was missing or wrong>

Process gap: <WHY did the existing SOP/PROJECT_RULES not catch this?>
- Was the relevant rule documented? (Yes/No — link to SOP/PROJECT_RULES section)
- Was the rule in the agent's prompt checklist? (Yes/No — link to template file)
- Was there a regression test? (Yes/No — link to test file)
- Was the pre-commit check run? (Yes/No — `python -c "from app.config import settings; print('OK')"` etc.)

Fix: <what was changed — files + summary>

Lesson: <one-sentence takeaway for future agents — the "if you remember nothing else, remember this">

Prevention: <what doc/test/process change was made to prevent recurrence>
- <doc change>: <file — what was added>
- <test change>: <file — what was added>
- <process change>: <SOP/template — what was added>
```

---

## Example (filled in from the ADR-190 hotfix)

```markdown
### fix(config): ADR-190 hotfix — add 5 missing Settings fields for STARTUP-RACE-002 env vars — 2026-07-14

**The STARTUP-RACE-002 fix shipped without declaring the 5 new env vars as fields
in app/config.py Settings class. ADR-060's extra="forbid" fail-fast config
validation caught this exactly as designed — the bot crashed at startup with
"Extra inputs are not permitted" for all 5 vars.**

Root cause: I added BACKEND_HEALTH_POLL_MS, BACKEND_HEALTH_TIMEOUT_MS,
BACKEND_QUEUE_MAX, WHATSAPP_CACHE_DEBUG, and LOG_HTTPX_DEBUG to .env.example
but forgot to add them as Settings fields. start.sh's env-sync logic copied all
5 to the user's .env, then the pre-flight config check failed because
extra="forbid" rejects any .env var not declared in Settings.

Process gap: The rule IS documented in PROJECT_RULES §5 (CONFIG-SCHEMA-001) and
SOP §9, but:
- Was the relevant rule documented? **Yes** — PROJECT_RULES §5, SOP §9.
- Was the rule in the agent's prompt checklist? **No** — CODER_PROMPT.md did
  not include the config validation check.
- Was there a regression test? **No** — no structural test scanned .env.example
  for missing Settings fields.
- Was the pre-commit check run? **No** — the manual
  `python -c "from app.config import settings; print('OK')"` step was documented
  in PROJECT_RULES §5 but not enforced.

Fix: Added 5 Settings fields to app/config.py + fixed .env.example boolean
syntax + updated app/main.py and events.js to accept Python-style booleans +
added 2 regression tests.

Lesson: Every env var documented in .env.example MUST be declared as a Settings
field in app/config.py, even if the primary consumer is Node.js or start.sh.
ADR-060's extra="forbid" enforces this at startup — there is no escape hatch.

Prevention (ADR-191):
- doc change: SOP §1.2 (Common Pitfalls) + §2.1.1 (Pre-Commit Config Validation)
  + §21.4.1 (Structural Regression Tests) added.
- doc change: PROJECT_RULES — Top-5-rules callout added at top of file.
- doc change: CODER_PROMPT.md — config validation added to MANDATORY checklist.
- doc change: VERIFIER_PROMPT.md — config validation gate added (REJECT PR on fail).
- doc change: STARTUP_ARCHITECTURE.md — troubleshooting entry for config error.
- test change: tests/unit/ops/test_startup_race_002.py —
  test_every_env_example_var_is_declared_in_settings (structural regression test).
- process change: hotfix_lesson_template.md — this template, for future hotfixes.
```

---

## When to use this template

Use this template when ALL of the following are true:
1. A hotfix was needed within 24h of shipping a change.
2. The bug was a process gap (rule existed but wasn't followed), not a novel bug.
3. The fix includes a prevention change (doc/test/process), not just a code fix.

If the bug was a novel bug (no existing rule covered it), use the normal
changelog entry format and create a new ADR + SOP rule instead.
