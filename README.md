# eVoto – BFF + SPA

Aplicação de votação eletrónica com backend ASP.NET Core (BFF) que consome serviços gRPC e frontend React/Vite com Tailwind.

## Docker (build e execução)

No diretório raiz da solução

```bash
# Build da imagem (contexto na raiz)
docker build -f Dockerfile -t evoto .

# Executar expondo HTTP/HTTPS da app
docker run -p 8080:8080 -p 8081:8081 evoto
```

## Endpoints do Frontend

http://localhost:8080

## Endpoints do BFF

- POST `/api/bff/voting/credential`
- GET `/api/bff/voting/candidates`
- POST `/api/bff/voting/vote`
- GET `/api/bff/voting/results`

A app publicada via Dockerfile serve a SPA a partir do ASP.NET Core (wwwroot) e usa os serviços gRPC configurados em `appsettings.json`.
