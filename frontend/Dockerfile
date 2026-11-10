# --- Build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# URL publica da API (acessada pelo navegador do usuario, nao pela rede interna do Docker)
ARG API_URL=http://viniback.187.33.201.107.sslip.io/api
RUN sed -i "s#urlApi: '.*'#urlApi: '${API_URL}'#" src/app/nucleo/configuracao/ambiente.ts

RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist/autocenter-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
