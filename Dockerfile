FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV DATABASE_URL=postgresql://glow:glow_dev_password@localhost:5432/glow_cosmetics
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci
COPY . .
RUN npm --workspace @glow/backend run db:generate

FROM base AS build
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

FROM node:20-bookworm-slim AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/frontend/package.json ./frontend/package.json
RUN npm ci --omit=dev --workspace @glow/backend
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/src/generated ./backend/src/generated
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=build /app/backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
CMD ["sh", "backend/docker-entrypoint.sh"]

FROM node:20-bookworm-slim AS web
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --from=build /app/frontend/public ./frontend/public
EXPOSE 3000
CMD ["node", "frontend/server.js"]
