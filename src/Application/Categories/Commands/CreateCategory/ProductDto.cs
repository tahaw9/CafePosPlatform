using System;
using System.Collections.Generic;
using System.Text;
using CafePosBackend.Application.TodoLists.Queries.GetTodos;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Categories.Commands.CreateCategory;

public class ProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }


    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CafePosBackend.Domain.Entities.Product, ProductDto>();
        }
    }
}
