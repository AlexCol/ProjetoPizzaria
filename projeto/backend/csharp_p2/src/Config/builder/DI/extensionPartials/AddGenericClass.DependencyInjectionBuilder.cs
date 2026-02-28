using System.Reflection;
using csharp_p2.src.Config.builder.DI.Atributes;

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
        Log.Information($"[DI WARNING] Interface 'I{genericType.Name}' not found for {genericType.Name}. Use [Injectable(typeof(IMyInterface<>))] if necessary.");
        return false;
      }

      RegisterGeneric(services, resolvedInterfaceType, genericType, injectableAttr.Lifetime);
      Log.Information($"[DI] Registered {genericType.Name} as {resolvedInterfaceType.Name} via [Injectable]. - TryAddGenericClass");
      return true;
    }

    var interfaceType = FindMatchingGenericInterface(genericType);
    if (interfaceType == null) {
      Log.Information($"[DI WARNING] Generic interface 'I{genericType.Name}' not found for {genericType.Name}. Use [Injectable(typeof(IMyInterface<>))] if intended.");
      return false;
    }

    RegisterGeneric(services, interfaceType, genericType, DefaultLifetime);
    Log.Information($"[DI] Registered {genericType.Name} as {interfaceType.Name} by convention. - TryAddGenericClass");
    return true;
  }
}

/*
Regra dessa etapa:
- Verifica se a classe é uma definição de tipo genérico aberto (ex: GenericRepository<T>).
- Primeiro, verifica se a classe tem o atributo [Injectable]. Se tiver, usa as informações do atributo para determinar a interface
  e o tempo de vida a ser registrado.
- Se o atributo [Injectable] não estiver presente, tenta encontrar uma interface genérica correspondente seguindo a convenção de
  nome (ex: IGenericRepository<T> para GenericRepository<T>).
- Se a interface for encontrada, registra a classe genérica com essa interface usando o tempo de vida definido em DefaultLifetime.
- Se a interface não for encontrada, loga um aviso e não registra a classe.
- Exemplos de classes injetaveis por esse processo:
  [Injectable(typeof(IGenericRepository<>), EServiceLifetimeType.Scoped)]
  public class GenericRepository<T> : IGenericRepository<T> where T : class {
  }

  public class AnotherGenericService<T> : IAnotherGenericService<T> {
  }
*/
