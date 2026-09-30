using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Orders;
using CafePosBackend.Application.Orders.Commands.UpdateOrder;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Orders;

public class UpdateOrderWithExtrasTests
{
    private Mock<IApplicationDbContext> _context = null!;
    private Mock<IMapper> _mapper = null!;
    private UpdateOrderCommandHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _context = new Mock<IApplicationDbContext>();
        _mapper = new Mock<IMapper>();
        _handler = new UpdateOrderCommandHandler(_context.Object, _mapper.Object);
    }

    [Test]
    public async Task UpdateOrder_WhenOrderNotFound_ShouldReturnFalse()
    {
        var orders = new List<Order>().AsQueryable();
        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(orders).Object);

        var result = await _handler.Handle(new UpdateOrderCommand { Id = Guid.NewGuid() }, CancellationToken.None);

        result.ShouldBeFalse();
    }

    [Test]
    public void UpdateOrder_WhenOrderIsPaid_ShouldThrowValidationException()
    {
        var orderId = Guid.NewGuid();
        var existingOrder = new Order
        {
            Id = orderId,
            IsPaid = true,
            Status = OrderStatus.Preparing
        };
        var orders = new List<Order> { existingOrder }.AsQueryable();
        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(orders).Object);

        var command = new UpdateOrderCommand
        {
            Id = orderId,
            Items = new List<OrderItemDto>
            {
                new() { ProductId = Guid.NewGuid(), Quantity = 1, UnitPrice = 50000 }
            }
        };

        var ex = Should.Throw<ValidationException>(() => _handler.Handle(command, CancellationToken.None));
        ex.Errors.ShouldContainKey("Order");
        ex.Errors["Order"].ShouldContain("Cannot modify an order that has already been paid, completed, or cancelled.");
    }

    [Test]
    [TestCase(OrderStatus.Completed)]
    [TestCase(OrderStatus.Cancelled)]
    public void UpdateOrder_WhenOrderIsSettledStatus_ShouldThrowValidationException(OrderStatus status)
    {
        var orderId = Guid.NewGuid();
        var existingOrder = new Order
        {
            Id = orderId,
            IsPaid = false,
            Status = status
        };
        var orders = new List<Order> { existingOrder }.AsQueryable();
        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(orders).Object);

        var command = new UpdateOrderCommand
        {
            Id = orderId,
            Items = new List<OrderItemDto>
            {
                new() { ProductId = Guid.NewGuid(), Quantity = 1, UnitPrice = 50000 }
            }
        };

        var ex = Should.Throw<ValidationException>(() => _handler.Handle(command, CancellationToken.None));
        ex.Errors.ShouldContainKey("Order");
    }

    [Test]
    public void UpdateOrder_WhenRequestedExtraIsUnavailable_ShouldThrowValidationException()
    {
        var orderId = Guid.NewGuid();
        var extraId = Guid.NewGuid();
        var existingOrder = new Order
        {
            Id = orderId,
            IsPaid = false,
            Status = OrderStatus.Pending
        };
        var unavailableExtra = new Extra
        {
            Id = extraId,
            Name = "سیروپ کارامل",
            Price = 15000,
            IsAvailable = false,
            IsDeleted = false
        };

        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(new List<Order> { existingOrder }.AsQueryable()).Object);
        _context.Setup(c => c.Extras).Returns(CreateMockDbSet(new List<Extra> { unavailableExtra }.AsQueryable()).Object);

        var command = new UpdateOrderCommand
        {
            Id = orderId,
            Items = new List<OrderItemDto>
            {
                new()
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 1,
                    UnitPrice = 50000,
                    ExtraIds = new List<Guid> { extraId }
                }
            }
        };

        var ex = Should.Throw<ValidationException>(() => _handler.Handle(command, CancellationToken.None));
        ex.Errors.ShouldContainKey("Items[0].Extras");
        ex.Errors["Items[0].Extras"][0].ShouldContain("is currently not available");
    }

    [Test]
    public void UpdateOrder_WhenRequestedExtraNotFound_ShouldThrowValidationException()
    {
        var orderId = Guid.NewGuid();
        var missingExtraId = Guid.NewGuid();
        var existingOrder = new Order
        {
            Id = orderId,
            IsPaid = false,
            Status = OrderStatus.Pending
        };

        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(new List<Order> { existingOrder }.AsQueryable()).Object);
        _context.Setup(c => c.Extras).Returns(CreateMockDbSet(new List<Extra>().AsQueryable()).Object);

        var command = new UpdateOrderCommand
        {
            Id = orderId,
            Items = new List<OrderItemDto>
            {
                new()
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 1,
                    UnitPrice = 50000,
                    ExtraIds = new List<Guid> { missingExtraId }
                }
            }
        };

        var ex = Should.Throw<ValidationException>(() => _handler.Handle(command, CancellationToken.None));
        ex.Errors.ShouldContainKey("Items[0].Extras");
        ex.Errors["Items[0].Extras"][0].ShouldContain("was not found");
    }

    [Test]
    public async Task UpdateOrder_WithValidExtrasAndDiscount_ShouldCalculateTotalAndFreezeSnapshot()
    {
        var orderId = Guid.NewGuid();
        var extra1Id = Guid.NewGuid();
        var extra2Id = Guid.NewGuid();

        var existingOrder = new Order
        {
            Id = orderId,
            IsPaid = false,
            Status = OrderStatus.Pending,
            DiscountType = DiscountType.Percentage,
            DiscountValue = 10m
        };

        var extra1 = new Extra { Id = extra1Id, Name = "سیروپ کارامل", Price = 12000, IsAvailable = true, IsDeleted = false };
        var extra2 = new Extra { Id = extra2Id, Name = "شات اضافه", Price = 18000, IsAvailable = true, IsDeleted = false };

        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(new List<Order> { existingOrder }.AsQueryable()).Object);
        _context.Setup(c => c.Extras).Returns(CreateMockDbSet(new List<Extra> { extra1, extra2 }.AsQueryable()).Object);

        var command = new UpdateOrderCommand
        {
            Id = orderId,
            DiscountType = DiscountType.Percentage,
            DiscountValue = 10m,
            Items = new List<OrderItemDto>
            {
                new()
                {
                    ProductId = Guid.NewGuid(),
                    ProductName = "لاته",
                    UnitPrice = 50000,
                    Quantity = 2,
                    ExtraIds = new List<Guid> { extra1Id, extra2Id }
                }
            }
        };

        var success = await _handler.Handle(command, CancellationToken.None);

        success.ShouldBeTrue();
        existingOrder.Items.Count.ShouldBe(1);

        var item = existingOrder.Items.First();
        item.Extras.Count.ShouldBe(2);

        // Snapshot Freezing Verification
        item.Extras[0].ExtraId.ShouldBe(extra1Id);
        item.Extras[0].Name.ShouldBe("سیروپ کارامل");
        item.Extras[0].Price.ShouldBe(12000);

        item.Extras[1].ExtraId.ShouldBe(extra2Id);
        item.Extras[1].Name.ShouldBe("شات اضافه");
        item.Extras[1].Price.ShouldBe(18000);

        // Price Formula Verification:
        // Extras sum = 12000 + 18000 = 30000
        // Item total unit price = 50000 + 30000 = 80000
        // Line total = 80000 * 2 = 160000
        item.ExtrasUnitPrice.ShouldBe(30000);
        item.TotalUnitPrice.ShouldBe(80000);
        item.LineTotal.ShouldBe(160000);

        // 10% discount on 160000 = 16000 discount -> total = 144000
        existingOrder.Total.ShouldBe(144000);

        // Snapshot Isolation Verification:
        // If master extra price changes in catalog later, the order item's snapshot price must not change
        extra1.Price = 99999;
        item.Extras[0].Price.ShouldBe(12000);
    }

    private static Mock<DbSet<T>> CreateMockDbSet<T>(IQueryable<T> data) where T : class
    {
        var mockSet = new Mock<DbSet<T>>();
        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.Provider)
            .Returns(new TestAsyncQueryProvider<T>(data.Provider));

        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

        return mockSet;
    }
}

internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal TestAsyncQueryProvider(IQueryProvider inner)
    {
        _inner = inner;
    }

    public IQueryable CreateQuery(Expression expression)
    {
        return new TestAsyncEnumerable<TEntity>(expression);
    }

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
    {
        return new TestAsyncEnumerable<TElement>(expression);
    }

    public object? Execute(Expression expression)
    {
        return _inner.Execute(expression);
    }

    public TResult Execute<TResult>(Expression expression)
    {
        return _inner.Execute<TResult>(expression);
    }

    public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
    {
        var expectedResultType = typeof(TResult).GetGenericArguments().FirstOrDefault() ?? typeof(TResult);
        var executionResult = typeof(IQueryProvider)
            .GetMethods()
            .First(m => m.Name == nameof(IQueryProvider.Execute) && m.IsGenericMethod)
            .MakeGenericMethod(expectedResultType)
            .Invoke(_inner, new object[] { expression });

        return (TResult)typeof(Task).GetMethod(nameof(Task.FromResult))!
            .MakeGenericMethod(expectedResultType)
            .Invoke(null, new[] { executionResult })!;
    }
}

internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(IEnumerable<T> enumerable)
        : base(enumerable)
    { }

    public TestAsyncEnumerable(Expression expression)
        : base(expression)
    { }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
    }

    IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
}

internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner;

    public TestAsyncEnumerator(IEnumerator<T> inner)
    {
        _inner = inner;
    }

    public ValueTask DisposeAsync()
    {
        _inner.Dispose();
        return ValueTask.CompletedTask;
    }

    public ValueTask<bool> MoveNextAsync()
    {
        return ValueTask.FromResult(_inner.MoveNext());
    }

    public T Current => _inner.Current;
}
