# --- Build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 precisa compilar binários nativos
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm rebuild better-sqlite3

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
