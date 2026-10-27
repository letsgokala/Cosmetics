# Glow Cosmetics Backend

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

The API listens at <http://localhost:4000>. `npm run dev`, `npm run build`, `npm start`, `npm run typecheck`, `npm run lint`, and `npm test` are backend-only commands.

To run the backend and its PostgreSQL database in Docker:

```sh
docker compose up --build -d
```

Stop containers with `docker compose down`; database data stays in a Docker volume. `docker compose down -v` removes that database.

## Swagger UI

Open <http://localhost:4000/api/docs>. The raw OpenAPI document is at <http://localhost:4000/api/openapi.json>.

The spec is maintained in [`openapi.json`](./openapi.json). `src/app.ts` loads that document, sets its server URL from `PUBLIC_API_URL`, exposes the JSON endpoint, and mounts `swagger-ui-express` at `/api/docs`. The cookie authentication scheme is named `sessionCookie` and documents the `glow_session` HTTP-only cookie.

To try a protected operation in Swagger, use `POST /auth/signup` or `POST /auth/signin` first. The browser stores the session cookie; Swagger UI sends it with same-origin requests. Requests from the UI are restricted by `CORS_ORIGIN` and the API's origin check.

For a deployed backend, set `PUBLIC_API_URL` to the externally reachable API base URL, including `/api` (for example, `https://your-api.example/api`). Then `/api/docs` uses that host in its server selector. Keep the session secret and database credentials private.

See [`SWAGGER.md`](./SWAGGER.md) for the implementation details and where to make changes.
