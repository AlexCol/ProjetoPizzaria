using Hangfire;
using Hangfire.MemoryStorage;

namespace csharp_p2.src.Config.Builder;

public static class HangfireBuilder {
  public static void AddHangfire(WebApplicationBuilder builder) {
    builder.Services.AddHangfire(config => { //! no app que adiciona os jobs
      //! pra não aparecer o logs verboso, ajuste no appsetings override do Hangfire pra Warning ou Error

      //? Usa armazenamento em memória (jobs são perdidos ao reiniciar a aplicação)
      config.UseMemoryStorage();

      //? Tenta reexecutar jobs que falharam automaticamente (máximo 2 tentativas)
      config.UseFilter(new AutomaticRetryAttribute { Attempts = 2 });

      //? Usa serialização simplificada de tipos (melhor compatibilidade entre versões)
      config.UseSimpleAssemblyNameTypeSerializer();

      //? Configurações recomendadas de serialização JSON (ignora loops, formata datas, etc)
      config.UseRecommendedSerializerSettings();
    });

    builder.Services.AddHangfireServer();
  }
}
