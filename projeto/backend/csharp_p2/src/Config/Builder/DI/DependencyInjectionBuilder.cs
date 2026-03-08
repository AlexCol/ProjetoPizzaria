namespace csharp_p2.src.Config.Builder;

public static partial class DependencyInjectionBuilder {
  private static string BaseNamespace;
  private static string[] ConventionSuffixes;
  private static EServiceLifetimeType DefaultLifetime;

  public static IServiceCollection AddAutoInjectables(WebApplicationBuilder builder) {
    var services = builder.Services;
    LoadGlobals(builder); //carrega as tres variaveis acima, alem de validar se estão ok

    var assemblies = AppDomain.CurrentDomain.GetAssemblies();

    var allTypes = assemblies
        .SelectMany(a => a.GetTypes())
        .Where(t =>
            t.IsClass &&
            !t.IsAbstract &&
            !t.IsCompilerGenerated() &&
            t.Namespace != null &&
            t.Namespace.StartsWith(BaseNamespace) //? limita a busca para as classes do projeto, evitando pegar tipos de bibliotecas externas
        );

    foreach (var classType in allTypes) {
      if (!IsInjectableType(classType))
        continue;

      if (TryAddClassWithAttribute(services, classType))
        continue; // 🔥 Prioridade máxima: Primeiro verifica se tem atributo Injectable

      if (TryAddGenericClass(services, classType))
        continue; // 🔥 Classes genéricas abertas: Verifica se é uma classe genérica

      if (TryAddClassByConvention(services, classType))
        continue; // 🔥 Por nome: Service, Repository: Verifica se segue convenção de nome

      if (TryAddGenericInterfaceImplementations(services, classType))
        continue; // 🔥 Verifica se implementa interfaces genéricas
    }

    return services;
  }
}

/*
Ordem de prioridade para injeção de dependências:
1. Atributo Injectable: Verifica se a classe tem o atributo Injectable, que define o tipo de serviço e o tempo de vida.
2. Classes genéricas abertas: Verifica se a classe é uma classe genérica aberta, como `GenericRepository<T>`, e registra-a com o tipo de serviço correspondente.
3. Por nome: Verifica se a classe segue a convenção de nomenclatura, como `Service` ou `Repository`, e registra-a com o tipo de serviço correspondente.
4. Verifica se implementa interfaces genéricas: Se a classe implementa interfaces genéricas, registra-a com o tipo de serviço correspondente.

Caso se tenha uma classe que implementa tanto uma interface específica, quando uma generica, por padrão ele vai seguir a ordem na lista acima.
Mas se desejar que ela não injete a interface específica, basta adicionar o atributo Injectable na classe, e ele injetar a interface informada.
[Injectable(typeof(IGenericRepository<Produto>), EServiceLifetimeType.Scoped)]

Regras mais detalhadas em cada etapa (ver arquivos dos métodos correspondentes).
*/
