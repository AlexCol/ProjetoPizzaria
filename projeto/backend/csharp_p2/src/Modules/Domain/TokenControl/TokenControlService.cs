using csharp_p2.src.Modules.Infra.Database;
using csharp_p2.src.Shared.Helpers;

namespace csharp_p2.src.Modules.Domain;

public interface ITokenControlService {
  Task<string> RegisterProcessTokenAsync(long idObject, string processName);
}

public class TokenControlService : ITokenControlService {
  private readonly BaseDBContext _context;
  private readonly IProcessesService _processesService;

  public TokenControlService(BaseDBContext context, IProcessesService processesService) {
    _context = context;
    _processesService = processesService;
  }

  public async Task<string> RegisterProcessTokenAsync(long idObject, string processName) {
    var idProcess = await _processesService.GetProcessIdByName(Processes.ActivateUser);
    if (idProcess == 0) {
      throw new Exception($"Process with name '{processName}' not found.");
    }

    var token = TokenGenerator.GenerateToken();

    var newTokenControl = new TokenControl {
      IdObject = idObject,
      IdProcess = idProcess,
      Token = token,
      CreatedAt = DateTime.UtcNow
    };

    _context.TokenControls.Add(newTokenControl);
    await _context.SaveChangesAsync();

    return token;
  }
}
