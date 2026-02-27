using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Config.builder.DI;

public static partial class DependencyInjectionBuilder {
  // 🔷 Processa implementações de interfaces genéricas fechadas
  private static bool TryAddGenericInterfaceImplementations(IServiceCollection services, Type concreteType) {
    if (!concreteType.IsConcreteType())
      return false;

    var injected = false;

    var interfaces = concreteType.GetInterfaces()
        .Where(i => i.IsGenericType && !i.IsGenericTypeDefinition);

    foreach (var iface in interfaces) {
      Register(services, iface, concreteType, EServiceLifetimeType.Scoped);
      Log.Information($"[DI] Registrado {concreteType.Name} como implementação de {iface.Name}. - TryAddGenericInterfaceImplementations");
      injected = true;
    }

    return injected;
  }
}
