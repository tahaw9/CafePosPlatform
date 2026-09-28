using System;
using System.Collections.Generic;
using System.Text;

namespace CafePosBackend.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    // Snapshots (Storing name and price securely in case menu changes later)
    public string ProductName { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }
    public string? Note { get; set; }
}
