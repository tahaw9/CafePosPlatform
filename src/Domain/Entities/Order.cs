using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace CafePosBackend.Domain.Entities;

public class Order : BaseAuditableEntity
{
    // Nullable Guid for TableId, if null, means 'takeaway'
    public Guid? TableId { get; set; }
    public Table? Table { get; set; }

    public OrderStatus Status { get; set; }
    public decimal Total { get; set; }

    public long OrderCode { get; set; }

    // Discount details
    public DiscountType? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }

    public PaymentMethod? PaymentMethod { get; set; }
    public bool IsPaid { get; set; }
    // Navigation property
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
