using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Shared.VOs;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Infra.Database.builders;

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
    var entries = ChangeTracker.Entries<BaseEntity>()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Added);

    foreach (var entry in entries) {
      if (entry.State == EntityState.Added) { //!seta valores padroes ao inserir um novo registro
        entry.Entity.CriadoEm = DateTime.UtcNow;
        entry.Entity.EditadoEm = DateTime.UtcNow;
      } else if (entry.State == EntityState.Modified) { //! valores automativos ao ser realizado update do registro
        entry.Entity.CriadoEm = DateTime.UtcNow;
        entry.Property(nameof(BaseEntity.EditadoEm)).IsModified = false;
      }
    }

    return base.SaveChanges();
  }

  public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) {
    var entries = ChangeTracker.Entries<BaseEntity>()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Added);

    foreach (var entry in entries) {
      if (entry.State == EntityState.Added) {
        entry.Entity.CriadoEm = DateTime.Now;
        entry.Entity.EditadoEm = DateTime.Now;
      } else if (entry.State == EntityState.Modified) {
        entry.Property(nameof(BaseEntity.CriadoEm)).IsModified = false; //nao muda a data de criacao
        entry.Entity.EditadoEm = DateTime.Now;
      }
    }

    return await base.SaveChangesAsync(cancellationToken);
  }
  #endregion
}
