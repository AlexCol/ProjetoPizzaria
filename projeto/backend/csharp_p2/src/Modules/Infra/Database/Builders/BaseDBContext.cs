using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Shared.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace csharp_p2.src.Modules.Infra.Database;

public class BaseDBContext : DbContext {
  public DbSet<User> Users { get; set; }
  public DbSet<Role> Roles { get; set; }

  public BaseDBContext(DbContextOptions options) : base(options) { }

  protected override void OnModelCreating(ModelBuilder modelBuilder) {
    base.OnModelCreating(modelBuilder);

    ConfigureEntities(modelBuilder);
  }

  /**********************************************/
  /* ConfigureEntities                          */
  /**********************************************/
  #region Entities
  private void ConfigureEntities(ModelBuilder modelBuilder) {
    // Configuracoes das entidades aqui
    modelBuilder.ConfigureUser();
    modelBuilder.ConfigureRole();
  }
  #endregion

  /**********************************************/
  /* SaveChanges configs                        */
  /**********************************************/
  #region SaveChanges
  public override int SaveChanges() {
    BaseEntitySaveHelper();
    BaseEntityWithIdSaveHelper();
    return base.SaveChanges();
  }

  public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) {
    BaseEntitySaveHelper();
    BaseEntityWithIdSaveHelper();
    return await base.SaveChangesAsync(cancellationToken);
  }
  #endregion

  #region Helpers Privados
  private void BaseEntitySaveHelper() {
    var entries = ChangeTracker.Entries<BaseEntity>()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Added);

    foreach (var entry in entries) {
      if (entry.State == EntityState.Added) {
        entry.Entity.CreatedAt = DateTime.UtcNow;
        entry.Entity.UpdatedAt = DateTime.UtcNow;
      } else if (entry.State == EntityState.Modified) {
        entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false; //nao muda a data de criacao
        entry.Entity.UpdatedAt = DateTime.UtcNow;
      }
    }
  }

  private void BaseEntityWithIdSaveHelper() {
    var entries = ChangeTracker.Entries<BaseEntityWithId>()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Added);

    foreach (var entry in entries) {
      if (entry.State == EntityState.Added) {
        entry.Entity.Id = SnowflakeId.GenerateId();
      } else if (entry.State == EntityState.Modified) {
        entry.Property(nameof(BaseEntityWithId.Id)).IsModified = false;
      }
    }
  }

  #endregion

}
