# Stage 1: Build the Vite/React app
FROM node:20.19-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve the static build using Caddy
FROM caddy:2.8-alpine

WORKDIR /app

# Caddy will read $PORT at runtime (Caddyfile uses :{$PORT})
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /app/dist

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
