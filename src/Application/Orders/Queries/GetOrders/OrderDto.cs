using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using AutoMapper;

namespace CafePosBackend.Application.Orders.Queries.GetOrders;

public class OrderDiscountDto
{
    public string Type { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class OrderDto
{
    public Guid Id { get; set; }
    public string TableId { get; set; } = "takeaway";
    public int? TableNumber { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Total { get; set; }
    public long OrderCode { get; set; }
    public OrderDiscountDto? Discount { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public bool IsPaid { get; set; }
    public long CreatedAt { get; set; }
    public long UpdatedAt { get; set; }
    public IEnumerable<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Order, OrderDto>()
                .ForMember(d => d.TableId, opt => opt.MapFrom(s => s.TableId.HasValue ? s.TableId.Value.ToString() : "takeaway"))
                .ForMember(d => d.TableNumber, opt => opt.MapFrom(s => s.Table != null ? (int?)s.Table.TableNumber : null))
                .ForMember(d => d.Discount, opt => opt.MapFrom(s => s.DiscountType.HasValue && s.DiscountValue.HasValue
                    ? new OrderDiscountDto { Type = s.DiscountType.Value.ToString().ToLower(), Value = s.DiscountValue.Value }
                    : null))
                .ForMember(d => d.CreatedAt, opt => opt.MapFrom(s => s.Created.ToUnixTimeMilliseconds()))
                .ForMember(d => d.UpdatedAt, opt => opt.MapFrom(s => s.LastModified.ToUnixTimeMilliseconds()))
                .ForMember(d => d.Items, opt => opt.MapFrom(s => s.Items));
        }
    }
}
