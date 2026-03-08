namespace csharp_p2.src.Config.Builder;

public static partial class DependencyInjectionBuilder {
  // 🔷 Processa implementações de interfaces genéricas fechadas
  private static bool TryAddGenericInterfaceImplementations(IServiceCollection services, Type concreteType) {
    if (!concreteType.IsConcreteType())
      return false;

    var injected = false;

    var interfaces = concreteType.GetInterfaces()
        .Where(i => i.IsGenericType && !i.IsGenericTypeDefinition);

    foreach (var iface in interfaces) {
      Register(services, iface, concreteType, DefaultLifetime);
      Log.Information($"[DI] Registrado {concreteType.Name} como implementação de {iface.Name}. - TryAddGenericInterfaceImplementations");
      injected = true;
    }

    return injected;
  }
}

/*
Regra dessa etapa:
- Verifica se a classe é concreta (não é interface ou abstrata).
- Obtém todas as interfaces implementadas pela classe que são genéricas fechadas (ex: IGenericRepository<Produto>).
- Para cada interface genérica fechada encontrada, registra a classe como implementação dessa interface usando o tempo de vida definido em DefaultLifetime.
- Retorna true se pelo menos uma interface genérica fechada foi registrada, ou false caso contrário.
- Essa etapa é importante para garantir que classes que implementam interfaces genéricas específicas sejam registradas corretamente, mesmo que não sigam a convenção
    de nomenclatura ou não tenham o atributo Injectable.
- Exemplo: Se a classe ProdutoRepository implementa IGenericRepository<Produto>, ela será registrada como implementação de IGenericRepository<Produto>, permitindo
  que seja injetada corretamente quando essa interface for solicitada.
- Exemplos de classes injetaveis por esse processo:
  public class ProdutoRepository : IGenericRepository<Produto> {
  }

  public class ClienteService : IGenericService<Cliente> {
  }
*/
