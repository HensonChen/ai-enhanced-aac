# AGENTS.md

## Project overview

**ai-enhanced-aac** is intended to be an AI-enhanced Augmentative and Alternative Communication (AAC) web application. The repository currently contains only a Next.js-oriented `.gitignore` (no `package.json`, source, or README yet). When application code is added, expect a **Node.js / Next.js** stack deployable to Vercel.

## Cursor Cloud specific instructions

### Repository state

Until `package.json` and app source exist under `/workspace`, there is nothing to lint, test, or run from this repo. The VM update script only runs `npm install` when `package.json` is present.

### Runtime (when the app exists)

| Task | Command (typical Next.js) |
|------|---------------------------|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Test | `npm test` (if configured) |
| Production build | `npm run build` |

Use **tmux** for long-running dev servers (see Cloud Agent shell guidance). Default Next.js dev URL is `http://localhost:3000` unless overridden with `-p`.

### Toolchain verified in Cloud VM (Jun 2026)

Node **v22.22.x** and npm are available system-wide. A throwaway Next.js 16 app under `/tmp` was used to confirm `npm run lint`, `npm run build`, and `npm run dev` succeed; that smoke app is **not** part of this repository.

### Services

No backend, database, or Docker services are defined in the repo yet. Future E2E testing may require external APIs (speech, LLM, auth); document those in `.env.example` when added.

### Gotchas

- Reinstalling dependencies while a dev server is running may require restarting the server for new packages to load.
- `.env` and `.env*.local` are gitignored; configure secrets via Cursor Cloud secrets or local env files, not committed files.
