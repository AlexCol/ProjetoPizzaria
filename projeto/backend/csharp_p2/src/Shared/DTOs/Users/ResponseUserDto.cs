
using csharp_p2.src.Modules.Domain;

namespace csharp_p2.src.Shared.DTOs;

public class ResponseUserDto {
  public long Id { get; set; }
  public string Email { get; set; }
  public string Name { get; set; }
  public EUserStatus Status { get; set; }
  public long? RoleId { get; set; }
  public ResponseRoleDto Role { get; set; }

  public ResponseUserDto() { }

  public ResponseUserDto(User user) {
    Id = user.Id;
    Email = user.Email.ToString();
    Name = user.Name;
    Status = user.Status;
    RoleId = user.Role is null ? user.RoleId : null;
    Role = user.Role is not null ? new ResponseRoleDto(user.Role) : null;
  }
}
