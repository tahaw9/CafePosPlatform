using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Product.Queries.ProductPagination;

public class ProductSearchFilterDto
{
    public string? Name { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsAvailable { get; set; }
    public Guid? CategoryId { get; set; }
}
