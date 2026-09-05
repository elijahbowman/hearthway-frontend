# syntax=docker/dockerfile:1

# --- Build ---
# Node 20 matches .nvmrc (Angular 17 doesn't support Node 22).
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Serve ---
FROM nginx:1.28-alpine

# The official image renders /etc/nginx/templates/*.template with envsubst at startup.
ENV BACKEND_URL=http://backend:8080
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/hearthway-frontend/browser /usr/share/nginx/html

EXPOSE 80
