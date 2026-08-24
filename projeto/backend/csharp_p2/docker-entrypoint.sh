#!/bin/sh

set -eu

PROJECT="csharp_p2.csproj"
CONTEXT="csharp_p2.src.Modules.Infra.Database.BaseDBContext"
MIGRATIONS_DIR="Migrations"

mkdir -p "$MIGRATIONS_DIR"

has_snapshot() {
  find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*ModelSnapshot.cs' -print -quit \
    | grep -q .
}

add_migration() {
  migration_name="$1"
  /tools/dotnet-ef migrations add "$migration_name" \
    --project "$PROJECT" \
    --startup-project "$PROJECT" \
    --context "$CONTEXT" \
    --configuration Release \
    --output-dir "$MIGRATIONS_DIR"
}

if ! has_snapshot; then
  echo "Nenhum snapshot persistido; gerando migration inicial."
  add_migration "Initial_$(date -u +%Y%m%d%H%M%S)"
elif ! /tools/dotnet-ef migrations has-pending-model-changes \
  --project "$PROJECT" \
  --startup-project "$PROJECT" \
  --context "$CONTEXT" \
  --configuration Release; then
  echo "O modelo mudou; gerando nova migration."
  add_migration "Deploy_$(date -u +%Y%m%d%H%M%S)"
else
  echo "O modelo não possui alterações pendentes."
fi

echo "Aplicando migrations pendentes no banco configurado em DB_*..."
/tools/dotnet-ef database update \
  --project "$PROJECT" \
  --startup-project "$PROJECT" \
  --context "$CONTEXT" \
  --configuration Release

echo "Migrations concluídas; iniciando a API."
exec dotnet /app/publish/csharp_p2.dll
