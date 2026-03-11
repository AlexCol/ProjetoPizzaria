# Fluxo de Validacao SearchCriteria

## Objetivo
Padronizar o uso de `SearchCriteriaRequest<T>` com validacao automatica e segura, sem precisar instanciar validator no controller. Este fluxo garante:
- Campos permitidos por entidade (whitelist via reflection do DTO).
- Operadores controlados.
- Erros consistentes com `400 BadRequest`.

## Fluxo (ordem atual)
1. **Models**
2. **Validator**
3. **Validation Filter**

Deixamos margem para adicionar o **Querying** depois (motor de filtros/sort/paginacao).

## 1) Models
Local: `src/Shared/Pagination/Models`

Arquivos:
- `SearchCriteriaRequest<T>`
- `FilterCriteria`
- `SortCriteria`
- `PaginationCriteria`

Responsabilidade:
- Apenas contrato de entrada.
- Sem logica, sem validacao.
- Defaults para evitar erro de model binding.

## 2) Validator
Local: `src/Shared/Pagination/Validator/SearchCriteriaValidator.cs`

Classe:
- `SearchCriteriaRequestValidator<T> : AbstractValidator<SearchCriteriaRequest<T>>`

Responsabilidade:
- Validar a estrutura do request.
- Validar `where/sort` com whitelist de campos de `T`.
- Validar operadores permitidos.
- Validar limites de paginacao.

Por que separado:
- Evita misturar DTO com validacao (model binding mais estavel).
- Facilita testes.
- Permite reuso sem acoplar o request ao FluentValidation.

## 3) Validation Filter (middleware de action)
Local: `src/Shared/Pagination/Validation/SearchCriteriaValidationFilter.cs`

Responsabilidade:
- Rodar antes do action.
- Detectar parametros do tipo `SearchCriteriaRequest<T>`.
- Instanciar `SearchCriteriaRequestValidator<T>`.
- Retornar `400` se invalido.

Registro global:
- `BuilderConfig.AddConfigs` adiciona o filtro como global.
- `options.Filters.Add<SearchCriteriaValidationFilter>();`
- `Adicionado Injectable em SearchCriteriaValidationFilter para escopo scoped`

Por que usar filtro:
- Nao precisa instanciar validator nos controllers.
- Unifica o comportamento em todos endpoints.
- Facilita manutencao quando adicionar Querying.

## Margem para o passo Querying (futuro)
Quando adicionarmos o motor de consulta:
- `ApplySearchCriteria` recebera `SearchCriteriaRequest<T>`.
- Ele vai usar `fieldMap` e operadores do request.
- O filtro continua igual: valida antes da query.

