using System.Net;
using System.Security.Cryptography;
using IdGen;

namespace csharp_p2.src.Shared.Helpers;

public static class SnowflakeId {
  private static readonly IdGenerator _generator = CreateGenerator();

  private static IdGenerator CreateGenerator() {
    var host = Dns.GetHostName();
    var pid = Environment.ProcessId;
    var input = $"{host}{pid}";

    var hash = SHA256.HashData(Encoding.UTF8.GetBytes(input));
    var instanceId = BitConverter.ToUInt16(hash, 0) % 1024; // 0..1023

    var structure = new IdStructure(timestampBits: 41, generatorIdBits: 10, sequenceBits: 12);
    var options = new IdGeneratorOptions(structure, new DefaultTimeSource(new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc)));

    return new IdGenerator(instanceId, options);
  }

  public static long GenerateId() => _generator.CreateId();
}
