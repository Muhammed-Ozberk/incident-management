#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
BACKEND_COMPOSE="$ROOT_DIR/backend/docker-compose.yml"
FRONTEND_COMPOSE="$ROOT_DIR/frontend/docker-compose.yml"

command="${1:-up}"

case "$command" in
  up)
    docker compose -f "$BACKEND_COMPOSE" --env-file "$ROOT_DIR/backend/.env" up -d --build
    docker compose -f "$FRONTEND_COMPOSE" up -d --build
    printf '\nIncident stack is running:\n'
    printf '  Frontend: http://localhost:%s\n' "${FRONTEND_PORT:-3000}"
    printf '  Backend:  http://localhost:%s\n' "${BACKEND_PORT:-3001}"
    printf '  Swagger:  http://localhost:%s/api-docs\n' "${BACKEND_PORT:-3001}"
    ;;
  down)
    docker compose -f "$FRONTEND_COMPOSE" down
    docker compose -f "$BACKEND_COMPOSE" down
    ;;
  restart)
    "$0" down
    "$0" up
    ;;
  logs)
    docker compose -f "$BACKEND_COMPOSE" logs -f &
    backend_logs_pid=$!
    docker compose -f "$FRONTEND_COMPOSE" logs -f &
    frontend_logs_pid=$!
    wait "$backend_logs_pid" "$frontend_logs_pid"
    ;;
  ps)
    docker compose -f "$BACKEND_COMPOSE" ps
    docker compose -f "$FRONTEND_COMPOSE" ps
    ;;
  build)
    docker compose -f "$BACKEND_COMPOSE" build
    docker compose -f "$FRONTEND_COMPOSE" build
    ;;
  *)
    printf 'Usage: %s [up|down|restart|logs|ps|build]\n' "$0" >&2
    exit 1
    ;;
esac
