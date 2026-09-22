# Eva Biezunski — Avocate

Marketing website for **Eva Biezunski**, a business-law attorney (avocate au Barreau de Lyon)
specialising in supporting self-employed healthcare professionals (médecins, dentistes,
kinésithérapeutes…).

The site is a single-page presentation covering her practice areas — company formation,
patientèle transfers, professional contracts, legal advice, litigation and compliance — along
with a digital business card (`/carte`) that exposes a downloadable vCard, and a
**Publications** section (`/publications` + the 3 latest articles on the home page) managed
from a private back-office or directly from Claude Code (MCP).

The repo is a monorepo:

- `frontend/` — the Next.js site **and** the back-office UI (served under a secret path).
- `backend/` — Django + Django REST Framework API (articles, categories, users) and the MCP endpoint.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) with React 19
- [Tailwind CSS 4](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) icons
- [Biome](https://biomejs.dev/) for linting and formatting
- [Vitest](https://vitest.dev/) + Testing Library for tests
- [Bun](https://bun.com/) as the package manager and task runner
- [Tiptap](https://tiptap.dev/) (Markdown-backed, Notion-style editor) in the back-office
- Backend: [Django](https://www.djangoproject.com/) + [DRF](https://www.django-rest-framework.org/),
  PostgreSQL, [uv](https://docs.astral.sh/uv/), [ruff](https://docs.astral.sh/ruff/),
  [ty](https://docs.astral.sh/ty/), pytest, the official [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

## Local stack (Docker + tox)

Requires Docker and tox (`uv tool install tox`).

```sh
tox -e dev     # Postgres + Django (:8000) + Next.js (:3000), with hot reload
tox -e seed    # in another terminal: dev admin + demo articles
```

- Site: http://localhost:3000 — Publications: http://localhost:3000/publications
- Back-office: http://localhost:3000/admin-dev (`admin@example.com` / `admin-dev-password`)
- `tox -e down` stops the stack; `tox -e lint,type,test` runs ruff, ty and pytest
  (needs `docker compose up -d db`); `tox -e fmt` formats; `tox -e frontend` runs the Bun checks.

### Tests and API types

- Backend tests live in `backend/tests/`. `tox -e test` runs them with coverage and **fails under
  90%** (configured in `backend/pyproject.toml`).
- The API contract is generated, not hand-written. drf-spectacular produces `backend/openapi.yaml`,
  and [openapi-typescript](https://openapi-ts.dev/) turns it into `frontend/src/lib/api/schema.ts`,
  which the frontend imports for every request and response type. After changing a serializer or a
  view, run `tox -e api-types` and commit both files. A backend test and the `api-types` CI job fail
  when they are stale. The generator lives in `frontend/tools/api-types` with its own TypeScript 5,
  because openapi-typescript needs the TS 5 compiler API and the app uses TypeScript 7.

## Publications back-office

The back-office lives at `/${BACKOFFICE_PATH}` (e.g. `/admin-3f9c…`), set with the
`BACKOFFICE_PATH` env var on both services. `frontend/src/proxy.ts` rewrites that prefix to the
internal `/backoffice` routes, which are not reachable directly. Pages are `noindex`.

- **Articles** — Notion-style editor (`/` menu for blocks, formatting bubble, drag handles, paste or
  drop images), with **Visuel / Markdown / Aperçu** tabs. The Aperçu tab renders the article with
  the public page's own component. Markdown is the source of truth; the backend renders and
  sanitises it. Articles are drafts until published; a future date schedules them.
- **Images** — every upload is straightened (phone orientation), stripped of its metadata and
  re-encoded as WebP:
  - **covers**: fixed 16:9, 1920×1080;
  - **avatars**: square, 512×512;
  - **article images**: capped at 1600 px wide.

  For covers and avatars the original is kept, along with the crop. A Notion-style crop dialog
  (drag + zoom) opens after each upload, and **Recadrer** reframes from the original at any time.
  Covers can come from the computer or from a web URL: the server downloads the image and stores
  it (Vercel Blob in production), keeping the source URL for history. `manage.py process_images`
  converts covers and avatars stored before this processing existed.
- **Categories** — free-form, created from the editor or the Categories page. The star marks a
  **primary** category: primary categories are the main filters on `/publications`.
- **Roles** — *Administrateur* (users and roles + everything), *Éditeur* (all articles and
  categories), *Auteur* (own articles).
- **Profile** — name, e-mail, password, avatar, and API tokens.

### Claude Code (MCP)

Create a token in **Mon profil → Claude Code (MCP)**. The page shows the command to run:

```sh
claude mcp add --transport http eb-avocat https://<domain>/mcp --header "Authorization: Bearer eba_…"
```

Tools: `list_articles`, `get_article`, `create_article` (draft by default), `update_article`,
`publish_article`, `unpublish_article`, `delete_article`, `set_article_cover` (URL or base64
file), `list_categories`, `create_category`. They apply the token owner's role.

## Frontend only

Requires [Bun](https://bun.com/) (CI pins `1.3.14`). Set `BACKEND_URL=http://localhost:8000` to
use a running backend; without it the Publications pages show their empty state.

```sh
cd frontend
bun install
bun run dev
```

The dev server runs with Turbopack at http://localhost:3000.

## Contact form (Brevo)

The contact form posts to `POST /api/contact`, which sends Eva a transactional email via the
[Brevo](https://www.brevo.com/) API (with the visitor set as `reply-to`). Configure these
environment variables — see [`env.example`](frontend/env.example):

| Variable             | Required | Description                                                        |
| -------------------- | -------- | ------------------------------------------------------------------ |
| `BREVO_API_KEY`      | yes      | Brevo API key (SMTP & API → API Keys).                             |
| `BREVO_SENDER_EMAIL` | yes      | Verified sender email/domain in Brevo (the "from" address).        |
| `BREVO_TO_EMAIL`     | no       | Recipient; defaults to the public contact email in `constants.ts`. |

Set them in `.env.local` for local dev, and in the Vercel project (Production + Preview) for
deployment. The sender must be a **verified sender/domain** in your Brevo account.

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `bun run dev`       | Start the dev server (Turbopack)             |
| `bun run build`     | Production build                             |
| `bun run start`     | Serve the production build                   |
| `bun run test`      | Run the test suite once                      |
| `bun run test:watch`| Run tests in watch mode                      |
| `bun run typecheck` | Type-check with `tsc --noEmit`               |
| `bun run lint`      | Lint and format check with Biome             |
| `bun run format`    | Format the codebase with Biome               |

## Project structure

```
frontend/src/
├── proxy.ts          # Secret back-office path rewrite
├── app/              # App Router routes and layout
│   ├── page.tsx      # Home page (assembles the section components)
│   ├── layout.tsx    # Root layout, metadata and JSON-LD
│   ├── carte/        # Digital business card + vCard route
│   ├── publications/ # Article list + article pages
│   └── backoffice/   # Back-office screens (reached via /${BACKOFFICE_PATH})
├── components/       # Page sections (Hero, About, Services, …) and UI primitives
├── hooks/            # useIntersectionObserver, useScrollSpy
├── lib/              # constants (site content) and vCard generation
└── __tests__/        # Vitest + Testing Library tests
public/
├── fonts/            # Museo font family
└── images/           # Logos, favicon, portrait
```

The backend lives in `backend/` (`accounts`, `articles`, `core`, `config` apps); its
environment is documented in [`backend/env.example`](backend/env.example).

Site content (text, services, contact details, testimonials) lives in
[`src/lib/constants.ts`](frontend/src/lib/constants.ts) and is fully in French.

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push to `main` and on pull
requests: the frontend job runs lint/format, type-check and tests with Bun, and the backend job
runs `tox -e lint,type,test` against a Postgres service.

## Deployment (Vercel)

One Vercel project deploys both apps through **Vercel Services** ([`vercel.json`](vercel.json)):
`/api/v1/*` and `/mcp` go to Django and everything else goes to Next.js. The services reach each
other through bindings (`BACKEND_INTERNAL_URL`, `FRONTEND_INTERNAL_URL`). The project's Root
Directory must be the repo root.

Database: Neon Postgres from the Marketplace (`DATABASE_URL`). Media: a Vercel Blob store
(`BLOB_READ_WRITE_TOKEN`, `STORAGE_BACKEND=vercel_blob`). Also set `SECRET_KEY`,
`ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `SITE_URL`, `REVALIDATE_SECRET` and `BACKOFFICE_PATH`,
plus `EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD` for password-reset e-mails through Brevo SMTP.
Migrations run in the backend's build step.
