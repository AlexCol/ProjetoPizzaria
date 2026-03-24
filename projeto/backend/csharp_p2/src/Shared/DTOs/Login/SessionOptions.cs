namespace csharp_p2.src.Shared.DTOs;

public record SessionOptionsDto(
  bool RememberMe,
  string AppOrigin
);
