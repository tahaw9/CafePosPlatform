using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using CafePosBackend.Application.TodoLists.Queries.GetTodos;
using CafePosBackend.Domain.Entities;
using Microsoft.Build.Tasks.Deployment.Bootstrapper;

namespace CafePosBackend.Application.Product;

public class ProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CafePosBackend.Domain.Entities.Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ReverseMap();
        }
    }
}
