using System.Reflection;
using csharp_p2.src.Config.builder.DI.Atributes;

namespace csharp_p2.src.Config.builder.DI;

public static partial class DependencyInjectionBuilder {
  // 🔷 Processa classes com [Injectable]
  private static bool TryAddClassWithAttribute(IServiceCollection services, Type concreteType) {
    if (!concreteType.IsConcreteType())
      return false;

    var injectableAttr = concreteType.GetCustomAttribute<InjectableAttribute>();
    if (injectableAttr != null) {
      Type resolvedInterfaceType = injectableAttr.InterfaceType
          ?? concreteType.GetInterface($"I{concreteType.Name}");

      if (resolvedInterfaceType == null) {
        Log.Information($"[DI WARNING] Interface 'I{concreteType.Name}' not found for {concreteType.Name}. Use [Injectable(typeof(IMinhaInterface))] se necessário.");
        return false;
      }

      Register(services, resolvedInterfaceType, concreteType, injectableAttr.Lifetime);
      Log.Information($"[DI] Registered {concreteType.Name} as {resolvedInterfaceType.Name} via [Injectable]. - TryAddClassWithAttribute");
      return true;
    }

    return false;
  }
}
