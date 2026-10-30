# Glow Cosmetics Frontend

Standalone Next.js storefront. This folder can be installed, developed, built, containerized, and deployed separately from `backend/`.

## Run locally

Requirements: Node.js 20.19+ and npm 10+.

```sh
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the backend's API base URL, including `/api`. The existing local `.env.local` is configured with the backend URL supplied for this project; its health endpoint returned HTTP 200 during setup. If the backend is running locally, use `http://localhost:4000/api`.

Then run:

```sh
npm ci
npm run dev
```

The storefront opens at <http://localhost:3000>. Frontend-only commands are `npm run build`, `npm start`, `npm run typecheck`, `npm run lint`, and `npm test`.

The frontend sends browser requests directly to `NEXT_PUBLIC_API_BASE_URL`. For a hosted frontend, configure the backend's `CORS_ORIGIN` to that frontend origin.

## Docker

Build the frontend independently:

```sh
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api -t glow-frontend .
docker run --rm -p 3000:3000 glow-frontend
```

The API URL is embedded in the frontend bundle during `docker build`; provide the public backend URL as the build argument when deploying.

When using the full-stack Compose setup from `../backend`, set
`NEXT_PUBLIC_API_BASE_URL` before running `docker compose up --build`. It must
be the URL that a user's browser can reach, not the Docker service name
`api` and not `localhost` in a deployed environment.
