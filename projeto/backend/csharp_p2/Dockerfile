FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src
COPY . .
# Evita que artefatos locais Windows em bin/obj contaminem o build Linux,
# mesmo se o .dockerignore ainda não tiver sido criado corretamente.
RUN rm -rf bin obj \
    && dotnet restore csharp_p2.csproj \
    && dotnet publish csharp_p2.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false
RUN dotnet tool install --tool-path /tools dotnet-ef --version 10.0.11
# O bundle precisa criar o DbContext durante o build, mas não conecta nesse banco fictício.
RUN ASPNETCORE_ENVIRONMENT=Development \
    DB_TYPE=Postgres \
    DB_HOST=localhost \
    DB_PORT=5432 \
    DB_USER=build \
    DB_PASS=build \
    DB_NAME=build \
    /tools/dotnet-ef migrations bundle \
      --project csharp_p2.csproj \
      --startup-project csharp_p2.csproj \
      --context csharp_p2.src.Modules.Infra.Database.BaseDBContext \
      --configuration Release \
      --self-contained \
      --target-runtime linux-musl-x64 \
      --output /app/publish/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
RUN mkdir -p /app/Log /data/files \
    && chown -R app:app /app /data
COPY --from=build --chown=app:app /app/publish .
USER app
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["/bin/sh", "-c", "/app/efbundle && exec dotnet /app/csharp_p2.dll"]
