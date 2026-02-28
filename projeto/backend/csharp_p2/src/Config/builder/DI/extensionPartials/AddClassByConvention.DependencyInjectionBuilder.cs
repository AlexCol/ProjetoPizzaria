namespace csharp_p2.src.Config.builder.DI;

public static partial class DependencyInjectionBuilder {
  // 🔷 Processa classes por convenção de nome
  private static bool TryAddClassByConvention(IServiceCollection services, Type concreteType) {
    if (!concreteType.IsConcreteType())
      return false;

    if (ConventionSuffixes.Any(suffix => concreteType.Name.EndsWith(suffix))) {
      var interfaceType = concreteType.GetInterface($"I{concreteType.Name}");

      if (interfaceType == null) {
        Log.Information($"[DI WARNING] Interface 'I{concreteType.Name}' not found for {concreteType.Name}. Use [Injectable] if intended.");
        return false;
      }

      Register(services, interfaceType, concreteType, DefaultLifetime);
      Log.Information($"[DI] Registered {concreteType.Name} as {interfaceType.Name} by convention. - TryAddClassByConvention");
      return true;
    }

    return false;
  }
}

/*
Regra dessa etapa:
- Verifica se a classe é concreta (não é interface ou abstrata).
- Verifica se o nome da classe termina com um dos sufixos definidos (Service, Repository, Factory).
- Se seguir a convenção, tenta encontrar uma interface correspondente com o nome "I" + nome da classe (ex: ProdutoService -> IProdutoService).
- Se a interface existir, registra a classe com essa interface usando o tempo de vida definido em DefaultLifetime.
- Se a interface não for encontrada, loga um aviso e não registra a classe.
- Exemplos de classes injetaveis por esse processo:
  public class ProdutoService : IProdutoService {
  }

  public class ClienteRepository : IClienteRepository {
  }
*/
