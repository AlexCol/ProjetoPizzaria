# Guia Base: Paginacao, Ordenacao e Filtros Dinamicos com C# + EF Core

## Objetivo

Este documento descreve uma estrutura pronta para uso em producao para:

- Paginacao
- Ordenacao
- Filtros dinamicos
- Resposta paginada padronizada

A ideia e reproduzir o modelo que voce ja usa (SearchCriteria) em um backend ASP.NET Core com Entity Framework Core, mantendo:

- Contrato unico de busca
- Validacao forte
- Seguranca por whitelist de campos
- Separacao de responsabilidades

---

## Arquitetura Recomendada

### Camadas

1. API:

- Recebe `SearchCriteriaRequest`
- Valida entrada (FluentValidation recomendado)

2. Application:

- Aplica regras de negocio
- Chama construtor de query dinamica

3. Infra/Data:

- Converte criterios em `IQueryable<T>`
- Executa `CountAsync`, `Skip`, `Take`, `ToListAsync`

### Responsabilidade por tipo

- DTOs: somente contrato e validacao
- Query Builder: logica de filtro/sort/paginacao
- Service: orquestracao
- Repository (opcional): encapsular acesso ao DbContext

---

## Estrutura de Pastas Sugerida

```text
src/
  Application/
    Common/
      Pagination/
        SearchCriteriaRequest.cs
        FilterCriteria.cs
        SortCriteria.cs
        PaginationCriteria.cs
        PaginatedResult.cs
        SearchCriteriaValidator.cs
      Querying/
        DynamicQueryExtensions.cs
        DynamicOrderBuilder.cs
        DynamicFilterBuilder.cs
  Domain/
    Entities/
      Usuario.cs
  Infrastructure/
    Persistence/
      AppDbContext.cs
  Api/
    Controllers/
      UsuariosController.cs
```

---

## Objetos Iniciais (copiar e adaptar)

### 1) DTOs de entrada/saida

```csharp
public sealed class SearchCriteriaRequest
{
    public List<FilterCriteria>? Where { get; init; }
    public List<SortCriteria>? Sort { get; init; }
    public PaginationCriteria? Pagination { get; init; }
}

public sealed class FilterCriteria
{
    public required string Field { get; init; }
    public object? Value { get; init; }
    public string? Operator { get; init; } // "=", "!=", ">", "<", ">=", "<=", "in", "like"
    public bool IsNegated { get; init; }
}

public sealed class SortCriteria
{
    public required string Field { get; init; }
    public required string Order { get; init; } // "asc" | "desc"
}

public sealed class PaginationCriteria
{
    public int Page { get; init; } = 1;
    public int Limit { get; init; } = 25;
}

public sealed class PaginatedResult<T>
{
    public required IReadOnlyList<T> Data { get; init; }
    public int Total { get; init; }
    public int Page { get; init; }
    public int Limit { get; init; }
}
```

### 2) Validador (FluentValidation)

```csharp
using FluentValidation;

public sealed class SearchCriteriaValidator : AbstractValidator<SearchCriteriaRequest>
{
    private static readonly HashSet<string> AllowedOperators = new(StringComparer.OrdinalIgnoreCase)
    {
        "=", "!=", ">", "<", ">=", "<=", "in", "like"
    };

    public SearchCriteriaValidator(IReadOnlyCollection<string> allowedFields)
    {
        RuleFor(x => x.Pagination!.Page)
            .GreaterThanOrEqualTo(1)
            .When(x => x.Pagination is not null);

        RuleFor(x => x.Pagination!.Limit)
            .InclusiveBetween(1, 200)
            .When(x => x.Pagination is not null);

        RuleForEach(x => x.Sort!)
            .ChildRules(sort =>
            {
                sort.RuleFor(s => s.Field)
                    .NotEmpty()
                    .Must(f => allowedFields.Contains(f))
                    .WithMessage("Sort field invalido");

                sort.RuleFor(s => s.Order)
                    .Must(o => o.Equals("asc", StringComparison.OrdinalIgnoreCase)
                            || o.Equals("desc", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("Sort order deve ser asc ou desc");
            })
            .When(x => x.Sort is not null);

        RuleForEach(x => x.Where!)
            .ChildRules(filter =>
            {
                filter.RuleFor(f => f.Field)
                    .NotEmpty()
                    .Must(f => allowedFields.Contains(f))
                    .WithMessage("Filter field invalido");

                filter.RuleFor(f => f.Operator)
                    .Must(op => op is null || AllowedOperators.Contains(op))
                    .WithMessage("Operator invalido");
            })
            .When(x => x.Where is not null);
    }
}
```

