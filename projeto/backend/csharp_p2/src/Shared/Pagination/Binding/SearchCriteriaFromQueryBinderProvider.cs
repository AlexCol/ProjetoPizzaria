using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace csharp_p2.src.Shared.Pagination;

public sealed class SearchCriteriaFromQueryBinderProvider : IModelBinderProvider {
  public IModelBinder GetBinder(ModelBinderProviderContext context) {
    var isQuery = context.BindingInfo?.BindingSource == BindingSource.Query;

    if (!isQuery) return null;

    if (context.Metadata.ModelType.IsGenericType
        && context.Metadata.ModelType.GetGenericTypeDefinition() == typeof(SearchCriteriaRequest<>)) {
      return new SearchCriteriaFromQueryBinder();
    }

    return null;
  }
}
