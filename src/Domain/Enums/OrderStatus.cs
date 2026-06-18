using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace CafePosBackend.Domain.Enums;


[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderStatus
{
    Pending,
    Preparing,
    Completed,
    Cancelled
}
