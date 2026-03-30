using System.Text.Json.Serialization;

namespace csharp_p2.src.Shared.Serialization;

public sealed class LongAsStringJsonConverter : JsonConverter<long> {
  public override long Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
    return reader.TokenType switch {
      JsonTokenType.Number => reader.GetInt64(),
      JsonTokenType.String => long.TryParse(reader.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var value)
        ? value
        : throw new JsonException("Invalid Int64 string value."),
      _ => throw new JsonException("Expected number or string for Int64 value."),
    };
  }

  public override void Write(Utf8JsonWriter writer, long value, JsonSerializerOptions options) {
    writer.WriteStringValue(value.ToString(CultureInfo.InvariantCulture));
  }
}

public sealed class NullableLongAsStringJsonConverter : JsonConverter<long?> {
  public override long? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
    return reader.TokenType switch {
      JsonTokenType.Null => null,
      JsonTokenType.Number => reader.GetInt64(),
      JsonTokenType.String => long.TryParse(reader.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var value)
        ? value
        : throw new JsonException("Invalid nullable Int64 string value."),
      _ => throw new JsonException("Expected number, string, or null for nullable Int64 value."),
    };
  }

  public override void Write(Utf8JsonWriter writer, long? value, JsonSerializerOptions options) {
    if (value is null) {
      writer.WriteNullValue();
      return;
    }

    writer.WriteStringValue(value.Value.ToString(CultureInfo.InvariantCulture));
  }
}