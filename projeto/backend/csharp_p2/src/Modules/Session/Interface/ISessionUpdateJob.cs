namespace csharp_p2.src.Modules.Session;

public interface ISessionUpdateJob {
  Task ExecuteAsync(long userId);
}
