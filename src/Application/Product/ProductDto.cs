using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Product;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public ICollection<ProductVariantDto> Variants { get; set; } = new List<ProductVariantDto>();

    private decimal? _startingPrice;
    public decimal StartingPrice
    {
        get
        {
            if (_startingPrice.HasValue) return _startingPrice.Value;
            if (Variants != null && Variants.Count > 0)
            {
                var available = Variants.Where(v => v.IsAvailable).ToList();
                if (available.Count > 0)
                    return available.Min(v => v.Price);
                return Variants.Min(v => v.Price);
            }
            return Price;
        }
        set => _startingPrice = value;
    }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CafePosBackend.Domain.Entities.Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.Variants, opt => opt.MapFrom(src => src.Variants.OrderBy(v => v.DisplayOrder)))
                .ForMember(dest => dest.StartingPrice, opt => opt.Ignore());
        }
    }
}
