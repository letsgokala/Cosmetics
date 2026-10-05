# Glow Cosmetics

A small cosmetics catalog for an Addis Ababa shop. The repository is an npm-workspaces monorepo with a distinct `frontend/` (Next.js App Router) and `backend/` (Express REST API and Prisma) folder; PostgreSQL stores catalog data. Product data is fictional placeholder content; the site is a catalog and has no checkout, accounts, or order processing.

Store name, wordmark, currency code and formatting, and placeholder contact details live in `frontend/lib/store-config.ts`.

## Quick start with Docker

Requirements: Docker Engine with the Compose plugin. From the repository root:

```sh
cp .env.example .env
docker compose up --build -d
```

Open <http://localhost:3000>. The API health check is at <http://localhost:4000/api/health>. Compose stores PostgreSQL data in a named volume. Set strong `POSTGRES_PASSWORD` and appropriate public origins in `.env` before exposing the app to the internet. `.env` is ignored by Git.

Stop the services with `docker compose down`; data stays in the volume. To remove the local database and its contents, use `docker compose down -v`.

## Local development

Requirements: Node.js 20.19+, npm 10+, and Docker (for PostgreSQL).

```sh
cp .env.example .env
docker compose up -d db
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

The frontend is at <http://localhost:3000> and the API at <http://localhost:4000>. The `dev` command starts both. Set `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, and `NEXT_PUBLIC_API_BASE_URL` in `.env` to adjust local configuration. The web API URL is public browser configuration; never put secrets in `NEXT_PUBLIC_*` variables.

The split folders are independently runnable npm workspaces: `npm run dev:frontend` starts only the frontend and `npm run dev:backend` starts only the backend. The root scripts handle the database setup and run both together.

Useful commands:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Playwright's browser binaries may need to be installed once with `npx playwright install chromium` before the browser tests run.

## API

All successful responses use `{ "data": ... }`; paginated responses also include `{ "meta": { "page", "limit", "total", "totalPages" } }`. Errors use `{ "error": { "code", "message" } }`. Invalid input returns `400`, missing records return `404`, and unexpected failures return a generic `500` response (stack details are only logged outside production).

| Method and path              | Behavior                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `GET /api/health`            | Process health                                                                         |
| `GET /api/categories`        | Active categories and active product counts                                            |
| `GET /api/products`          | Active products; `q`, `category`, `page` (default 1), `limit` (default 12, maximum 50) |
| `GET /api/products/:slug`    | Active product by slug                                                                 |
| `GET /api/products/featured` | Active featured products; accepts pagination parameters                                |

Prices are stored in PostgreSQL `DECIMAL(12,2)` and serialized as decimal strings. API filtering uses Prisma parameterized queries. CORS is controlled by `CORS_ORIGIN` (comma-separated origins).

## Database changes

Create and apply a development migration with `npm run db:migrate -- --name <change-name>`. Production uses `npm run db:deploy` to apply committed migrations. Refresh local sample data with `npm run db:seed`; the seed is repeatable and clearly marks its content as placeholder data.

## Production notes

The Dockerfile builds the web and API images from the same source; Compose provides PostgreSQL, API, and web services. The API container applies committed migrations and inserts any missing placeholder rows on startup. For a public deployment, configure TLS and a reverse proxy or hosting platform, secure the database password, restrict `CORS_ORIGIN` to the actual storefront origin, and back up the database volume. Local SVG artwork is bundled with the frontend, so the catalog does not rely on remote image services.
