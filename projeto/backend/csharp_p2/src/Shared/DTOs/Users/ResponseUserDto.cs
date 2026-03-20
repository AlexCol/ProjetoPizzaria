
using csharp_p2.src.Modules.Domain;

namespace csharp_p2.src.Shared.DTOs;

public class ResponseUserDto {
  public long Id { get; set; }
  public string Email { get; set; }
  public string Name { get; set; }
  public EUserStatus Status { get; set; }
  public ResponseRoleDto Role { get; set; }

  public ResponseUserDto() { }

  public ResponseUserDto(User user) {
    Id = user.Id;
    Email = user.Email.ToString();
    Name = user.Name;
    Status = user.Status;
    Role = new ResponseRoleDto(user.Role);
  }
}
