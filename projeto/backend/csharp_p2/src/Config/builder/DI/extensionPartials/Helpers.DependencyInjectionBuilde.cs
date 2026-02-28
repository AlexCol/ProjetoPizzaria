using System.Reflection;
using System.Runtime.CompilerServices;
using csharp_p2.src.Config.builder.DI.Atributes;
using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Config.builder.DI;

public static partial class DependencyInjectionBuilder {
  // 🔍 Verifica se o tipo já foi registrado
  private static bool IsAlreadyRegistered(IServiceCollection services, Type serviceType, Type implementationType = null) {
    return services.Any(sd =>
        sd.ServiceType == serviceType &&
        (implementationType == null || sd.ImplementationType == implementationType));
  }

  // 🔍 Busca interface genérica aberta correspondente
  private static Type FindMatchingGenericInterface(Type type) {
    var targetInterfaceName = $"I{type.Name.Split('`')[0]}";

    var match = type.GetInterfaces()
        .FirstOrDefault(i =>
            i.IsGenericType &&
            i.GetGenericTypeDefinition().Name.Split('`')[0] == targetInterfaceName);

    return match?.GetGenericTypeDefinition();
  }

  // ✅ Helpers
  private static bool IsCompilerGenerated(this Type type) {
    return type.GetCustomAttributes(typeof(CompilerGeneratedAttribute), inherit: false).Any();
  }

  private static bool HasIgnoreAttribute(this Type type) {
    return type.GetCustomAttribute<IgnoreInjectionAttribute>(inherit: false) != null;
  }

  private static bool HasAttribute<T>(this Type type) where T : Attribute {
    return type.GetCustomAttribute<T>() != null;
  }

  private static bool IsInjectableType(Type type) {
    if (type.HasIgnoreAttribute())
      return false;

    if (typeof(Delegate).IsAssignableFrom(type))
      return false;

    var hasInjectable = type.HasAttribute<InjectableAttribute>();
    var cleanName = type.Name.Split('`')[0];

    //ConventionSuffixes declarado na principal (DependencyInjectionBuilder.cs)
    var nameMatches = ConventionSuffixes.Any(suffix => cleanName.EndsWith(suffix));

    return hasInjectable || nameMatches;
  }

  private static bool IsGenericTypeDefinition(this Type type) {
    return type.IsGenericType && type.IsGenericTypeDefinition;
  }

  private static bool IsConcreteType(this Type type) {
    return type.IsClass && !type.IsAbstract && !type.IsInterface && !type.IsGenericTypeDefinition;
  }

  private static void LoadGlobals(WebApplicationBuilder builder) {
    BaseNamespace = builder.Configuration.GetValue<string>("BaseNamespace");
    if (string.IsNullOrEmpty(BaseNamespace)) {
      throw new InvalidOperationException("BaseNamespace configuration is required for DependencyInjectionBuilder.");
    }

    ConventionSuffixes = builder.Configuration.GetSection("AutoInjectableSuffixes").Get<string[]>();
    if (ConventionSuffixes == null || ConventionSuffixes.Length == 0) {
      throw new InvalidOperationException("AutoInjectableSuffixes configuration is required for DependencyInjectionBuilder.");
    }

    var configDefaultLifetime = builder.Configuration.GetValue<string>("AutoInjectableDefaultLifetime");
    if (!Enum.TryParse<EServiceLifetimeType>(configDefaultLifetime, true, out var parsedLifetime)) {
      throw new InvalidOperationException("Invalid AutoInjectableDefaultLifetime configuration for DependencyInjectionBuilder.");
    }

    DefaultLifetime = parsedLifetime;

  }
}
