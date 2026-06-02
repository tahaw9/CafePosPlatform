using System.ComponentModel.DataAnnotations.Schema;

namespace CafePosBackend.Domain.Entities;

public class Product : BaseAuditableEntity
{
    public Product()
    {
        
    }
    public Product(Guid id,string name, decimal price, bool isAvailable, Guid categoryId)
    {
        Id = id;
        Name = name;
        Price = price;
        IsAvailable = isAvailable;
        CategoryId = categoryId;
    }

    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    public Category Category { get; set; } = null!;
}
