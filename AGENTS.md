<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context Rules

Before doing substantial analysis, planning, or implementation work on this repository, read:

1. `ai_context/README.md`
2. the context files referenced there, following the documented reading order

Treat the files in `ai_context/` as the shared project context for product scope, domain rules, roles, user flows, database assumptions, technical baseline, and open questions.

# Working Rules For This Repo

* Do not invent domain rules that conflict with `ai_context/`.
* If implementation decisions depend on unresolved product choices, check `ai_context/open_questions.md` first.
* If a task changes product scope, domain behavior, permissions, or major technical direction, update the relevant file in `ai_context/` before or together with the code change.
* Use `ai_context/prisma_model.md` and `ai_context/db.md` as the baseline reference for the current data model until the real Prisma schema is introduced or updated.

# Step Completion Checklist

At the end of every planning step:

1. Run `npx tsc --noEmit` — fix any TypeScript errors before committing.
2. Run `npm run build` — verify the production build completes without errors.
3. Commit everything including `.claude/` and `ai_context/.claude/`.
