using CafePosBackend.Application.Orders;
using CafePosBackend.Application.Orders.Commands.CreateOrder;
using CafePosBackend.Domain.Enums;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Orders;

public class CreateOrderCommandValidatorTests
{
    [Test]
    public void CreateOrderCommandValidator_WithValidItems_ShouldPass()
    {
        var validator = new CreateOrderCommandValidator();
        var command = new CreateOrderCommand
        {
            TableId = Guid.NewGuid(),
            Total = 150000,
            Status = OrderStatus.Pending,
            Items = new List<OrderItemDto>
            {
                new()
                {
                    ProductId = Guid.NewGuid(),
                    ProductVariantId = Guid.NewGuid(),
                    Quantity = 2,
                    UnitPrice = 75000
                }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void CreateOrderCommandValidator_WithEmptyItems_ShouldFail()
    {
        var validator = new CreateOrderCommandValidator();
        var command = new CreateOrderCommand
        {
            TableId = Guid.NewGuid(),
            Total = 150000,
            Items = new List<OrderItemDto>()
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderCommand.Items));
    }

    [Test]
    [TestCase(0)]
    [TestCase(-1)]
    public void CreateOrderCommandValidator_WithNonPositiveQuantity_ShouldFail(int quantity)
    {
        var validator = new CreateOrderCommandValidator();
        var command = new CreateOrderCommand
        {
            Total = 50000,
            Items = new List<OrderItemDto>
            {
                new()
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = quantity,
                    UnitPrice = 50000
                }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderCommand.Items));
    }

    [Test]
    public void CreateOrderCommandValidator_WithNegativeTotal_ShouldFail()
    {
        var validator = new CreateOrderCommandValidator();
        var command = new CreateOrderCommand
        {
            Total = -100,
            Items = new List<OrderItemDto>
            {
                new()
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 1,
                    UnitPrice = 50000
                }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderCommand.Total));
    }
}
