using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Config.builder.DI;

public static partial class DependencyInjectionBuilder {
  // 🔷 Processa classes por convenção de nome
  private static bool TryAddClassByConvention(IServiceCollection services, Type concreteType) {
    if (!concreteType.IsConcreteType())
      return false;

    if (concreteType.Name.EndsWith("Service") || concreteType.Name.EndsWith("Repository")) {
      var interfaceType = concreteType.GetInterface($"I{concreteType.Name}");

      if (interfaceType == null) {
        Log.Information($"[DI WARNING] Interface 'I{concreteType.Name}' not found for {concreteType.Name}. Use [Injectable] if intended.");
        return false;
      }

      Register(services, interfaceType, concreteType, EServiceLifetimeType.Scoped);
      Log.Information($"[DI] Registered {concreteType.Name} as {interfaceType.Name} by convention. - TryAddClassByConvention");
      return true;
    }

    return false;
  }
}
