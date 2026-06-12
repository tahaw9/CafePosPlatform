using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace CafePosBackend.Domain.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TableStatus
{
    Empty,
    Occupied,
    WaiterCalled
}

public class Table : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int TableNumber { get; set; }
    public TableStatus Status { get; set; }
}
