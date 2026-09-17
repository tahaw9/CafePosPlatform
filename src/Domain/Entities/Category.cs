using System;
using System.Collections.Generic;
using System.Text;

namespace CafePosBackend.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
    public bool IsDeleted { get; set; } = false;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

