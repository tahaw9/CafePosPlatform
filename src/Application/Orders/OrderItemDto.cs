using System;
using System.Collections.Generic;
using System.Text;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Orders;

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }

    public Guid ProductId { get; set; }
    // Snapshots (Storing name and price securely in case menu changes later)
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }
    public string? Note { get; set; }
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<OrderItem, OrderItemDto>()
                .ReverseMap();
        }
    }
}
