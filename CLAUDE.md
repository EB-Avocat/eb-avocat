# eb-avocat

Monorepo for Eva Biezunski's website.

- `frontend/` — Next.js 16 (App Router, React 19, Tailwind 4). Bun is the package manager and
  task runner (`bun install`, `bun run <script>`, `bunx`). Biome for lint/format, Vitest for
  tests, Playwright for a11y e2e. All site copy is French and lives in `src/lib/constants.ts`.
- `backend/` — Django + Django REST Framework API (articles, categories, users) and the MCP
  endpoint. Managed with **uv**; **ruff** for lint/format/import sorting; **ty** for type
  checking; **pytest** for tests. All models use **UUID primary keys**.

## Commands

Run from the repo root:

- `tox -e dev` — full local stack in Docker (Postgres + backend + frontend).
- `tox -e lint,type,test` — backend checks.
- `tox -e frontend` — frontend lint, typecheck and tests.

Inside `frontend/`: `bun run dev|build|lint|typecheck|test|test:a11y`.
Inside `backend/`: `uv run manage.py <cmd>`, `uv run ruff check`, `uv run ty check`, `uv run pytest`.
