# Stage 1: build frontend
FROM oven/bun:1 AS frontend-builder

WORKDIR /usr/src/app

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/ .
RUN bun run build

# Stage 2: build backend
FROM golang:1.25 AS backend-builder

WORKDIR /usr/src/app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /usr/local/bin/app ./main

# Stage 3: final image
FROM alpine:latest

WORKDIR /usr/src/app

COPY --from=backend-builder /usr/local/bin/app /usr/local/bin/app
COPY --from=frontend-builder /usr/src/app/dist ./dist

EXPOSE 8080
CMD ["app"]
