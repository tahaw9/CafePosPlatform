using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Orders.Queries.GetOrderById;
using CafePosBackend.Application.Orders.Queries.GetOrders;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using CafePosBackend.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Orders;

public class GetOrdersWithExtrasQueryTests
{
    private Mock<IApplicationDbContext> _context = null!;
    private IMapper _mapper = null!;

    [SetUp]
    public void SetUp()
    {
        _context = new Mock<IApplicationDbContext>();

        var loggerFactory = LoggerFactory.Create(b => b.SetMinimumLevel(LogLevel.Debug));
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddMaps(typeof(IApplicationDbContext).Assembly);
        }, loggerFactory: loggerFactory);
        _mapper = config.CreateMapper();
    }

    [Test]
    public async Task GetOrdersQuery_WithExtras_ShouldSuccessfullyMapToOrderDtos()
    {
        // Arrange
        var orderTime = DateTimeOffset.UtcNow;

        var extraId1 = Guid.NewGuid();
        var extraId2 = Guid.NewGuid();

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderCode = 1001,
            Status = OrderStatus.Preparing,
            Total = 175000m,
            IsPaid = false,
            Created = orderTime,
            LastModified = orderTime,
            Items = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = Guid.NewGuid(),
                    ProductName = "Latte",
                    UnitPrice = 80000m,
                    Quantity = 2,
                    Extras = new List<OrderItemExtra>
                    {
                        new OrderItemExtra { ExtraId = extraId1, Name = "Caramel Syrup", Price = 15000m },
                        new OrderItemExtra { ExtraId = extraId2, Name = "Extra Shot", Price = 20000m }
                    }
                }
            }
        };

        var orders = new List<Order> { order }.AsQueryable();
        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(orders).Object);

        var handler = new GetOrdersQueryHandler(_context.Object, _mapper);

        // Act
        var result = (await handler.Handle(new GetOrdersQuery(), CancellationToken.None)).ToList();

        // Assert
        result.ShouldNotBeNull();
        result.Count.ShouldBe(1);

        var orderDto = result[0];
        orderDto.Id.ShouldBe(order.Id);
        orderDto.OrderCode.ShouldBe(1001);
        orderDto.Items.Count().ShouldBe(1);

        var itemDto = orderDto.Items.First();
        itemDto.ProductName.ShouldBe("Latte");
        itemDto.UnitPrice.ShouldBe(80000m);
        itemDto.Quantity.ShouldBe(2);

        // Verify Extras mapping
        itemDto.Extras.ShouldNotBeNull();
        itemDto.Extras.Count.ShouldBe(2);
        itemDto.Extras[0].ExtraId.ShouldBe(extraId1);
        itemDto.Extras[0].Name.ShouldBe("Caramel Syrup");
        itemDto.Extras[0].Price.ShouldBe(15000m);
        itemDto.Extras[1].ExtraId.ShouldBe(extraId2);
        itemDto.Extras[1].Name.ShouldBe("Extra Shot");
        itemDto.Extras[1].Price.ShouldBe(20000m);

        // Verify ExtraIds
        itemDto.ExtraIds.ShouldNotBeNull();
        itemDto.ExtraIds.Count.ShouldBe(2);
        itemDto.ExtraIds.ShouldContain(extraId1);
        itemDto.ExtraIds.ShouldContain(extraId2);

        // Verify Calculated properties on OrderItemDto
        itemDto.ExtrasUnitPrice.ShouldBe(35000m); // 15000 + 20000
        itemDto.TotalUnitPrice.ShouldBe(115000m); // 80000 + 35000
        itemDto.LineTotal.ShouldBe(230000m);      // 115000 * 2
    }

    [Test]
    public async Task GetOrderByIdQuery_WithExtras_ShouldSuccessfullyMapToOrderDto()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var extraId = Guid.NewGuid();

        var order = new Order
        {
            Id = orderId,
            OrderCode = 1002,
            Status = OrderStatus.Completed,
            Total = 95000m,
            IsPaid = true,
            Created = DateTimeOffset.UtcNow,
            LastModified = DateTimeOffset.UtcNow,
            Items = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = Guid.NewGuid(),
                    ProductName = "Americano",
                    UnitPrice = 70000m,
                    Quantity = 1,
                    Extras = new List<OrderItemExtra>
                    {
                        new OrderItemExtra { ExtraId = extraId, Name = "Hazelnut Syrup", Price = 25000m }
                    }
                }
            }
        };

        var orders = new List<Order> { order }.AsQueryable();
        _context.Setup(c => c.Orders).Returns(CreateMockDbSet(orders).Object);

        var handler = new GetOrderByIdQueryHandler(_context.Object, _mapper);

        // Act
        var result = await handler.Handle(new GetOrderByIdQuery { Id = orderId }, CancellationToken.None);

        // Assert
        result.ShouldNotBeNull();
        result.Id.ShouldBe(orderId);
        result.Items.Count().ShouldBe(1);

        var item = result.Items.First();
        item.Extras.Count.ShouldBe(1);
        item.Extras[0].ExtraId.ShouldBe(extraId);
        item.Extras[0].Name.ShouldBe("Hazelnut Syrup");
        item.Extras[0].Price.ShouldBe(25000m);
        item.TotalUnitPrice.ShouldBe(95000m);
        item.LineTotal.ShouldBe(95000m);
    }

    private static Mock<DbSet<T>> CreateMockDbSet<T>(IQueryable<T> data) where T : class
    {
        var mockSet = new Mock<DbSet<T>>();

        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new QueryTestAsyncEnumerator<T>(data.GetEnumerator()));

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.Provider)
            .Returns(new QueryTestAsyncQueryProvider<T>(data.Provider));

        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

        return mockSet;
    }
}

internal class QueryTestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal QueryTestAsyncQueryProvider(IQueryProvider inner)
    {
        _inner = inner;
    }

    public IQueryable CreateQuery(Expression expression)
    {
        return new QueryTestAsyncEnumerable<TEntity>(expression);
    }

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
    {
        return new QueryTestAsyncEnumerable<TElement>(expression);
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

internal class QueryTestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public QueryTestAsyncEnumerable(IEnumerable<T> enumerable)
        : base(enumerable)
    { }

    public QueryTestAsyncEnumerable(Expression expression)
        : base(expression)
    { }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        return new QueryTestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
    }

    IQueryProvider IQueryable.Provider => new QueryTestAsyncQueryProvider<T>(this);
}

internal class QueryTestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner;

    public QueryTestAsyncEnumerator(IEnumerator<T> inner)
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
