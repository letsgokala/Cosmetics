# Sahle Cosmetics Backend

Standalone Express API and PostgreSQL service. The API source, Prisma schema, migrations, and Swagger/OpenAPI docs live in this folder; it does not depend on the frontend project.

## Run locally

Requirements: Node.js 20.19+, npm 10+, and Docker Compose for PostgreSQL.

```sh
cp .env.example .env
```

Edit the local `.env`: set a strong `SESSION_SECRET`, database password, public API URL, and `CORS_ORIGIN` for the frontend site. Then run:

```sh
docker compose up -d db
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

The `db` container is required when the API runs directly with Node. It
publishes PostgreSQL on `127.0.0.1:5433`, so keep the local `DATABASE_URL`
pointed at `localhost:5433`. If the container is not running, Prisma reports
`P1001: Can't reach database server`.

The API listens at <http://localhost:4000>. `npm run dev`, `npm run build`, `npm start`, `npm run typecheck`, `npm run lint`, and `npm test` are backend-only commands.

Every API request is logged with its method, URL, origin, whether a session
cookie was present, response status, and duration. When running with Docker,
watch the API terminal with:

```sh
docker compose logs -f api
```

Frontend requests are logged in the browser developer tools Console with the
full API URL, request status, duration, and authentication redirect target.
Passwords, cookie values, and request bodies are never logged.

To run the backend, frontend, and PostgreSQL database in Docker:

```sh
docker compose up --build -d
```

The Compose default builds the frontend with
`http://localhost:4000/api`. For a deployed stack, set these values in the
Compose environment before building:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
CORS_ORIGIN=https://shop.example.com
PUBLIC_API_URL=https://api.example.com/api
DATABASE_URL=postgresql://USER:PASSWORD@DATABASE_HOST:5432/DATABASE?schema=public
SESSION_SECRET=use-a-random-secret-at-least-32-characters-long
```

`NEXT_PUBLIC_API_BASE_URL` is embedded into the frontend at image build time,
so changing it requires rebuilding the frontend image. `CORS_ORIGIN` must be
the public frontend origin, without a path. Keep database credentials and the
session secret private.

Stop containers with `docker compose down`; database data stays in a Docker volume. `docker compose down -v` removes that database.

## Swagger UI

Open <http://localhost:4000/api/docs>. The raw OpenAPI document is at <http://localhost:4000/api/openapi.json>.

The spec is maintained in [`openapi.json`](./openapi.json). `src/app.ts` loads that document, sets its server URL from `PUBLIC_API_URL`, exposes the JSON endpoint, and mounts `swagger-ui-express` at `/api/docs`. The cookie authentication scheme is named `sessionCookie` and documents the `glow_session` HTTP-only cookie.

## Owner access

Create or update the owner account using environment variables and the one-time
bootstrap command:

```sh
OWNER_NAME="Sahle Owner" OWNER_EMAIL="owner@example.com" \
OWNER_PASSWORD="use-a-long-unique-password" npm run owner:create
```

Owner endpoints are protected by the `owner` role and are available under
`/api/owner`. Never make the first customer account an owner automatically.

To try a protected operation in Swagger, use `POST /auth/signup` or `POST /auth/signin` first. The browser stores the session cookie; Swagger UI sends it with same-origin requests. Requests from the UI are restricted by `CORS_ORIGIN` and the API's origin check.

For a deployed backend, set `PUBLIC_API_URL` to the externally reachable API base URL, including `/api` (for example, `https://your-api.example/api`). Then `/api/docs` uses that host in its server selector. Keep the session secret and database credentials private.

Also set `DATABASE_URL` to the connection string supplied by the production
PostgreSQL service. Do not copy the local `localhost:5433` value into a
deployment: `localhost` refers to the API machine/container, not a separate
database service. If the API and database are deployed with this Compose file,
the API uses the internal `db:5432` URL automatically; if they are deployed
separately, use the database provider's external host, port, credentials, and
TLS options.

See [`SWAGGER.md`](./SWAGGER.md) for the implementation details and where to make changes.
