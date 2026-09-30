using CafePosBackend.Domain.Common;

namespace CafePosBackend.Domain.Entities;

public class Extra : BaseAuditableEntity
{
    public Extra()
    {
    }

    public Extra(Guid id, string name, decimal price, bool isAvailable = true, int displayOrder = 0)
    {
        Id = id;
        Name = name;
        Price = price;
        IsAvailable = isAvailable;
        DisplayOrder = displayOrder;
        IsDeleted = false;
    }

    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int DisplayOrder { get; set; }
    public bool IsDeleted { get; set; }
}
