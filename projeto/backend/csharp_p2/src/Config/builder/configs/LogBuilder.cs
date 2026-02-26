namespace csharp_p2.src.Extensions;

public static class LogBuilder {
  public static void AddLogService(WebApplicationBuilder builder) {
    //!ativando serilog
    builder.Host.UseSerilog((builderContext, configureLogger) => configureLogger.ReadFrom.Configuration(builder.Configuration));
  }
}
