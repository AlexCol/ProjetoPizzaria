namespace csharp_p2.src.Shared.Atributtes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class IgnoreAppOriginAttribute : Attribute;

/*
Atributo para permitir a inferencia do token de sessão, sem exigir web ou mobile,
pois para SSE não consigo mandar headers...
*/
