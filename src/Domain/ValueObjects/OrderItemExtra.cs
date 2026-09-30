using CafePosBackend.Domain.Common;

namespace CafePosBackend.Domain.ValueObjects;

public class OrderItemExtra : ValueObject
{
    public OrderItemExtra()
    {
    }

    public OrderItemExtra(Guid extraId, string name, decimal price)
    {
        ExtraId = extraId;
        Name = name;
        Price = price;
    }

    public Guid ExtraId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return ExtraId;
        yield return Name;
        yield return Price;
    }
}
