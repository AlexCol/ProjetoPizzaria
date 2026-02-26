using System.Reflection;
using csharp_p2.src.Config.builder.DI.atributes;
using csharp_p2.src.Config.builder.DI.enumerators;

namespace csharp_p2.src.Config.builder.DI;

public static partial class DependencyInjectionBuilder {
  // 🔷 Processa classes genéricas abertas
  private static bool TryAddGenericClass(IServiceCollection services, Type genericType) {
    if (!IsGenericTypeDefinition(genericType))
      return false;

    var injectableAttr = genericType.GetCustomAttribute<InjectableAttribute>();
    if (injectableAttr != null) {
      Type resolvedInterfaceType = injectableAttr.InterfaceType
          ?? genericType.GetInterface($"I{genericType.Name}");

      if (resolvedInterfaceType == null) {
        Log.Information($"[DI WARNING] Interface 'I{genericType.Name}' not found for {genericType.Name}. Use [Injectable(typeof(IMinhaInterface))] se necessário.");
        return false;
      }

      RegisterGeneric(services, resolvedInterfaceType, genericType, injectableAttr.Lifetime);
      Log.Information($"[DI] Registered {genericType.Name} as {resolvedInterfaceType.Name} via [Injectable]. - TryAddGenericClass");
      return true;
    }

    var interfaceType = FindMatchingGenericInterface(genericType);
    if (interfaceType == null) {
      Log.Information($"[DI WARNING] Generic interface 'I{genericType.Name}' not found for {genericType.Name}. Use [Injectable] if intended.");
      return false;
    }

    RegisterGeneric(services, interfaceType, genericType, EServiceLifetimeType.Scoped);
    Log.Information($"[DI] Registered {genericType.Name} as {interfaceType.Name} by convention. - TryAddGenericClass");
    return true;
  }
}
