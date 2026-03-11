# Plano de Implementacao: SearchCriteria (EF Core)

## Contexto
Objetivo: replicar no projeto C# (EF Core) a mesma ideia usada no Nest (SistemaChamados) para busca dinamica, com:
- contrato unico (`SearchCriteriaRequest`)
- whitelist de campos por entidade (ex.: Category so permite `Name`, `CreatedAt`, `UpdatedAt`)
- aplicacao centralizada de where/sort/paginacao
- substituicao de metodos com predicate no GenericRepository

Importante:
- O repositorio nao deve aceitar campos livres.
- A whitelist deve ser explicitamente mapeada por entidade via `fieldMap`.
- A validacao deve acontecer antes de montar a query.

## Escopo Inicial
- Implementar infra base (DTOs + builders + extensoes).
- Adicionar `SearchAsync` no `GenericEntityRepository`.
- Ajustar `Categories` como exemplo completo.
- Manter metodos antigos inicialmente (ou deprecados) para nao quebrar endpoints.

## Passo a Passo

### 1) Criar DTOs do SearchCriteria
Arquivos sugeridos (ex.: `src/Shared/Pagination/`):
- `SearchCriteriaRequest.cs`
- `FilterCriteria.cs`
- `SortCriteria.cs`
- `PaginationCriteria.cs`
- `PaginatedResult.cs`

Itens:
- `SearchCriteriaRequest` com `Where`, `Sort`, `Pagination`.
- `FilterCriteria` com `Field`, `Value`, `Operator`, `IsNegated`.
- `SortCriteria` com `Field`, `Order`.
- `PaginationCriteria` com `Page`, `Limit`.
- `PaginatedResult<T>` com `Data`, `Total`, `Page`, `Limit`.

### 2) Criar validacao (FluentValidation)
Arquivo sugerido:
- `SearchCriteriaValidator.cs`

Itens:
- Validar `Pagination` (`Page >= 1`, `Limit` maximo).
- Validar `Sort` (`Field` permitido e `Order` asc/desc).
- Validar `Where` (`Field` permitido e operador permitido).
- A lista de `allowedFields` deve vir do service (por entidade).

### 3) Implementar builders de query
Arquivos sugeridos (ex.: `src/Shared/Querying/`):
- `DynamicQueryExtensions.cs`
- `DynamicOrderBuilder.cs`
- `DynamicFilterBuilder.cs`

Itens:
- `ApplySearchCriteria` (where + sort).
- `ToPaginatedResultAsync` (count + skip/take + list).
- `DynamicOrderBuilder` com `OrderBy` + `ThenBy`.
- `DynamicFilterBuilder` com operadores basicos (`=`, `like`) e suporte a `IsNegated`.

### 4) Adicionar SearchAsync no GenericRepository
Arquivos:
- `src/Modules/Domain/_GenericRepository/IGenericEntityRepository.cs`
- `src/Modules/Domain/_GenericRepository/GenericEntityRepository.cs`

Itens:
- Adicionar assinatura em interface:
  - `Task<PaginatedResult<T>> SearchAsync(SearchCriteriaRequest criteria, IReadOnlyDictionary<string, Expression<Func<T, object>>> fieldMap, bool includeReferences = false, CancellationToken ct = default)`
- Implementacao:
  - baseQuery = `Set<T>().AsNoTracking()`
  - se `includeReferences`, aplicar `IncludeAll()`
  - aplicar `ApplySearchCriteria(criteria, fieldMap)`
  - pagina default se null
  - retornar `ToPaginatedResultAsync`

### 5) Definir whitelist por entidade (exemplo Category)
Arquivo sugerido:
- `src/Modules/Domain/Categories/CategorySearchMap.cs` (ou dentro do service)

Itens:
- `FieldMap` para `Category`:
  - `name -> x.Name`
  - `createdAt -> x.CreatedAt`
  - `updatedAt -> x.UpdatedAt`
- StringComparer `OrdinalIgnoreCase`.

### 6) Atualizar CategoriesService
Arquivo:
- `src/Modules/Domain/Categories/CategoryService.cs`

Itens:
- Criar metodo novo:
  - `Task<PaginatedResult<Category>> SearchAsync(SearchCriteriaRequest request, CancellationToken ct)`
  - usar `FieldMap` + `_repository.SearchAsync(...)`
- Manter metodos antigos (GetAll, GetById) por enquanto.

### 7) Atualizar CategoriesController
Arquivo:
- `src/Modules/Domain/Categories/CategoriesController.cs`

Itens:
- Novo endpoint:
  - `POST /api/categories/buscar`
  - body: `SearchCriteriaRequest`
  - retorna `PaginatedResult<Category>`
- O GET paginado existente pode ser mantido temporariamente.

### 8) Testes basicos (minimo viavel)
Itens:
- Testar `DynamicFilterBuilder` com `=` e `like`.
- Testar `DynamicOrderBuilder` com `asc/desc`.
- Teste de integracao com `Category`:
  - where name like
  - sort by createdAt desc
  - paginacao page 2

### 9) Migracao de endpoints (posterior)
Itens:
- Substituir `SearchWithPredicate*` por `SearchAsync`.
- Endpoints com filtros passarem a usar `SearchCriteriaRequest`.
- Remover metodos legacy quando todos forem migrados.

## Checklist de Decisoes
- Limite maximo de `Limit` (ex.: 100 ou 200).
- Campos liberados por entidade (whitelist).
- Quais operadores suportar na primeira entrega.

## Referencia no Nest (SistemaChamados)
- Existe `SearchWithCriteriaService` que aplica where/sort/pagination.
- Validacao de campos permitidos via DTO (decorators).
- Mesmo conceito, mas aqui em EF Core com whitelist + expressions.

## Sequencia recomendada de execucao
1. DTOs + Validator
2. Builders + Extensions
3. Repository SearchAsync
4. Category fieldMap + Service + Controller
5. Testes
6. Migracao gradual dos demais endpoints

