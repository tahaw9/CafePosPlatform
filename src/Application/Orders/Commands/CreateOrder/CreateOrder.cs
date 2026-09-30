using System;
using System.Collections.Generic;
using System.Linq;
using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using FluentValidation;
using FluentValidation.Results;
using ValidationException = CafePosBackend.Application.Common.Exceptions.ValidationException;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand : IRequest<Guid>
{
    // Nullable Guid for TableId, if null, means 'takeaway'
    public Guid? TableId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Total { get; set; }

    // Discount details
    public DiscountType? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }

    public PaymentMethod? PaymentMethod { get; set; }
    public bool? IsPaid { get; set; }
    // Navigation property
    public IEnumerable<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
}

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must have at least one item.")
            .Must(items => items != null && items.All(item => item.Quantity > 0)).WithMessage("Each order item must have a quantity greater than zero.");
        RuleFor(x => x.Total)
            .GreaterThanOrEqualTo(0).WithMessage("Total must be greater than or equal to zero.");
    }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Timezone calculation for business day
        var iranTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");
        var nowInIran = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, iranTimeZone);

        DateTime iranBusinessStart = nowInIran.Hour < 6
            ? nowInIran.Date.AddDays(-1).AddHours(6)
            : nowInIran.Date.AddHours(6);

        DateTime iranBusinessEnd = iranBusinessStart.AddDays(1);

        DateTimeOffset utcStart = TimeZoneInfo.ConvertTimeToUtc(iranBusinessStart, iranTimeZone);
        DateTimeOffset utcEnd = TimeZoneInfo.ConvertTimeToUtc(iranBusinessEnd, iranTimeZone);

        // 2. Eagerly load targeted Product entities and their respective active Variants
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Include(p => p.Variants)
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var validationFailures = new List<ValidationFailure>();
        var orderItems = new List<OrderItem>();

        int itemIndex = 0;
        foreach (var item in request.Items)
        {
            var itemPrefix = $"Items[{itemIndex}]";

            if (!products.TryGetValue(item.ProductId, out var product))
            {
                validationFailures.Add(new ValidationFailure($"{itemPrefix}.ProductId", $"Product with ID '{item.ProductId}' was not found."));
                itemIndex++;
                continue;
            }

            if (item.ProductVariantId.HasValue && item.ProductVariantId.Value != Guid.Empty)
            {
                var variantId = item.ProductVariantId.Value;
                var variant = product.Variants.FirstOrDefault(v => v.Id == variantId);

                if (variant == null)
                {
                    validationFailures.Add(new ValidationFailure(
                        $"{itemPrefix}.ProductVariantId",
                        $"The specified variant '{variantId}' does not belong to product '{product.Name}' ({product.Id}) or does not exist."));
                    itemIndex++;
                    continue;
                }

                if (!product.IsAvailable)
                {
                    validationFailures.Add(new ValidationFailure(
                        $"{itemPrefix}.ProductId",
                        $"Product '{product.Name}' is currently not available."));
                    itemIndex++;
                    continue;
                }

                if (!variant.IsAvailable)
                {
                    validationFailures.Add(new ValidationFailure(
                        $"{itemPrefix}.ProductVariantId",
                        $"Product variant '{variant.Name}' for product '{product.Name}' is currently not available."));
                    itemIndex++;
                    continue;
                }

                // Capture immutable snapshot
                orderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ProductVariantId = variant.Id,
                    ProductName = product.Name,
                    VariantName = variant.Name,
                    UnitPrice = variant.Price,
                    Quantity = item.Quantity,
                    Note = item.Note
                });
            }
            else
            {
                if (!product.IsAvailable)
                {
                    validationFailures.Add(new ValidationFailure(
                        $"{itemPrefix}.ProductId",
                        $"Product '{product.Name}' is currently not available."));
                    itemIndex++;
                    continue;
                }

                // Capture immutable snapshot for simple product
                orderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ProductVariantId = null,
                    ProductName = product.Name,
                    VariantName = null,
                    UnitPrice = product.Price,
                    Quantity = item.Quantity,
                    Note = item.Note
                });
            }

            itemIndex++;
        }

        if (validationFailures.Count > 0)
        {
            throw new ValidationException(validationFailures);
        }

        // 3. Deterministic total computation
        decimal calculatedSubtotal = orderItems.Sum(x => x.LineTotal);
        decimal calculatedTotal = calculatedSubtotal;

        if (request.DiscountType.HasValue && request.DiscountValue.HasValue && request.DiscountValue.Value > 0)
        {
            if (request.DiscountType.Value == DiscountType.Percentage)
            {
                var discountAmount = calculatedSubtotal * (request.DiscountValue.Value / 100m);
                calculatedTotal = Math.Max(0, calculatedSubtotal - discountAmount);
            }
            else if (request.DiscountType.Value == DiscountType.Amount)
            {
                calculatedTotal = Math.Max(0, calculatedSubtotal - request.DiscountValue.Value);
            }
        }

        decimal finalTotal = request.Total > 0 ? request.Total : calculatedTotal;

        // 4. Persistence within execution strategy and transaction
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var lastOrderCode = await _context.Orders
                    .Where(o => o.Created >= utcStart && o.Created < utcEnd)
                    .Select(o => (long?)o.OrderCode)
                    .MaxAsync(cancellationToken) ?? 0;

                var entity = new Order
                {
                    Created = DateTimeOffset.UtcNow,
                    TableId = request.TableId,
                    Status = request.Status,
                    Total = finalTotal,
                    DiscountType = request.DiscountType,
                    DiscountValue = request.DiscountType != null ? request.DiscountValue : null,
                    OrderCode = lastOrderCode + 1,
                    PaymentMethod = request.PaymentMethod,
                    IsPaid = request.IsPaid ?? false,
                    Id = Guid.NewGuid(),
                    Items = orderItems,
                };

                await _context.Orders.AddAsync(entity, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return entity.Id;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        });
    }
}
