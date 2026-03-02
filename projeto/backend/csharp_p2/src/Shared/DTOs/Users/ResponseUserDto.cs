
using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Shared.VOs;

namespace csharp_p2.src.Shared.DTOs.Users;

public class ResponseUserDto {
  public long Id { get; set; }
  public string Email { get; set; }
  public string Name { get; set; }
  public int Active { get; set; }
  public Role Role { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }

  public ResponseUserDto(User user) {
    Id = user.Id;
    Email = user.Email.ToString();
    Name = user.Name;
    Active = user.Active;
    CreatedAt = user.CreatedAt;
    UpdatedAt = user.UpdatedAt;
    Role = user.Role;
  }
}
