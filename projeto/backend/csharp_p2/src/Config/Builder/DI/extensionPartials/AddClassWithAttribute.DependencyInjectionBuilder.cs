using System.Reflection;

namespace csharp_p2.src.Config.Builder;

public static partial class DependencyInjectionBuilder {
  // 🔷 Processa classes com [Injectable]
  private static bool TryAddClassWithAttribute(IServiceCollection services, Type concreteType) {
    if (!concreteType.IsConcreteType())
      return false;

    var injectableAttr = concreteType.GetCustomAttribute<InjectableAttribute>();
    if (injectableAttr is null)
      return false;

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
}

/*
Regra dessa etapa:
- Verifica se a classe é concreta (não é interface ou abstrata).
- Verifica se a classe tem o atributo [Injectable]. Se tiver, usa as informações do atributo para determinar a interface e o tempo de vida a ser registrado.
- O atributo [Injectable] pode especificar a interface a ser registrada. Se a propriedade InterfaceType do atributo for nula, o sistema tentará encontrar uma interface correspondente seguindo a convenção de nome (ex: IProdutoService para ProdutoService).
- Se a interface for encontrada, registra a classe com essa interface usando o tempo de vida definido no atributo.
- Se a interface não for encontrada, loga um aviso e não registra a classe.
- Exemplos de classes injetaveis por esse processo:
  [Injectable(typeof(IMyService), EServiceLifetimeType.Singleton)]
  public class MyService : IMyService {
  }
*/
