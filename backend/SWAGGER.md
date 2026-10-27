# Swagger implementation notes

## Files and request flow

1. [`openapi.json`](./openapi.json) is the OpenAPI 3.1 description for health, catalog, authentication, cart, and order routes. Request schemas, response schemas, query parameters, status codes, and cookie authentication are described here.
2. [`package.json`](./package.json) installs `swagger-ui-express` as a backend runtime dependency.
3. [`src/app.ts`](./src/app.ts) reads `openapi.json`, replaces the spec's default server with `PUBLIC_API_URL`, serves the spec at `GET /api/openapi.json`, and serves Swagger UI at `/api/docs`.
4. [`src/config/env.ts`](./src/config/env.ts) validates `PUBLIC_API_URL`, defaulting to `http://localhost:4000/api`.

## Try it

```sh
cd backend
npm ci
npm run db:generate
npm run dev
```

Open <http://localhost:4000/api/docs>. Use `POST /auth/signup` or `POST /auth/signin` to establish the HTTP-only cookie, then try `GET /cart` or the order endpoints. The OpenAPI JSON is available separately at <http://localhost:4000/api/openapi.json>.

Set `PUBLIC_API_URL` to the backend's externally reachable API base URL to make the Swagger server selector use the deployed backend. Set `CORS_ORIGIN` to the frontend origin to allow browser requests from the separately hosted frontend.
