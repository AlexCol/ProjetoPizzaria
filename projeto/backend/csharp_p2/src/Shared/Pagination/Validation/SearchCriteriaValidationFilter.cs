using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;

namespace csharp_p2.src.Shared.Pagination;

//! Este filtro não tem dependências no construtor, então funciona mesmo sem registro no DI.
//! Se futuramente ele precisar de dependências (ILogger, HttpContextAccessor, etc.),
//! então ele deve ser registrado no container para que o MVC consiga resolvê-lo.
//! O filtro é adicionar com options.Filters.Add<SearchCriteriaValidationFilter>(); em AspnetBaseBuilder
//[Injectable(typeof(SearchCriteriaValidationFilter))]
public sealed class SearchCriteriaValidationFilter : IAsyncActionFilter {
  public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next) {
    foreach (var arg in context.ActionArguments.Values) {
      if (arg is null) continue;

      var argType = arg.GetType();
      if (!IsSearchCriteriaRequest(argType)) continue;

      var validator = CreateValidator(argType);
      if (validator is null) continue;

      var result = validator.Validate(new ValidationContext<object>(arg));
      if (!result.IsValid) {
        var errors = result.Errors.Select(e => new {
          field = e.PropertyName,
          message = e.ErrorMessage
        });

        context.Result = new BadRequestObjectResult(new { errors });
        return;
      }
    }

    await next();
  }

  private static bool IsSearchCriteriaRequest(Type type) {
    return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(SearchCriteriaRequest<>);
  }

  private static IValidator CreateValidator(Type requestType) {
    var entityType = requestType.GetGenericArguments()[0];
    var validatorType = typeof(SearchCriteriaRequestValidator<>).MakeGenericType(entityType);
    return Activator.CreateInstance(validatorType) as IValidator;
  }
}

