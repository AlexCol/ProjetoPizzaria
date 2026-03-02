
using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Config.builder.DI.Atributes;

[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public class InjectableAttribute : Attribute {
  public Type InterfaceType { get; }
  public EServiceLifetimeType Lifetime { get; }

  public InjectableAttribute(EServiceLifetimeType lifetime = EServiceLifetimeType.Scoped) {
    Lifetime = lifetime;
  }

  public InjectableAttribute(Type interfaceType, EServiceLifetimeType lifetime = EServiceLifetimeType.Scoped) {
    InterfaceType = interfaceType;
    Lifetime = lifetime;
  }
}
