# --- Build do frontend (Angular) ---
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# Caminho relativo: funciona em qualquer dominio, pois frontend e backend sao servidos juntos
RUN sed -i "s#urlApi: '.*'#urlApi: '/api'#" src/app/nucleo/configuracao/ambiente.ts

RUN npm run build

# --- Build do backend (NestJS) ---
FROM node:20-bookworm-slim AS backend-build
WORKDIR /app/backend

# better-sqlite3 precisa compilar binarios nativos
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# --- Runtime: backend serve a API e os arquivos estaticos do frontend ---
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm rebuild better-sqlite3 && mkdir -p /app/dados

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist/autocenter-web/browser ./public

EXPOSE 3000
CMD ["node", "dist/main"]
