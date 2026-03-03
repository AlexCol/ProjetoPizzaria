#!/usr/bin/env bash ## linha shebang para Bash, usando o interpretador encontrado no PATH do sistema

#######################################################################################
#! Script para iniciar o ambiente de desenvolvimento do backend C# (P2)
#######################################################################################
PROJ_NAME="pizzaria"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo ".env nao encontrado em: $ENV_FILE"
  exit 1
fi

#######################################################################################
#! Export variables from .env for this shell (dotnet run will inherit them)
#######################################################################################
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

#######################################################################################
#! Start database container (Postgres or Oracle)
#######################################################################################
DB_TYPE_LOWER="$(echo "${DB_TYPE:-}" | tr '[:upper:]' '[:lower:]')"
DB_COMPOSE_FILE=""

case "$DB_TYPE_LOWER" in
  postgres)
    DB_COMPOSE_FILE="$SCRIPT_DIR/docker/postgres/docker-compose.yml"
    ;;
  oracle)
    DB_COMPOSE_FILE="$SCRIPT_DIR/docker/oracle/docker-compose.yml"
    ;;
  *)
    echo "DB_TYPE invalido: '${DB_TYPE:-}'. Use Postgres ou Oracle."
    exit 1
    ;;
esac

if [ ! -f "$DB_COMPOSE_FILE" ]; then
  echo "docker-compose nao encontrado em: $DB_COMPOSE_FILE"
  exit 1
fi
docker compose --env-file "$ENV_FILE" -p "$PROJ_NAME" -f "$DB_COMPOSE_FILE" up -d

#######################################################################################
#! Start Redis container if needed (for caching, etc.)
#######################################################################################
CACHE_TYPE_LOWER="$(echo "${CACHE_TYPE:-}" | tr '[:upper:]' '[:lower:]')"

case "$CACHE_TYPE_LOWER" in
  redis)
    REDIS_COMPOSE_FILE="$SCRIPT_DIR/docker/redis/docker-compose.yml"
    if [ ! -f "$REDIS_COMPOSE_FILE" ]; then
      echo "docker-compose nao encontrado em: $REDIS_COMPOSE_FILE"
      exit 1
    fi
    docker compose --env-file "$ENV_FILE" -p "$PROJ_NAME" -f "$REDIS_COMPOSE_FILE" up -d
    ;;
  memory)
    echo "CACHE_TYPE=memory, ignorando inicializacao do Redis."
    ;;
  *)
    echo "CACHE_TYPE invalido: '${CACHE_TYPE:-}'. Use Redis ou Memory."
    exit 1
    ;;
esac

#######################################################################################
#! Run .NET application
#######################################################################################
cd "$SCRIPT_DIR"
dotnet format csharp_p2.sln
dotnet run
