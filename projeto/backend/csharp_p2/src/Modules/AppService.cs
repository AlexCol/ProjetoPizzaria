using csharp_p2.src.Config;
using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Modules.Infra.Cache;
using csharp_p2.src.Modules.Infra.Database;
using csharp_p2.src.Shared.VOs;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules;

public interface IAppService {
  public dynamic HealthCheck();
  public dynamic TestDb();
  public Task<dynamic> TestCache();
  public Task RunSeedsAsync();
}

public class AppService : IAppService {
  private readonly BaseDBContext _dbContext;
  private readonly ICacheClient _cache;
  private readonly EnvConfig _env;

  public AppService(BaseDBContext dbContext, ICacheClient cache, EnvConfig env) {
    _dbContext = dbContext;
    _cache = cache;
    _env = env;
  }

  public dynamic HealthCheck() {
    return new { message = "Healthy", };
  }

  public dynamic TestDb() {
    var dbType = _env.Database.Type;
    if (dbType == "None")
      return new { message = "Healthy: No database configured - " + dbType }; // se o tipo de banco for None, retorna mensagem indicando que não tem banco configurado

    string sql;
    if (dbType == "Postgres") {
      sql = "SELECT 'Im fine, Postgres'"; // consulta simples para testar a conexão com o banco, se falhar, lança exceção
    } else if (dbType == "Oracle") {
      sql = "SELECT 'Im fine, Oracle' FROM DUAL";
    } else {
      return new { message = "Healthy: Database type not supported for health check - " + dbType }; // se o tipo de banco não for suportado para health check, retorna mensagem indicando isso
    }

    var response = _dbContext.Database.SqlQueryRaw<string>(sql).ToList(); // tenta fazer uma consulta simples no banco, se falhar, lança exceção
    return new {
      message = "Healthy: Database is working",
      database = dbType,
      response = response.FirstOrDefault()
    };
  }

  public async Task<dynamic> TestCache() {
    var cacheKey = "test_cache_key";
    var ttl = TimeSpan.FromSeconds(20);

    string cacheValue;
    var cacheHit = false;
    var cachedResponse = await _cache.GetAsync<string>(cacheKey);

    if (cachedResponse.IsNullOrEmpty()) {
      cacheValue = "This is a test cache value.";
      await _cache.SetAsync(cacheKey, cacheValue, ttl);
    } else {
      cacheValue = cachedResponse;
      cacheHit = true;
    }

    return new {
      message = "Cache is working",
      cacheValue,
      cacheHit,
      cacheType = _env.Cache.Type
    };
  }

  public async Task RunSeedsAsync() {
    using var trx = await _dbContext.Database.BeginTransactionAsync();
    try {
      await InsertRolesAsync();
      await InsertAdminUsersAsync();
      await InsertProcessesAsync();

      await trx.CommitAsync();
    } catch (Exception) {
      await trx.RollbackAsync();
      throw;
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!PRIVATE METHODS
  #region Seeds
  private async Task InsertRolesAsync() {
    var roles = await _dbContext.Set<Role>().ToListAsync();
    var existsAdminRole = roles.Any(r => r.Name == "Admin");
    if (!existsAdminRole) {
      var adminRole = new Role() {
        Name = "Admin"
      };
      _dbContext.Set<Role>().Add(adminRole);
      await _dbContext.SaveChangesAsync();
    }

    var existsStaffRole = roles.Any(r => r.Name == "Staff");
    if (!existsStaffRole) {
      var staffRole = new Role() {
        Name = "Staff"
      };
      _dbContext.Set<Role>().Add(staffRole);
      await _dbContext.SaveChangesAsync();
    }
  }

  private async Task InsertAdminUsersAsync() {
    var adminRole = await _dbContext.Set<Role>().FirstOrDefaultAsync(r => r.Name == "Admin");
    var users = await _dbContext.Set<User>().ToListAsync();
    var existsAdmin = users.Any(u => u.Email.Value == _env.AdminUser.Email);
    if (!existsAdmin) {
      var admin = new User() {
        Name = "Admin",
        Email = new EmailVO(_env.AdminUser.Email),
        Password = _env.AdminUser.Password, //não usar BCrypt.Net.BCrypt.HashPassword, no .env deve vir já hasheada
        RoleId = adminRole.Id,
        Status = (int)EUserStatus.Active,
      };
      _dbContext.Set<User>().Add(admin);
      await _dbContext.SaveChangesAsync();
    }
  }

  private async Task InsertProcessesAsync() {
    var processes = await _dbContext.Set<Process>().ToListAsync();
    var activateUserProcessExists = processes.Any(p => p.Name == Processes.ActivateUser);
    if (!activateUserProcessExists) {
      var activateUserProcess = new Process() {
        Name = Processes.ActivateUser,
      };
      _dbContext.Set<Process>().Add(activateUserProcess);
      await _dbContext.SaveChangesAsync();
    }

    var passwordResetProcessExists = processes.Any(p => p.Name == Processes.PasswordReset);
    if (!passwordResetProcessExists) {
      var passwordResetProcess = new Process() {
        Name = Processes.PasswordReset,
      };
      _dbContext.Set<Process>().Add(passwordResetProcess);
      await _dbContext.SaveChangesAsync();
    }
  }

  #endregion
}
