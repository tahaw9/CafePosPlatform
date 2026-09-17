using System;
using System.Collections.Generic;
using System.Text;

namespace CafePosBackend.Application.Categories;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public int ItemCount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CafePosBackend.Domain.Entities.Category, CategoryDto>()
                .ForMember(d => d.ItemCount, opt => opt.MapFrom(s => s.Products.Count));
        }
    }
}

