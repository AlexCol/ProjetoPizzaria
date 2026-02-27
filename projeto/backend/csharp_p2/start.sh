#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo ".env nao encontrado em: $ENV_FILE"
  exit 1
fi

#! Export variables from .env for this shell (dotnet run will inherit them)
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"

  # Skip comments/blank lines
  case "$line" in
    ''|\#*) continue ;;
  esac

  if [[ "$line" == *"="* ]]; then
    key="${line%%=*}"
    value="${line#*=}"
    export "$key=$value"
  fi
done < "$ENV_FILE"

#! Start Postgres container
POSTGRES_COMPOSE_FILE="$SCRIPT_DIR/../docker/postgres/docker-compose.yml"
if [ ! -f "$POSTGRES_COMPOSE_FILE" ]; then
  echo "docker-compose nao encontrado em: $POSTGRES_COMPOSE_FILE"
  exit 1
fi
docker compose --env-file "$ENV_FILE" -p pizzaria -f "$POSTGRES_COMPOSE_FILE" up -d

#! Start Redis container
REDIS_COMPOSE_FILE="$SCRIPT_DIR/../docker/redis/docker-compose.yml"
if [ ! -f "$REDIS_COMPOSE_FILE" ]; then
  echo "docker-compose nao encontrado em: $REDIS_COMPOSE_FILE"
  exit 1
fi
docker compose --env-file "$ENV_FILE" -p pizzaria -f "$REDIS_COMPOSE_FILE" up -d

#! Run .NET application
cd "$SCRIPT_DIR"
dotnet run
