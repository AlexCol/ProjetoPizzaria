namespace csharp_p2.src.Modules.Domain;

public interface IProcessesService {
  Task<long> GetProcessIdByName(string name);
}

public class ProcessesService : IProcessesService {
  private readonly IGenericEntityRepository<Process> _processRepository;

  public ProcessesService(IGenericEntityRepository<Process> processRepository) {
    _processRepository = processRepository;
  }

  public async Task<long> GetProcessIdByName(string name) {
    var process = await _processRepository.FindOneWithPredicateAsync(p => p.Name == name);
    if (process == null) {
      throw new Exception($"Process with name '{name}' not found.");
    }
    return process.Id;
  }
}
