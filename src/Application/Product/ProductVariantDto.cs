using AutoMapper;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Product;

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public int DisplayOrder { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<ProductVariant, ProductVariantDto>()
                .ReverseMap();
        }
    }
}
