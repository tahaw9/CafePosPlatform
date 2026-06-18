using System;

namespace CafePosBackend.Domain.Entities;

public class UnpaidOrder : BaseAuditableEntity
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    public bool IsSettled { get; set; }
    public DateTime? SettledAt { get; set; }
}
