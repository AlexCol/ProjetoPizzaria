namespace csharp_p2.src.Shared.Atributtes;

/// <summary>
/// Exige validação antiforgery em uma operação mutável mesmo antes de existir
/// um cookie de sessão, como ocorre no login web que cria esse cookie.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireCsrfProtectionAttribute : Attribute;
