using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using CafePosBackend.Domain.ValueObjects;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ValidationException = CafePosBackend.Application.Common.Exceptions.ValidationException;

namespace CafePosBackend.Application.Orders.Commands.UpdateOrder;

public record UpdateOrderCommand : IRequest<bool>
{
    public Guid Id { get; init; }
    public Guid? TableId { get; init; }
    public OrderStatus Status { get; init; }
    public decimal Total { get; init; }
    public DiscountType? DiscountType { get; init; }
    public decimal? DiscountValue { get; init; }
    public PaymentMethod? PaymentMethod { get; init; }
    public bool? IsPaid { get; init; }
    public IEnumerable<OrderItemDto> Items { get; init; } = new List<OrderItemDto>();
}

public class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
{
    public UpdateOrderCommandValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must have at least one item.")
            .Must(items => items.All(item => item.Quantity > 0)).WithMessage("Each order item must have a quantity greater than zero.");
        RuleFor(x => x.Total)
            .GreaterThanOrEqualTo(0).WithMessage("Total must be greater than or equal to zero.");
    }
}

public class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateOrderCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return false;
        }

        // Settled Order Guard: cannot modify settled orders
        if (entity.IsPaid || entity.Status == OrderStatus.Completed || entity.Status == OrderStatus.Cancelled)
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure("Order", "Cannot modify an order that has already been paid, completed, or cancelled.")
            });
        }

        // Batch query and validate requested extras (Zero N+1)
        var requestedExtraIds = request.Items
            .SelectMany(i => (i.ExtraIds ?? Enumerable.Empty<Guid>())
                .Concat(i.Extras != null ? i.Extras.Select(e => e.ExtraId) : Enumerable.Empty<Guid>()))
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        var extrasDict = new Dictionary<Guid, Extra>();
        if (requestedExtraIds.Count > 0)
        {
            extrasDict = await _context.Extras
                .Where(e => requestedExtraIds.Contains(e.Id) && !e.IsDeleted)
                .ToDictionaryAsync(e => e.Id, cancellationToken);

            var validationFailures = new List<ValidationFailure>();
            int itemIndex = 0;
            foreach (var itemDto in request.Items)
            {
                var itemExtraIds = (itemDto.ExtraIds ?? Enumerable.Empty<Guid>())
                    .Concat(itemDto.Extras != null ? itemDto.Extras.Select(e => e.ExtraId) : Enumerable.Empty<Guid>())
                    .Where(id => id != Guid.Empty)
                    .Distinct()
                    .ToList();

                foreach (var extraId in itemExtraIds)
                {
                    if (!extrasDict.TryGetValue(extraId, out var extra))
                    {
                        validationFailures.Add(new ValidationFailure(
                            $"Items[{itemIndex}].Extras",
                            $"Extra with ID '{extraId}' was not found."));
                        continue;
                    }

                    if (!extra.IsAvailable)
                    {
                        validationFailures.Add(new ValidationFailure(
                            $"Items[{itemIndex}].Extras",
                            $"Extra '{extra.Name}' is currently not available."));
                    }
                }
                itemIndex++;
            }

            if (validationFailures.Count > 0)
            {
                throw new ValidationException(validationFailures);
            }
        }

        // Update basic fields
        entity.TableId = request.TableId;
        entity.Status = request.Status;
        entity.DiscountType = request.DiscountType;
        entity.DiscountValue = request.DiscountType != null ? request.DiscountValue : null;
        entity.PaymentMethod = request.PaymentMethod;
        entity.IsPaid = request.IsPaid ?? false;

        // Rebuild order items with frozen extras snapshot
        entity.Items.Clear();
        foreach (var itemDto in request.Items)
        {
            var itemExtraIds = (itemDto.ExtraIds ?? Enumerable.Empty<Guid>())
                .Concat(itemDto.Extras != null ? itemDto.Extras.Select(e => e.ExtraId) : Enumerable.Empty<Guid>())
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            var frozenExtras = itemExtraIds.Select(id =>
            {
                var extra = extrasDict[id];
                return new OrderItemExtra(extra.Id, extra.Name, extra.Price);
            }).ToList();

            entity.Items.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                ProductVariantId = itemDto.ProductVariantId,
                ProductName = itemDto.ProductName,
                VariantName = itemDto.VariantName,
                UnitPrice = itemDto.UnitPrice,
                Quantity = itemDto.Quantity,
                Note = itemDto.Note,
                Extras = frozenExtras
            });
        }

        // Deterministic total calculation: Line Total = (UnitPrice + sum(Extra.Price)) * Quantity
        decimal calculatedSubtotal = entity.Items.Sum(x => x.LineTotal);
        decimal calculatedTotal = calculatedSubtotal;

        if (entity.DiscountType.HasValue && entity.DiscountValue.HasValue && entity.DiscountValue.Value > 0)
        {
            if (entity.DiscountType.Value == DiscountType.Percentage)
            {
                var discountAmount = calculatedSubtotal * (entity.DiscountValue.Value / 100m);
                calculatedTotal = Math.Max(0, calculatedSubtotal - discountAmount);
            }
            else if (entity.DiscountType.Value == DiscountType.Amount)
            {
                calculatedTotal = Math.Max(0, calculatedSubtotal - entity.DiscountValue.Value);
            }
        }

        entity.Total = calculatedTotal;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
