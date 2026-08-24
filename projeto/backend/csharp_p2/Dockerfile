FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

ENV NUGET_PACKAGES=/opt/nuget

COPY . .
RUN rm -rf bin obj Migrations \
    && mkdir -p Migrations \
    && dotnet restore csharp_p2.csproj \
    && dotnet publish csharp_p2.csproj \
      --configuration Release \
      --output /app/publish \
      --no-restore \
      /p:UseAppHost=false

RUN dotnet tool install --tool-path /tools dotnet-ef --version 10.0.11

# O SDK e o fonte permanecem na imagem porque, por decisão do projeto, as
# migrations não são versionadas: elas são geradas e aplicadas no destino.
FROM build AS final
WORKDIR /src

RUN apk add --no-cache krb5-libs su-exec \
    && mkdir -p /app/Log /data/files /tmp/dotnet Migrations \
    && chown -R app:app /app /data /src /tools /opt/nuget /tmp/dotnet

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_CLI_HOME=/tmp/dotnet \
    NUGET_PACKAGES=/opt/nuget

EXPOSE 8080
ENTRYPOINT ["/bin/sh", "/src/docker-entrypoint.sh"]
