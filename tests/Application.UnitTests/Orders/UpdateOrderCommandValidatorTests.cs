using System;
using System.Collections.Generic;
using CafePosBackend.Application.Orders;
using CafePosBackend.Application.Orders.Commands.UpdateOrder;
using CafePosBackend.Domain.Enums;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Orders;

public class UpdateOrderCommandValidatorTests
{
    [Test]
    public void UpdateOrderCommandValidator_WithValidItems_ShouldPass()
    {
        var validator = new UpdateOrderCommandValidator();
        var command = new UpdateOrderCommand
        {
            Id = Guid.NewGuid(),
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
    public void UpdateOrderCommandValidator_WithEmptyItems_ShouldFail()
    {
        var validator = new UpdateOrderCommandValidator();
        var command = new UpdateOrderCommand
        {
            Id = Guid.NewGuid(),
            Total = 150000,
            Items = new List<OrderItemDto>()
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(UpdateOrderCommand.Items));
    }

    [Test]
    [TestCase(0)]
    [TestCase(-1)]
    public void UpdateOrderCommandValidator_WithNonPositiveQuantity_ShouldFail(int quantity)
    {
        var validator = new UpdateOrderCommandValidator();
        var command = new UpdateOrderCommand
        {
            Id = Guid.NewGuid(),
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
        result.Errors.ShouldContain(e => e.PropertyName == nameof(UpdateOrderCommand.Items));
    }

    [Test]
    public void UpdateOrderCommandValidator_WithNegativeTotal_ShouldFail()
    {
        var validator = new UpdateOrderCommandValidator();
        var command = new UpdateOrderCommand
        {
            Id = Guid.NewGuid(),
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
        result.Errors.ShouldContain(e => e.PropertyName == nameof(UpdateOrderCommand.Total));
    }

    [Test]
    public void UpdateOrderCommandValidator_WithZeroTotal_ShouldPass()
    {
        var validator = new UpdateOrderCommandValidator();
        var command = new UpdateOrderCommand
        {
            Id = Guid.NewGuid(),
            Total = 0,
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
        result.IsValid.ShouldBeTrue();
    }
}