### 3) Extensao para aplicar criterios no IQueryable

```csharp
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

public static class DynamicQueryExtensions
{
    public static IQueryable<T> ApplySearchCriteria<T>(
        this IQueryable<T> query,
        SearchCriteriaRequest criteria,
        IReadOnlyDictionary<string, Expression<Func<T, object>>> fieldMap)
    {
        if (criteria.Where is { Count: > 0 })
        {
            query = DynamicFilterBuilder.ApplyFilters(query, criteria.Where, fieldMap);
        }

        if (criteria.Sort is { Count: > 0 })
        {
            query = DynamicOrderBuilder.ApplySort(query, criteria.Sort, fieldMap);
        }

        return query;
    }

    public static async Task<PaginatedResult<T>> ToPaginatedResultAsync<T>(
        this IQueryable<T> query,
        PaginationCriteria pagination,
        CancellationToken ct = default)
    {
        var page = pagination.Page < 1 ? 1 : pagination.Page;
        var limit = pagination.Limit is < 1 or > 200 ? 25 : pagination.Limit;
        var skip = (page - 1) * limit;

        var total = await query.CountAsync(ct);
        var data = await query.Skip(skip).Take(limit).ToListAsync(ct);

        return new PaginatedResult<T>
        {
            Data = data,
            Total = total,
            Page = page,
            Limit = limit
        };
    }
}
```

### 4) Sort dinamico com whitelist

```csharp
public static class DynamicOrderBuilder
{
    public static IQueryable<T> ApplySort<T>(
        IQueryable<T> query,
        IEnumerable<SortCriteria> sortCriteria,
        IReadOnlyDictionary<string, Expression<Func<T, object>>> fieldMap)
    {
        IOrderedQueryable<T>? ordered = null;

        foreach (var sort in sortCriteria)
        {
            if (!fieldMap.TryGetValue(sort.Field, out var expr))
                continue;

            var desc = string.Equals(sort.Order, "desc", StringComparison.OrdinalIgnoreCase);

            if (ordered is null)
            {
                ordered = desc ? query.OrderByDescending(expr) : query.OrderBy(expr);
            }
            else
            {
                ordered = desc ? ordered.ThenByDescending(expr) : ordered.ThenBy(expr);
            }
        }

        return ordered ?? query;
    }
}
```

### 5) Filtro dinamico (MVP seguro)

```csharp
public static class DynamicFilterBuilder
{
    public static IQueryable<T> ApplyFilters<T>(
        IQueryable<T> query,
        IEnumerable<FilterCriteria> filters,
        IReadOnlyDictionary<string, Expression<Func<T, object>>> fieldMap)
    {
        foreach (var filter in filters)
        {
            if (!fieldMap.TryGetValue(filter.Field, out var expr))
                continue;

            query = ApplySingleFilter(query, expr, filter);
        }

        return query;
    }

    private static IQueryable<T> ApplySingleFilter<T>(
        IQueryable<T> query,
        Expression<Func<T, object>> expr,
        FilterCriteria filter)
    {
        var op = (filter.Operator ?? "=").ToLowerInvariant();

        if (op == "=" && filter.Value is not null)
        {
            return query.Where(BuildEquals(expr, filter.Value, filter.IsNegated));
        }

        if (op == "like" && filter.Value is string s)
        {
            return query.Where(BuildContains(expr, s, filter.IsNegated));
        }

        return query;
    }

    private static Expression<Func<T, bool>> BuildEquals<T>(
        Expression<Func<T, object>> expr,
        object value,
        bool negated)
    {
        var parameter = expr.Parameters[0];
        var member = UnwrapConvert(expr.Body);
        var typedValue = Convert.ChangeType(value, member.Type);
        var constant = Expression.Constant(typedValue, member.Type);

        Expression body = Expression.Equal(member, constant);
        if (negated) body = Expression.Not(body);

        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }

    private static Expression<Func<T, bool>> BuildContains<T>(
        Expression<Func<T, object>> expr,
        string value,
        bool negated)
    {
        var parameter = expr.Parameters[0];
        var member = UnwrapConvert(expr.Body);

        if (member.Type != typeof(string))
            return _ => true;

        var toLower = typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes)!;
        var contains = typeof(string).GetMethod(nameof(string.Contains), new[] { typeof(string) })!;

        var left = Expression.Call(member, toLower);
        var right = Expression.Constant(value.ToLowerInvariant());
        Expression body = Expression.Call(left, contains, right);

        if (negated) body = Expression.Not(body);

        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }

    private static Expression UnwrapConvert(Expression expression)
    {
        if (expression is UnaryExpression unary && unary.NodeType == ExpressionType.Convert)
            return unary.Operand;

        return expression;
    }
}
```

