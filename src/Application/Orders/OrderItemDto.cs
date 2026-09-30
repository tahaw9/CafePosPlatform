using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.ValueObjects;

namespace CafePosBackend.Application.Orders;

public class OrderItemExtraDto
{
    public Guid ExtraId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }

    public Guid ProductId { get; set; }
    public Guid? ProductVariantId { get; set; }

    // Snapshots (Storing name and price securely in case menu changes later)
    public string ProductName { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }
    public string? Note { get; set; }

    // Client input IDs for mutation / creation
    public List<Guid>? ExtraIds { get; set; }

    // Snapshot details for responses
    public List<OrderItemExtraDto> Extras { get; set; } = new();

    public decimal ExtrasUnitPrice => Extras?.Sum(e => e.Price) ?? 0m;
    public decimal TotalUnitPrice => UnitPrice + ExtrasUnitPrice;
    public decimal LineTotal => TotalUnitPrice * Quantity;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<OrderItemExtra, OrderItemExtraDto>();

            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(d => d.ExtraIds, opt => opt.MapFrom(s => s.Extras != null ? s.Extras.Select(e => e.ExtraId).ToList() : new List<Guid>()))
                .ForMember(d => d.Extras, opt => opt.MapFrom(s => s.Extras ?? new List<OrderItemExtra>()));
        }
    }
}
