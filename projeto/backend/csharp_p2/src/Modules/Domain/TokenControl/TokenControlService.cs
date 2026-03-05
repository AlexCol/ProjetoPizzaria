using csharp_p2.src.Modules.Infra.Database;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.Helpers;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

public interface ITokenControlService {
  Task<string> RegisterProcessTokenAsync(long idObject, string processName, DateTime? expiresAt = null);
  Task<TokenControl> GetTokenControlByTokenAsync(string token);
  Task RemoveTokenControlAsync(TokenControl tokenControl);
  Task ClearExpiredTokensAsync();
}

public class TokenControlService : ITokenControlService {
  private readonly BaseDBContext _context;
  private readonly IProcessesService _processesService;

  public TokenControlService(BaseDBContext context, IProcessesService processesService) {
    _context = context;
    _processesService = processesService;
  }

  public async Task<string> RegisterProcessTokenAsync(long idObject, string processName, DateTime? expiresAt = null) {
    var idProcess = await _processesService.GetProcessIdByName(processName);
    if (idProcess == 0) {
      throw new Exception($"Process with name '{processName}' not found.");
    }

    await InvalidateExistingTokensAsync(idObject, idProcess);

    var token = TokenGenerator.GenerateToken();

    var newTokenControl = new TokenControl {
      IdObject = idObject,
      IdProcess = idProcess,
      Token = token,
      CreatedAt = DateTime.UtcNow,
      ExpiresAt = expiresAt
    };

    _context.TokenControls.Add(newTokenControl);
    await _context.SaveChangesAsync();

    return token;
  }

  public async Task<TokenControl> GetTokenControlByTokenAsync(string token) {
    var tokenControl = await _context.TokenControls.FirstOrDefaultAsync(tc => tc.Token == token);
    if (tokenControl == null) {
      throw new CustomError("Invalid token.");
    }

    return tokenControl;
  }

  public async Task RemoveTokenControlAsync(TokenControl tokenControl) {
    _context.TokenControls.Remove(tokenControl);
    await _context.SaveChangesAsync();
  }

  public async Task ClearExpiredTokensAsync() {
    using var transaction = await _context.Database.BeginTransactionAsync();
    try {
      Log.Information("Starting ClearExpiredTokens job...");
      var expiredTokens = await _context.TokenControls.Where(tc => tc.ExpiresAt.HasValue && tc.ExpiresAt.Value < DateTime.UtcNow).ToListAsync();
      if (expiredTokens.Any()) {
        _context.TokenControls.RemoveRange(expiredTokens);
        await _context.SaveChangesAsync();
      }

      var tokensWithoutExpiry = await _context.TokenControls.Where(tc => !tc.ExpiresAt.HasValue && tc.CreatedAt < DateTime.UtcNow.AddDays(-30)).ToListAsync();
      if (tokensWithoutExpiry.Any()) {
        _context.TokenControls.RemoveRange(tokensWithoutExpiry);
        await _context.SaveChangesAsync();
      }
      await transaction.CommitAsync();
    } catch {
      await transaction.RollbackAsync();
      throw;
    }
  }

  private async Task InvalidateExistingTokensAsync(long idObject, long idProcess) {
    var existingTokens = await _context.TokenControls.Where(tc => tc.IdObject == idObject && tc.IdProcess == idProcess).ToListAsync();
    if (existingTokens.Any()) {
      _context.TokenControls.RemoveRange(existingTokens);
      await _context.SaveChangesAsync();
    }
  }
}