### 6) Exemplo de uso no service

```csharp
public sealed class UsuariosService
{
    private readonly AppDbContext _db;

    private static readonly IReadOnlyDictionary<string, Expression<Func<Usuario, object>>> FieldMap =
        new Dictionary<string, Expression<Func<Usuario, object>>>(StringComparer.OrdinalIgnoreCase)
        {
            ["id"] = x => x.Id,
            ["nome"] = x => x.Nome,
            ["email"] = x => x.Email,
            ["ativo"] = x => x.Ativo,
            ["criadoEm"] = x => x.CriadoEm
        };

    public UsuariosService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResult<UsuarioDto>> BuscarAsync(SearchCriteriaRequest request, CancellationToken ct)
    {
        var baseQuery = _db.Usuarios.AsNoTracking();

        var query = baseQuery.ApplySearchCriteria(request, FieldMap)
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                Nome = u.Nome,
                Email = u.Email
            });

        var pagination = request.Pagination ?? new PaginationCriteria { Page = 1, Limit = 25 };
        return await query.ToPaginatedResultAsync(pagination, ct);
    }
}
```

### 7) Exemplo de endpoint

```csharp
[ApiController]
[Route("api/usuarios")]
public sealed class UsuariosController : ControllerBase
{
    private readonly UsuariosService _service;

    public UsuariosController(UsuariosService service)
    {
        _service = service;
    }

    [HttpPost("buscar")]
    public async Task<ActionResult<PaginatedResult<UsuarioDto>>> Buscar(
        [FromBody] SearchCriteriaRequest request,
        CancellationToken ct)
    {
        var result = await _service.BuscarAsync(request, ct);
        return Ok(result);
    }
}
```

---

## Checklist de Producao

1. Definir limites globais: `Limit` maximo (ex.: 100 ou 200).
2. Validar todos os campos com whitelist por endpoint.
3. Nunca permitir field livre sem mapeamento.
4. Sempre usar `AsNoTracking` para consultas read-only.
5. Sempre projetar com `Select` para DTO (evita carregar colunas desnecessarias).
6. Ter indice no banco para campos mais usados em `where` e `sort`.
7. Instrumentar tempo de consulta e cardinalidade de resultado.
8. Criar testes de integracao para filtros combinados e pagina extrema.

---

## Limites desta versao base

- O exemplo de filtro dinamico esta no nivel MVP para seguranca e clareza.
- Operadores avancados (`in`, `>`, `<`, `>=`, `<=`) podem ser adicionados no `DynamicFilterBuilder` com conversao tipada por tipo do campo.
- Se a complexidade crescer, migrar para Specification Pattern.

---

## Handoff para outro agente de IA

Contexto para continuidade:

- Projeto alvo: ASP.NET Core + EF Core.
- Objetivo: implementar busca dinamica com contrato unico (`SearchCriteriaRequest`).
- Requisito principal: manter seguranca por whitelist de campos e validacao forte.
- Prioridade: estabilidade e previsibilidade em producao.

Tarefas sugeridas para o proximo agente:

1. Criar os arquivos base exatamente como neste guia.
2. Adaptar nomes de entidades e campos para o dominio do projeto alvo.
3. Implementar operadores adicionais no filtro dinamico (`in`, `>`, `<`, `>=`, `<=`).
4. Adicionar testes de unidade para `DynamicFilterBuilder` e `DynamicOrderBuilder`.
5. Adicionar testes de integracao para endpoint de busca com banco real de teste.
6. Validar SQL gerado pelo EF Core em cenarios com multiplos filtros e ordenacoes.
7. Definir politica de limite maximo de pagina por endpoint (ou global).

Prompt sugerido para o proximo agente:
"Use o arquivo GUIA_CSHARP_EF_PAGINACAO_FILTROS.md como fonte principal. Implemente a estrutura base no projeto ASP.NET Core atual, com foco em validacao, whitelist de campos, filtros dinamicos seguros e testes."

---

## Decisao arquitetural resumida

Sim, este modelo e bom para producao quando:

- DTO concentra contrato e validacao.
- Query builder concentra montagem de consulta.
- Campos e operadores sao controlados por lista permitida.
- Ha testes para casos de borda e monitoramento de desempenho.
