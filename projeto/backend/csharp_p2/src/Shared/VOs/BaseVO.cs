namespace csharp_p2.src.Shared.VOs;

public abstract class BaseVO {
  public abstract object GetValue(params object[] @params);
}
