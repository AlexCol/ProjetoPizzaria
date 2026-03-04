using csharp_p2.src.Modules.Entities;

namespace csharp_p2.src.Shared.DTOs;

public class ResponseRoleDto {
  public long Id { get; set; }
  public string Description { get; set; }

  public ResponseRoleDto() { }

  public ResponseRoleDto(Role role) {
    Id = role.Id;
    Description = role.Description;
  }
}
