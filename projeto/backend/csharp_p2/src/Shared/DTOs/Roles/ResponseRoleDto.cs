using csharp_p2.src.Modules.Domain;

namespace csharp_p2.src.Shared.DTOs;

public class ResponseRoleDto {
  public long Id { get; set; }
  public string Name { get; set; }

  public ResponseRoleDto() { }

  public ResponseRoleDto(Role role) {
    Id = role.Id;
    Name = role.Name;
  }
}
